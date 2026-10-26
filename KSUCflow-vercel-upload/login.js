
'use strict';

(function () {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('error');
  const loginButton = loginForm?.querySelector('button[type="submit"]');
  const showPasswordButton = document.getElementById('showPassword');

  if (!loginForm || !loginError || !loginButton) {
    console.error('KSUCflow login form elements are missing.');
    return;
  }

  const USERS_KEY = 'ksucUsers';
  const SESSION_KEY = 'ksucSession';

  function getUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('Could not read KSUCflow users:', error);
      return [];
    }
  }

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const users = getUsers();

    if (users.length === 0) {
      loginError.textContent =
        'No local user accounts exist in this browser yet. Create an account in the Admin Panel first.';
      return;
    }

    const user = users.find(function (account) {
      return String(account.email || account.username || '')
        .trim().toLowerCase() === email;
    });

    if (!user || user.password !== password) {
      loginError.textContent = 'The username/email or password is incorrect.';
      return;
    }

    if (user.active === false || user.status === 'inactive') {
      loginError.textContent = 'This account is inactive. Contact the administrator.';
      return;
    }

    const role = String(user.role || '').trim();

    if (role.toLowerCase() === 'administrator') {
      loginError.textContent =
        'Administrators must sign in through the Admin Portal.';
      return;
    }

    const sessionUser = {
      id: user.id || user.email || user.username,
      name: user.name || user.fullName || user.username || user.email,
      email: user.email || '',
      username: user.username || user.email || '',
      role: role || 'Staff',
      department: user.department || '',
      loggedInAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      window.location.replace(
        new URL('/index.html', window.location.origin).href
      );
    } catch (error) {
      console.error('Could not save KSUCflow session:', error);
      loginError.textContent =
        'Unable to save your session in this browser. Check browser storage settings and try again.';
    }
  });

  if (showPasswordButton) {
    showPasswordButton.addEventListener('click', function (event) {
      const field = document.getElementById('password');
      const showing = field.type === 'password';
      field.type = showing ? 'text' : 'password';
      event.currentTarget.textContent = showing ? 'Hide' : 'Show';
    });
  }
})();
