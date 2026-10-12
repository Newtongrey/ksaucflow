'use strict';

const DEFAULT_SETTINGS = {
  title: 'KSUCflow',
  institution: 'KOITALEEL SAMOEI UNIVERSITY COLLEGE',
  primary: '#7D0000'
};

const byId = id => document.getElementById(id);
let profiles = [];
let departments = [];
let visibleProfiles = [];

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
  });
}

function displayDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function roleName(value) {
  return typeof window.ksucRoleName === 'function'
    ? window.ksucRoleName(value)
    : (String(value || 'Staff').toLowerCase() === 'administrator' ? 'Administrator' : String(value || 'Staff'));
}

function setCheck(id, message, state) {
  const dot = byId(id + 'Dot');
  const label = byId(id + 'Check');
  if (label) label.textContent = message;
  if (dot) {
    dot.classList.remove('ok', 'error');
    if (state) dot.classList.add(state);
  }
}

function showDirectoryError(message) {
  const banner = byId('directoryError');
  banner.textContent = message;
  banner.hidden = false;
}

function clearDirectoryError() {
  const banner = byId('directoryError');
  banner.textContent = '';
  banner.hidden = true;
}

function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('ksucAdminSettings') || 'null');
    if (saved && typeof saved === 'object') return { ...DEFAULT_SETTINGS, ...saved };
    // Migrate the old visual settings only. Old local user/password demo data is ignored.
    const legacy = JSON.parse(localStorage.getItem('routeflowAdminSettings') || 'null');
    if (legacy && typeof legacy === 'object') {
      const migrated = { ...DEFAULT_SETTINGS, title: legacy.title || DEFAULT_SETTINGS.title,
        institution: legacy.institution || DEFAULT_SETTINGS.institution,
        primary: legacy.primary || DEFAULT_SETTINGS.primary };
      localStorage.setItem('ksucAdminSettings', JSON.stringify(migrated));
      return migrated;
    }
  } catch (error) {
    console.warn('KSUCflow could not read saved portal settings.', error);
  }
  return { ...DEFAULT_SETTINGS };
}

function applySettings(settings) {
  byId('appName').value = settings.title;
  byId('institution').value = settings.institution;
  byId('primaryColor').value = /^#[0-9a-f]{6}$/i.test(settings.primary) ? settings.primary : '#7D0000';
  byId('colourValue').textContent = byId('primaryColor').value.toUpperCase();
  byId('brandName').textContent = settings.title;
  byId('mark').textContent = (settings.title.trim().charAt(0) || 'K').toUpperCase();
  document.documentElement.style.setProperty('--brand', byId('primaryColor').value);
  document.documentElement.style.setProperty('--brand-dark', byId('primaryColor').value);
}

function renderProfileDirectory() {
  const search = byId('profileSearch').value.trim().toLowerCase();
  const departmentId = byId('departmentFilter').value;
  const selectedRole = byId('roleFilter').value;

  visibleProfiles = profiles.filter(function (profile) {
    const name = profile.full_name || profile.name || '';
    const id = profile.id || '';
    const role = roleName(profile.role);
    const matchesSearch = !search || name.toLowerCase().includes(search) || id.toLowerCase().includes(search);
    const matchesDepartment = !departmentId || String(profile.department_id || '') === departmentId;
    const matchesRole = !selectedRole || role === selectedRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const tbody = byId('userRows');
  if (!visibleProfiles.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-message">No profiles match these filters.</td></tr>';
  } else {
    tbody.innerHTML = visibleProfiles.map(function (profile) {
      const name = profile.full_name || profile.name || 'Unnamed profile';
      const role = roleName(profile.role);
      const department = departments.find(function (item) {
        return String(item.id) === String(profile.department_id);
      });
      const departmentName = department ? department.name : 'Unassigned';
      const initials = name.trim().split(/\s+/).slice(0, 2).map(function (part) {
        return part.charAt(0);
      }).join('').toUpperCase() || 'U';
      const roleClass = role === 'Administrator' ? 'admin' : (role === 'Department Head' ? 'head' : '');
      const shortId = String(profile.id || '').length > 12
        ? String(profile.id).slice(0, 8) + '…' + String(profile.id).slice(-4)
        : String(profile.id || '—');

      return '<tr>' +
        '<td><div class="profile-name"><span class="profile-avatar">' + escapeHtml(initials) + '</span><span><strong>' +
        escapeHtml(name) + '</strong><small title="' + escapeHtml(profile.id || '') + '">' + escapeHtml(shortId) + '</small></span></div></td>' +
        '<td>' + escapeHtml(departmentName) + '</td>' +
        '<td><span class="role-pill ' + roleClass + '">' + escapeHtml(role) + '</span></td>' +
        '<td>' + escapeHtml(displayDate(profile.created_at)) + '</td>' +
        '<td><button class="copy-button" type="button" data-copy-id="' + escapeHtml(profile.id || '') + '">Copy ID</button></td>' +
        '</tr>';
    }).join('');
  }

  byId('directoryCount').textContent = 'Showing ' + visibleProfiles.length + ' of ' + profiles.length + ' profiles';
  byId('totalUsers').textContent = profiles.length;
  byId('activeUsers').textContent = profiles.filter(function (profile) {
    return roleName(profile.role) !== 'Administrator';
  }).length;
  byId('adminUsers').textContent = profiles.filter(function (profile) {
    return roleName(profile.role) === 'Administrator';
  }).length;

  let localDocuments = 0;
  try {
    const stored = JSON.parse(localStorage.getItem('ksucDocuments') || '[]');
    localDocuments = Array.isArray(stored) ? stored.length : 0;
  } catch (_) {}
  byId('documentTotal').textContent = localDocuments;
}

function renderDepartmentFilter() {
  const select = byId('departmentFilter');
  const selected = select.value;
  select.innerHTML = '<option value="">All departments</option>' + departments.map(function (department) {
    return '<option value="' + escapeHtml(department.id) + '">' + escapeHtml(department.name) + '</option>';
  }).join('');
  if (departments.some(function (department) { return String(department.id) === selected; })) {
    select.value = selected;
  }
}

async function loadDirectory() {
  clearDirectoryError();
  byId('userRows').innerHTML = '<tr><td colspan="5" class="table-message">Loading profiles from Supabase…</td></tr>';
  setCheck('db', 'Querying profiles and departments…', null);

  try {
    const results = await Promise.all([
      window.ksucSupabase.from('profiles').select('id,full_name,department_id,role,created_at').order('full_name'),
      window.ksucSupabase.from('departments').select('id,name').order('name')
    ]);

    if (results[0].error) throw results[0].error;
    profiles = Array.isArray(results[0].data) ? results[0].data : [];
    if (results[1].error) {
      console.warn('KSUCflow could not load departments.', results[1].error);
      departments = [];
      setCheck('db', 'Profiles loaded; department lookup is unavailable.', 'error');
    } else {
      departments = Array.isArray(results[1].data) ? results[1].data : [];
      setCheck('db', 'Connected · ' + profiles.length + ' profiles loaded.', 'ok');
    }

    renderDepartmentFilter();
    renderProfileDirectory();
  } catch (error) {
    console.error('KSUCflow profile directory failed:', error);
    profiles = [];
    departments = [];
    renderDepartmentFilter();
    renderProfileDirectory();
    setCheck('db', 'Profile query failed.', 'error');
    showDirectoryError('The profile directory could not be loaded: ' +
      (error && error.message ? error.message : 'Unknown database error') +
      '. Check the profiles table SELECT policy for administrators.');
  }
}

function showToast(message) {
  let toast = byId('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'notice';
    toast.style.position = 'fixed';
    toast.style.right = '20px';
    toast.style.bottom = '20px';
    toast.style.zIndex = '10000';
    toast.style.maxWidth = 'min(440px, calc(100vw - 40px))';
    toast.style.boxShadow = '0 8px 28px rgba(0,0,0,.12)';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(window.ksucAdminToastTimer);
  window.ksucAdminToastTimer = setTimeout(function () {
    toast.hidden = true;
  }, 2600);
}

async function signOut() {
  const button = byId('signOut');
  button.disabled = true;
  button.textContent = 'Signing out…';
  try {
    const result = await window.ksucSupabase.auth.signOut();
    if (result.error) throw result.error;
  } catch (error) {
    console.error('KSUCflow sign-out warning:', error);
  } finally {
    localStorage.removeItem('ksucSession');
    window.location.replace(new URL('/admin-login.html', window.location.origin).href);
  }
}


/* =========================================================
   REPORTS & CSV EXPORT
   Profile data comes from Supabase. Documents and activity
   remain browser-local until the shared workflow migration.
========================================================= */
let currentReportRows = [];
let currentReportColumns = [];

function readLocalArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (_) {
    return [];
  }
}

function reportDateValue(row, type) {
  const value = type === 'profiles'
    ? row.created_at
    : (type === 'activity' ? (row.date || row.createdAt) : row.createdAt);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function csvCell(value) {
  let text = String(value == null ? '' : value);
  // Prevent spreadsheet formula execution when a CSV is opened in Excel.
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function renderReport() {
  const type = byId('reportType').value;
  const fromValue = byId('reportFrom').value;
  const toValue = byId('reportTo').value;
  const fromDate = fromValue ? new Date(fromValue + 'T00:00:00') : null;
  const toDate = toValue ? new Date(toValue + 'T23:59:59.999') : null;
  let rows = [];
  let columns = [];

  if (type === 'profiles') {
    rows = profiles.map(profile => {
      const department = departments.find(item => String(item.id) === String(profile.department_id));
      return {
        name: profile.full_name || profile.name || 'Unnamed profile',
        profile_id: profile.id || '',
        email: profile.email || '',
        department: department ? department.name : 'Unassigned',
        role: roleName(profile.role),
        created_at: profile.created_at || ''
      };
    });
    columns = [
      ['name', 'Name'], ['profile_id', 'Profile ID'], ['email', 'Email'],
      ['department', 'Department'], ['role', 'Role'], ['created_at', 'Created']
    ];
  } else if (type === 'activity') {
    rows = readLocalArray('ksucActivity').map(item => ({
      date: item.date || '', action: item.action || '',
      detail: item.detail || '', user: item.user || '',
      department: item.department || '', type: item.type || ''
    }));
    columns = [
      ['date', 'Date'], ['action', 'Action'], ['detail', 'Detail'],
      ['user', 'User'], ['department', 'Department'], ['type', 'Type']
    ];
  } else {
    rows = readLocalArray('ksucDocuments').map(item => ({
      ref: item.ref || '', title: item.title || item.subject || '',
      origin: item.origin || '', destination: item.destination || '',
      current_office: item.currentOffice || '', status: item.status || '',
      registered_by: item.registeredBy || '', created_at: item.createdAt || '',
      attachment: item.attachmentName || ''
    }));
    columns = [
      ['ref', 'Reference'], ['title', 'Subject'], ['origin', 'Origin'],
      ['destination', 'Destination'], ['current_office', 'Current office'],
      ['status', 'Status'], ['registered_by', 'Registered by'],
      ['created_at', 'Created'], ['attachment', 'Attachment']
    ];
  }

  const dateKey = type === 'profiles' ? 'created_at' : (type === 'activity' ? 'date' : 'created_at');
  if (fromDate || toDate) {
    rows = rows.filter(row => {
      const raw = row[dateKey];
      if (!raw) return false;
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) return false;
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    });
  }

  currentReportRows = rows;
  currentReportColumns = columns;
  const head = byId('reportHead');
  const body = byId('reportRows');
  head.innerHTML = '<tr>' + columns.map(col => '<th>' + escapeHtml(col[1]) + '</th>').join('') + '</tr>';

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="' + columns.length + '" class="table-message">No records match this report and date range.</td></tr>';
  } else {
    const preview = rows.slice(0, 25);
    body.innerHTML = preview.map(row => '<tr>' + columns.map(col =>
      '<td>' + escapeHtml(row[col[0]] || '—') + '</td>'
    ).join('') + '</tr>').join('');
    if (rows.length > preview.length) {
      body.insertAdjacentHTML('beforeend', '<tr><td class="table-message" colspan="' + columns.length + '">Showing first 25 of ' + rows.length + ' records. Export CSV for the complete result.</td></tr>');
    }
  }

  const label = type === 'profiles' ? 'Supabase user profiles'
    : (type === 'activity' ? 'browser-local activity entries' : 'browser-local document records');
  byId('reportSummary').textContent = rows.length + ' records in ' + label +
    (fromValue || toValue ? ' for the selected date range.' : '.');
}

function exportReportCsv() {
  if (!currentReportColumns.length) {
    showToast('There are no report columns to export.');
    return;
  }
  const lines = [
    currentReportColumns.map(col => csvCell(col[1])).join(','),
    ...currentReportRows.map(row => currentReportColumns.map(col => csvCell(row[col[0]])).join(','))
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = 'KSUCflow-' + byId('reportType').value + '-report-' + date + '.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast('CSV report exported.');
}

async function initialiseAdmin() {
  applySettings(getSettings());
  setCheck('auth', 'Verifying administrator session…', null);

  let currentProfile = null;
  try {
    currentProfile = await window.ksucAuthReady;
  } catch (error) {
    console.error('KSUCflow auth guard did not complete.', error);
  }

  if (!currentProfile || currentProfile.role !== 'Administrator') {
    setCheck('auth', 'Administrator session not verified.', 'error');
    return;
  }

  byId('adminName').textContent = currentProfile.name || currentProfile.email || 'Administrator';
  byId('adminRole').textContent = currentProfile.department
    ? 'Administrator · ' + currentProfile.department
    : 'System administrator';
  byId('adminAvatar').textContent = (currentProfile.name || currentProfile.email || 'A')
    .trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
  setCheck('auth', 'Signed in as an administrator.', 'ok');
  await loadDirectory();
  renderReport();
}

byId('reportType').addEventListener('change', renderReport);
byId('reportFrom').addEventListener('change', renderReport);
byId('reportTo').addEventListener('change', renderReport);
byId('refreshReports').addEventListener('click', async function () {
  await loadDirectory();
  renderReport();
});
byId('exportReport').addEventListener('click', exportReportCsv);
byId('profileSearch').addEventListener('input', renderProfileDirectory);
byId('departmentFilter').addEventListener('change', renderProfileDirectory);
byId('roleFilter').addEventListener('change', renderProfileDirectory);
byId('refreshProfiles').addEventListener('click', loadDirectory);
byId('primaryColor').addEventListener('input', function () {
  const value = byId('primaryColor').value.toUpperCase();
  byId('colourValue').textContent = value;
  document.documentElement.style.setProperty('--brand', value);
  document.documentElement.style.setProperty('--brand-dark', value);
});
byId('settingsForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const settings = {
    title: byId('appName').value.trim() || DEFAULT_SETTINGS.title,
    institution: byId('institution').value.trim() || DEFAULT_SETTINGS.institution,
    primary: byId('primaryColor').value.toUpperCase()
  };
  localStorage.setItem('ksucAdminSettings', JSON.stringify(settings));
  applySettings(settings);
  byId('settingsFeedback').textContent = 'Appearance saved in this browser.';
});
byId('resetSettings').addEventListener('click', function () {
  localStorage.removeItem('ksucAdminSettings');
  applySettings({ ...DEFAULT_SETTINGS });
  byId('settingsFeedback').textContent = 'Default appearance restored.';
});
byId('userRows').addEventListener('click', async function (event) {
  const button = event.target.closest('[data-copy-id]');
  if (!button) return;
  const id = button.getAttribute('data-copy-id');
  if (!id) return;
  try {
    await navigator.clipboard.writeText(id);
    showToast('Profile ID copied.');
  } catch (_) {
    showToast('Copy was blocked by the browser. Select the profile ID shown in the row instead.');
  }
});
byId('signOut').addEventListener('click', signOut);

initialiseAdmin();
