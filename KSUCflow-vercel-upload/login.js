
/* KSUCflow local staff login.
   Prototype only: credentials are stored in this browser.
*/
(function () {
  'use strict';

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorBox = document.getElementById('error');
  const showPassword = document.getElementById('showPassword');

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    } else {
      alert(message);
    }
  }

  function hideError() {
    if (errorBox) {
      errorBox.textContent = '';
      errorBox.style.display = 'none';
    }
  }

  function readUsers() {
    try {
      const users = JSON.parse(
        localStorage.getItem('ksucUsers') || '[]'
      );
      return Array.isArray(users) ? users : [];
    } catch (error) {
      return [];
    }
  }

  if (showPassword && passwordInput) {
    showPassword.addEventListener('change', function () {
      passwordInput.type = this.checked ? 'text' : 'password';
    });
  }

  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideError();

    const email = String(emailInput.value || '')
      .trim()
      .toLowerCase();
    const password = String(passwordInput.value || '');

    if (!email || !password) {
      showError('Enter your email address and password.');
      return;
    }

    const user = readUsers().find(function (item) {
      return String(item.email || '').trim().toLowerCase() === email &&
        item.active !== false &&
        item.status !== 'inactive';
    });

    if (!user) {
      showError(
        'Account not found or inactive. Contact your administrator.'
      );
      return;
    }

    // Supports the local prototype's plain-text password field.
    // Do not use this method for a production system.
    if (String(user.password || '') !== password) {
      showError('Incorrect email or password.');
      return;
    }

    const role = String(user.role || 'Staff');
    const normalizedRole = role.toLowerCase();

    if (
      normalizedRole === 'admin' ||
      normalizedRole === 'administrator' ||
      normalizedRole === 'super admin'
    ) {
      showError(
        'Please use the administrator login page for this account.'
      );
      return;
    }

    const session = {
      id: user.id || user.email,
      email: user.email,
      name: user.name || user.full_name || user.email,
      role: role,
      department: user.department || '',
      signedInAt: new Date().toISOString()
    };

    localStorage.setItem('ksucSession', JSON.stringify(session));
    window.location.href = 'index.html';
  });
})();
