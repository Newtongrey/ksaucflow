/* KSUCflow LOCAL DEMO AUTHENTICATION
 * Demo only: credentials and profiles live in this browser's localStorage.
 * Do not use real passwords or confidential information. Not for production.
 */
(function () {
  'use strict';
  const USERS_KEY = 'ksucDemoProfiles';
  const SESSION_KEY = 'ksucSession';
  const DEFAULT_ADMIN = {
    id: 'demo-admin-001', full_name: 'KSUCflow Administrator',
    email: 'admin@ksuc.ac.ke', staff_number: 'DEMO-ADMIN',
    department: 'ICT Department', job_title: 'System Administrator',
    role: 'Administrator', active: true, password: 'DemoAdmin123!',
    created_at: new Date().toISOString(), demo: true
  };
  const STARTER_STAFF = [
    { id: 'demo-staff-001', full_name: 'Finance Demo User', email: 'finance.demo@ksuc.ac.ke', staff_number: 'DEMO-001', department: 'Finance Department', job_title: 'Finance Officer', role: 'Staff', active: true, password: 'DemoStaff123!', created_at: new Date().toISOString(), demo: true },
    { id: 'demo-staff-002', full_name: 'Registry Demo User', email: 'registry.demo@ksuc.ac.ke', staff_number: 'DEMO-002', department: 'Registry', job_title: 'Registry Officer', role: 'Staff', active: true, password: 'DemoStaff123!', created_at: new Date().toISOString(), demo: true },
    { id: 'demo-staff-003', full_name: 'ICT Demo User', email: 'ict.demo@ksuc.ac.ke', staff_number: 'DEMO-003', department: 'ICT Department', job_title: 'ICT Officer', role: 'Department Head', active: true, password: 'DemoStaff123!', created_at: new Date().toISOString(), demo: true }
  ];
  const DEPARTMENTS = ['ICT Department', 'Registry', 'Finance Department', 'Human Resource', 'Academic Affairs', 'Procurement', 'Library', 'Student Affairs', 'Administration', 'Schools and Departments'];

  function readUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || 'null');
      if (Array.isArray(users) && users.length) return users;
    } catch (_) {}
    const users = [DEFAULT_ADMIN].concat(STARTER_STAFF);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  }
  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  function normalizeRole(role) {
    const value = String(role || 'Staff').toLowerCase().replace(/[ _-]+/g, '');
    if (value === 'administrator' || value === 'admin') return 'Administrator';
    if (value === 'departmenthead' || value === 'hod') return 'Department Head';
    return 'Staff';
  }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; }
  }
  function setSession(user) {
    const safe = { id: user.id, name: user.full_name, email: user.email, role: normalizeRole(user.role), department: user.department || 'Unassigned', staffNumber: user.staff_number || '', jobTitle: user.job_title || '' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return safe;
  }
  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    const target = /admin/i.test(location.pathname) ? 'admin-login.html' : 'login.html';
    location.href = target;
  }
  window.KSUCflowDemo = { USERS_KEY, SESSION_KEY, DEPARTMENTS, readUsers, saveUsers, getSession, setSession, normalizeRole, signOut };
  readUsers();

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  let session = getSession();
  if (!['login.html', 'admin-login.html'].includes(page) && session) {
    const account = readUsers().find(item => String(item.id) === String(session.id) && item.active !== false);
    if (!account || normalizeRole(account.role) !== normalizeRole(session.role)) {
      localStorage.removeItem(SESSION_KEY);
      session = null;
    }
  }
  if (page === 'login.html' || page === 'admin-login.html') {
    const formId = page === 'admin-login.html' ? 'adminLoginForm' : 'loginForm';
    const errorId = page === 'admin-login.html' ? 'adminLoginError' : 'error';
    const emailId = page === 'admin-login.html' ? 'adminEmail' : 'email';
    const passwordId = page === 'admin-login.html' ? 'adminPassword' : 'password';
    const form = document.getElementById(formId);
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      const error = document.getElementById(errorId);
      error.textContent = '';
      const email = document.getElementById(emailId).value.trim().toLowerCase();
      const password = document.getElementById(passwordId).value;
      const user = readUsers().find(item => String(item.email).toLowerCase() === email && item.password === password && item.active !== false);
      if (!user) { error.textContent = 'Email/password is incorrect, or this demo account is inactive.'; return; }
      const wantsAdmin = page === 'admin-login.html';
      if (wantsAdmin && normalizeRole(user.role) !== 'Administrator') { error.textContent = 'This account is not an administrator. Use the Staff Portal.'; return; }
      if (!wantsAdmin && normalizeRole(user.role) === 'Administrator') { error.textContent = 'Use the Admin Portal to sign in with this account.'; return; }
      setSession(user);
      location.href = wantsAdmin ? 'admin.html' : 'index.html';
    });
    const showId = page === 'admin-login.html' ? 'showAdminPassword' : 'showPassword';
    const show = document.getElementById(showId);
    if (show) show.addEventListener('click', function () {
      const field = document.getElementById(passwordId);
      field.type = field.type === 'password' ? 'text' : 'password';
      show.textContent = field.type === 'password' ? 'Show' : 'Hide';
    });
    if (session && (page !== 'admin-login.html' || normalizeRole(session.role) === 'Administrator')) {
      // Keep the login form available for switching accounts; no automatic redirect.
    }
  } else if (page === 'admin.html') {
    if (!session || normalizeRole(session.role) !== 'Administrator') {
      location.replace('admin-login.html');
      return;
    }
  } else if (['index.html', 'documents.html', 'document-view.html'].includes(page)) {
    if (!session) {
      location.replace('login.html');
      return;
    }
  }
})();