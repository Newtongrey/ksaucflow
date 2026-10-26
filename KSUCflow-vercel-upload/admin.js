
'use strict';

/*
 * KSUCflow browser-only administrator dashboard.
 * Accounts, settings and records are stored in this browser.
 * This is a prototype, not a secure multi-user production system.
 */

const DEFAULT_SETTINGS = {
  title: 'KSUCflow',
  institution: 'KOITALEEL SAMOEI UNIVERSITY',
  primary: '#8A1C3A'
};

const byId = id => document.getElementById(id);
let profiles = [];
let departments = [];

function readArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function saveUsers() {
  localStorage.setItem('ksucUsers', JSON.stringify(profiles));
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  })[char]);
}

function roleName(value) {
  const role = String(value || 'Staff').toLowerCase().trim();
  if (['admin', 'administrator', 'system admin', 'super admin'].includes(role)) {
    return 'Administrator';
  }
  if (['hod', 'head of department', 'department head'].includes(role)) {
    return 'Department Head';
  }
  return 'Staff';
}

function displayDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-KE', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
}

function showToast(message) {
  let toast = byId('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'notice';
    toast.style.cssText =
      'position:fixed;right:20px;bottom:20px;z-index:10000;' +
      'max-width:min(440px,calc(100vw - 40px));box-shadow:0 8px 28px #0002';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(window.ksucAdminToastTimer);
  window.ksucAdminToastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3500);
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
  if (!banner) return;
  banner.textContent = message;
  banner.hidden = false;
}

function clearDirectoryError() {
  const banner = byId('directoryError');
  if (!banner) return;
  banner.textContent = '';
  banner.hidden = true;
}

function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('ksucAdminSettings') || 'null');
    if (saved && typeof saved === 'object') {
      const settings = { ...DEFAULT_SETTINGS, ...saved };
      if (['#7D0000', '#7d0000', '#5D0000', '#5d0000'].includes(settings.primary)) {
        settings.primary = DEFAULT_SETTINGS.primary;
        localStorage.setItem('ksucAdminSettings', JSON.stringify(settings));
      }
      return settings;
    }
    return { ...DEFAULT_SETTINGS };
  } catch (_) {
    return { ...DEFAULT_SETTINGS };
  }
}

function applySettings(settings) {
  if (byId('appName')) byId('appName').value = settings.title;
  if (byId('institution')) byId('institution').value = settings.institution;
  if (byId('primaryColor')) {
    byId('primaryColor').value =
      /^#[0-9a-f]{6}$/i.test(settings.primary)
        ? settings.primary : DEFAULT_SETTINGS.primary;
  }
  if (byId('colourValue')) {
    byId('colourValue').textContent = byId('primaryColor')?.value.toUpperCase() || '';
  }
  if (byId('brandName')) byId('brandName').textContent = settings.title;
  if (byId('mark')) {
    byId('mark').textContent = (settings.title.trim().charAt(0) || 'K').toUpperCase();
  }

  document.documentElement.style.setProperty('--brand', settings.primary);
  document.documentElement.style.setProperty('--brand-dark', settings.primary);
}

function loadLocalData() {
  profiles = readArray('ksucUsers');
  departments = readArray('ksucDepartments');

  if (!departments.length) {
    departments = [
      { id: 'registry', name: 'Registry' },
      { id: 'administration', name: 'Administration' },
      { id: 'academics', name: 'Academics' },
      { id: 'finance', name: 'Finance' },
      { id: 'admissions', name: 'Admissions' },
      { id: 'planning', name: 'Planning' },
      { id: 'ict', name: 'ICT' }
    ];
    localStorage.setItem('ksucDepartments', JSON.stringify(departments));
  }

  profiles = profiles.map(user => ({
    ...user,
    id: String(user.id || user.email || ('user-' + Date.now())),
    name: user.name || user.full_name || user.email || 'Unnamed user',
    full_name: user.full_name || user.name || '',
    email: String(user.email || '').trim().toLowerCase(),
    role: roleName(user.role),
    department_id: user.department_id || user.department || '',
    active: user.active !== false && user.status !== 'inactive',
    created_at: user.created_at || user.createdAt || new Date().toISOString()
  }));

  saveUsers();
}

function renderDepartmentFilter() {
  const filter = byId('departmentFilter');
  if (filter) {
    const selected = filter.value;
    filter.innerHTML = '<option value="">All departments</option>' +
      departments.map(department =>
        '<option value="' + escapeHtml(department.id) + '">' +
        escapeHtml(department.name) + '</option>'
      ).join('');
    filter.value = selected;
  }

  const invite = byId('inviteDepartment');
  if (invite) {
    const selected = invite.value;
    invite.innerHTML = '<option value="">Select department</option>' +
      departments.map(department =>
        '<option value="' + escapeHtml(department.id) + '">' +
        escapeHtml(department.name) + '</option>'
      ).join('');
    invite.value = selected;
  }
}

function renderProfileDirectory() {
  const search = (byId('profileSearch')?.value || '').trim().toLowerCase();
  const departmentId = byId('departmentFilter')?.value || '';
  const selectedRole = byId('roleFilter')?.value || '';

  const visible = profiles.filter(profile => {
    const name = profile.full_name || profile.name || '';
    const matchesSearch =
      !search ||
      name.toLowerCase().includes(search) ||
      String(profile.email || '').toLowerCase().includes(search) ||
      String(profile.id || '').toLowerCase().includes(search);

    const matchesDepartment = !departmentId ||
      String(profile.department_id || '') === departmentId;

    const matchesRole = !selectedRole || roleName(profile.role) === selectedRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const tbody = byId('userRows');
  if (tbody) {
    if (!visible.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="table-message">No accounts match these filters.</td></tr>';
    } else {
      tbody.innerHTML = visible.map(profile => {
        const name = profile.full_name || profile.name || profile.email;
        const department = departments.find(item =>
          String(item.id) === String(profile.department_id)
        );
        const departmentOptions =
          '<option value="">Unassigned</option>' +
          departments.map(item =>
            '<option value="' + escapeHtml(item.id) + '"' +
            (String(item.id) === String(profile.department_id) ? ' selected' : '') +
            '>' + escapeHtml(item.name) + '</option>'
          ).join('');

        const roleOptions = ['Staff', 'Department Head', 'Administrator']
          .map(role => '<option value="' + role + '"' +
            (roleName(profile.role) === role ? ' selected' : '') +
            '>' + role + '</option>').join('');

        const status = profile.active ? 'Active' : 'Inactive';

        return '<tr>' +
          '<td><div class="profile-name"><span class="profile-avatar">' +
          escapeHtml(name.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase()) +
          '</span><span><strong>' + escapeHtml(name) + '</strong><small>' +
          escapeHtml(profile.email) + '</small><small>' + status + '</small></span></div></td>' +
          '<td><select class="admin-inline-select" data-department-for="' +
          escapeHtml(profile.id) + '">' + departmentOptions + '</select></td>' +
          '<td><select class="admin-inline-select" data-role-for="' +
          escapeHtml(profile.id) + '">' + roleOptions + '</select></td>' +
          '<td>' + escapeHtml(displayDate(profile.created_at)) + '</td>' +
          '<td><div class="admin-row-actions">' +
          '<button class="copy-button" type="button" data-save-profile="' +
          escapeHtml(profile.id) + '">Save access</button>' +
          '<button class="copy-button" type="button" data-toggle-profile="' +
          escapeHtml(profile.id) + '">' + (profile.active ? 'Deactivate' : 'Activate') + '</button>' +
          '<button class="copy-button" type="button" data-copy-id="' +
          escapeHtml(profile.id) + '">Copy ID</button></div></td></tr>';
      }).join('');
    }
  }

  if (byId('directoryCount')) {
    byId('directoryCount').textContent =
      'Showing ' + visible.length + ' of ' + profiles.length + ' accounts';
  }
  if (byId('totalUsers')) byId('totalUsers').textContent = profiles.length;
  if (byId('activeUsers')) {
    byId('activeUsers').textContent = profiles.filter(user =>
      user.active && roleName(user.role) !== 'Administrator'
    ).length;
  }
  if (byId('adminUsers')) {
    byId('adminUsers').textContent = profiles.filter(user =>
      roleName(user.role) === 'Administrator'
    ).length;
  }
  if (byId('documentTotal')) {
    byId('documentTotal').textContent = readArray('ksucDocuments').length;
  }
}

function loadDirectory() {
  clearDirectoryError();
  loadLocalData();
  renderDepartmentFilter();
  renderProfileDirectory();
  setCheck('db', 'Loaded accounts from this browser.', 'ok');
}

function signOut() {
  localStorage.removeItem('ksucSession');
  window.location.replace('admin-login.html');
}

/* Reports and CSV export */
let currentReportRows = [];
let currentReportColumns = [];

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
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function renderReport() {
  const type = byId('reportType')?.value || 'documents';
  const fromValue = byId('reportFrom')?.value || '';
  const toValue = byId('reportTo')?.value || '';
  const fromDate = fromValue ? new Date(fromValue + 'T00:00:00') : null;
  const toDate = toValue ? new Date(toValue + 'T23:59:59.999') : null;

  let rows = [];
  let columns = [];

  if (type === 'profiles') {
    rows = profiles.map(profile => {
      const department = departments.find(item =>
        String(item.id) === String(profile.department_id)
      );
      return {
        name: profile.full_name || profile.name || '',
        profile_id: profile.id || '',
        email: profile.email || '',
        department: department ? department.name : 'Unassigned',
        role: roleName(profile.role),
        created_at: profile.created_at || '',
        status: profile.active ? 'Active' : 'Inactive'
      };
    });
    columns = [
      ['name', 'Name'], ['profile_id', 'Account ID'], ['email', 'Email'],
      ['department', 'Department'], ['role', 'Role'],
      ['status', 'Status'], ['created_at', 'Created']
    ];
  } else if (type === 'activity') {
    rows = readArray('ksucActivity').map(item => ({
      date: item.date || item.createdAt || '',
      action: item.action || '',
      detail: item.detail || '',
      user: item.user || '',
      department: item.department || '',
      type: item.type || ''
    }));
    columns = [
      ['date', 'Date'], ['action', 'Action'], ['detail', 'Detail'],
      ['user', 'User'], ['department', 'Department'], ['type', 'Type']
    ];
  } else {
    rows = readArray('ksucDocuments').map(item => ({
      ref: item.ref || '',
      title: item.title || item.subject || '',
      origin: item.origin || '',
      destination: item.destination || '',
      current_office: item.currentOffice || '',
      status: item.status || '',
      registered_by: item.registeredBy || '',
      created_at: item.createdAt || '',
      attachment: item.attachmentName || ''
    }));
    columns = [
      ['ref', 'Reference'], ['title', 'Subject'], ['origin', 'Origin'],
      ['destination', 'Destination'], ['current_office', 'Current office'],
      ['status', 'Status'], ['registered_by', 'Registered by'],
      ['created_at', 'Created'], ['attachment', 'Attachment']
    ];
  }

  if (fromDate || toDate) {
    const dateKey = type === 'activity' ? 'date' : 'created_at';
    rows = rows.filter(row => {
      const date = new Date(row[dateKey] || '');
      if (Number.isNaN(date.getTime())) return false;
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    });
  }

  currentReportRows = rows;
  currentReportColumns = columns;

  if (byId('reportHead')) {
    byId('reportHead').innerHTML =
      '<tr>' + columns.map(col => '<th>' + escapeHtml(col[1]) + '</th>').join('') + '</tr>';
  }

  if (byId('reportRows')) {
    if (!rows.length) {
      byId('reportRows').innerHTML =
        '<tr><td colspan="' + columns.length + '" class="table-message">No records found.</td></tr>';
    } else {
      byId('reportRows').innerHTML = rows.slice(0, 25).map(row =>
        '<tr>' + columns.map(col =>
          '<td>' + escapeHtml(row[col[0]] || '—') + '</td>'
        ).join('') + '</tr>'
      ).join('');
    }
  }

  if (byId('reportSummary')) {
    byId('reportSummary').textContent = rows.length +
      ' records loaded from this browser.';
  }
}

function exportReportCsv() {
  if (!currentReportColumns.length) {
    showToast('No report columns to export.');
    return;
  }

  const lines = [
    currentReportColumns.map(col => csvCell(col[1])).join(','),
    ...currentReportRows.map(row =>
      currentReportColumns.map(col => csvCell(row[col[0]])).join(',')
    )
  ];

  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'KSUCflow-report-' +
    new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast('CSV report exported.');
}

/* Create local staff accounts */
function inviteUser(event) {
  event.preventDefault();

  const feedback = byId('inviteFeedback');
  const submit = byId('inviteUserSubmit');
  const name = byId('inviteFullName')?.value.trim() || '';
  const email = (byId('inviteEmail')?.value || '').trim().toLowerCase();
  const departmentId = byId('inviteDepartment')?.value || '';
  const role = byId('inviteRole')?.value || 'Staff';

  if (!name || !email) {
    if (feedback) feedback.textContent = 'Enter the staff member’s name and email.';
    return;
  }

  if (profiles.some(user => String(user.email).toLowerCase() === email)) {
    if (feedback) feedback.textContent = 'An account with this email already exists.';
    return;
  }

  // Generate a temporary password for the administrator to share securely.
  const temporaryPassword = 'KSU-' +
    Math.random().toString(36).slice(2, 8).toUpperCase() + '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  profiles.push({
    id: 'user-' + Date.now(),
    name,
    full_name: name,
    email,
    password: temporaryPassword,
    role: roleName(role),
    department_id: departmentId,
    active: true,
    created_at: new Date().toISOString()
  });

  saveUsers();
  renderProfileDirectory();

  if (feedback) {
    feedback.style.color = '';
    feedback.textContent =
      'Account created for ' + email +
      '. Temporary password: ' + temporaryPassword +
      '. Copy it now and share it with the staff member.';
  }

  if (byId('inviteUserForm')) byId('inviteUserForm').reset();
  renderDepartmentFilter();
  showToast('Local staff account created.');
  renderReport();
}

function saveProfileAccess(id) {
  const profile = profiles.find(user => String(user.id) === String(id));
  if (!profile) return;

  const roleControl = document.querySelector('[data-role-for="' + CSS.escape(id) + '"]');
  const departmentControl = document.querySelector('[data-department-for="' + CSS.escape(id) + '"]');
  if (!roleControl || !departmentControl) return;

  profile.role = roleName(roleControl.value);
  profile.department_id = departmentControl.value;
  saveUsers();
  renderProfileDirectory();
  renderReport();
  showToast('Account access updated.');
}

function toggleProfile(id) {
  const profile = profiles.find(user => String(user.id) === String(id));
  if (!profile) return;

  const nextActive = !profile.active;
  const name = profile.full_name || profile.name || profile.email;

  if (!window.confirm((nextActive ? 'Reactivate ' : 'Deactivate ') + name + '?')) {
    return;
  }

  const session = JSON.parse(localStorage.getItem('ksucSession') || 'null');
  if (!nextActive && session && String(session.id) === String(profile.id)) {
    showToast('You cannot deactivate the account currently signed in.');
    return;
  }

  profile.active = nextActive;
  profile.status = nextActive ? 'active' : 'inactive';
  saveUsers();
  renderProfileDirectory();
  renderReport();
  showToast(nextActive ? 'Account activated.' : 'Account deactivated.');
}

async function copyAccountId(id) {
  try {
    await navigator.clipboard.writeText(id);
    showToast('Account ID copied.');
  } catch (_) {
    showToast('Copy was blocked by the browser.');
  }
}

function initialiseAdmin() {
  applySettings(getSettings());
  loadDirectory();

  let session = null;
  try {
    session = JSON.parse(localStorage.getItem('ksucSession') || 'null');
  } catch (_) {}

  if (!session || roleName(session.role) !== 'Administrator') {
    window.location.replace('admin-login.html');
    return;
  }

  if (byId('adminName')) {
    byId('adminName').textContent = session.name || session.email || 'Administrator';
  }
  if (byId('adminRole')) {
    byId('adminRole').textContent = session.department
      ? 'Administrator · ' + session.department
      : 'System administrator';
  }
  if (byId('adminAvatar')) {
    byId('adminAvatar').textContent =
      (session.name || session.email || 'A')
        .trim().split(/\s+/).slice(0, 2)
        .map(part => part.charAt(0)).join('').toUpperCase();
  }

  setCheck('auth', 'Signed in as an administrator.', 'ok');
  renderReport();
}

/* Wire up dashboard controls */
byId('reportType')?.addEventListener('change', renderReport);
byId('reportFrom')?.addEventListener('change', renderReport);
byId('reportTo')?.addEventListener('change', renderReport);
byId('refreshReports')?.addEventListener('click', renderReport);
byId('exportReport')?.addEventListener('click', exportReportCsv);
byId('inviteUserForm')?.addEventListener('submit', inviteUser);

byId('userRows')?.addEventListener('click', event => {
  const save = event.target.closest('[data-save-profile]');
  if (save) return saveProfileAccess(save.getAttribute('data-save-profile'));

  const toggle = event.target.closest('[data-toggle-profile]');
  if (toggle) return toggleProfile(toggle.getAttribute('data-toggle-profile'));

  const copy = event.target.closest('[data-copy-id]');
  if (copy) copyAccountId(copy.getAttribute('data-copy-id'));
});

byId('profileSearch')?.addEventListener('input', renderProfileDirectory);
byId('departmentFilter')?.addEventListener('change', renderProfileDirectory);
byId('roleFilter')?.addEventListener('change', renderProfileDirectory);
byId('refreshProfiles')?.addEventListener('click', loadDirectory);

byId('primaryColor')?.addEventListener('input', function () {
  const value = this.value.toUpperCase();
  if (byId('colourValue')) byId('colourValue').textContent = value;
  document.documentElement.style.setProperty('--brand', value);
  document.documentElement.style.setProperty('--brand-dark', value);
});

byId('settingsForm')?.addEventListener('submit', function (event) {
  event.preventDefault();
  const settings = {
    title: byId('appName')?.value.trim() || DEFAULT_SETTINGS.title,
    institution: byId('institution')?.value.trim() || DEFAULT_SETTINGS.institution,
    primary: byId('primaryColor')?.value.toUpperCase() || DEFAULT_SETTINGS.primary
  };
  localStorage.setItem('ksucAdminSettings', JSON.stringify(settings));
  applySettings(settings);
  if (byId('settingsFeedback')) {
    byId('settingsFeedback').textContent = 'Appearance saved in this browser.';
  }
});

byId('resetSettings')?.addEventListener('click', function () {
  localStorage.removeItem('ksucAdminSettings');
  applySettings({ ...DEFAULT_SETTINGS });
  if (byId('settingsFeedback')) {
    byId('settingsFeedback').textContent = 'Default appearance restored.';
  }
});

byId('signOut')?.addEventListener('click', signOut);

initialiseAdmin();
