
/* KSUCflow browser-only prototype session guard.
   This does not provide production-grade security.
*/
(function () {
  'use strict';

  const pageName =
    window.location.pathname.toLowerCase().split('/').filter(Boolean).pop()
    || 'index.html';

  const isAdminPage = pageName === 'admin.html';
  const isAdminLogin = pageName === 'admin-login.html';
  const isStaffLogin = pageName === 'login.html';
  const isLoginPage = isAdminLogin || isStaffLogin;

  function navigate(page) {
    window.location.replace(
      new URL('/' + page, window.location.origin).href
    );
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('ksucSession') || 'null');
    } catch (error) {
      return null;
    }
  }

  function normalizeRole(value) {
    const role = String(value || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .trim();

    if (['admin', 'administrator', 'system admin', 'super admin'].includes(role)) {
      return 'Administrator';
    }

    if (['department head', 'hod', 'head of department'].includes(role)) {
      return 'Department Head';
    }

    return 'Staff';
  }

  const session = getSession();

  if (isLoginPage) {
    if (session && session.id && session.email) {
      const role = normalizeRole(session.role);

      if (isAdminLogin && role === 'Administrator') {
        navigate('admin.html');
        return;
      }

      if (isStaffLogin && role !== 'Administrator') {
        navigate('index.html');
        return;
      }
    }

    document.documentElement.style.visibility = 'visible';
    return;
  }

  if (!session || !session.id || !session.email) {
    localStorage.removeItem('ksucSession');
    navigate(isAdminPage ? 'admin-login.html' : 'login.html');
    return;
  }

  const role = normalizeRole(session.role);

  if (isAdminPage && role !== 'Administrator') {
    navigate('index.html');
    return;
  }

  document.documentElement.style.visibility = 'visible';
})();
