
/* KSUCflow local administrator login.
   Browser-only prototype; not suitable for production security.
*/
(function () {
  'use strict';

  const form = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const errorBox = document.getElementById('adminLoginError');
  const showPassword = document.getElementById('showAdminPassword');

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

  function getUsers() {
    try {
      const users = JSON.parse(
        localStorage.getItem('ksucUsers') || '[]'
      );
      return Array.isArray(users) ? users : [];
    } catch (error) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem('ksucUsers', JSON.stringify(users));
  }

  function isAdmin(user) {
    const role = String(user.role || '').toLowerCase().trim();
    return [
      'admin',
      'administrator',
      'system admin',
      'super admin'
    ].includes(role);
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
      showError('Enter your administrator email and password.');
      return;
    }

    let users = getUsers();
    let administrators = users.filter(function (user) {
      return isAdmin(user) &&
        user.active !== false &&
        user.status !== 'inactive';
    });

    /*
     * First-use setup: if no administrator exists in this browser,
     * create one using the credentials entered in this form.
     */
    if (administrators.length === 0) {
      const confirmSetup = window.confirm(
        'No administrator account exists in this browser. ' +
        'Create the first administrator using the email and password ' +
        'you entered?'
      );

      if (!confirmSetup) return;

      const newAdmin = {
        id: 'admin-' + Date.now(),
        name: 'System Administrator',
        email: email,
        password: password,
        role: 'Administrator',
        department: 'Administration',
        active: true,
        createdAt: new Date().toISOString()
      };

      users.push(newAdmin);
      saveUsers(users);
      administrators = [newAdmin];
    }

    const user = administrators.find(function (item) {
      return String(item.email || '').trim().toLowerCase() === email;
    });

    if (!user || String(user.password || '') !== password) {
      showError('Incorrect administrator email or password.');
      return;
    }

    localStorage.setItem('ksucSession', JSON.stringify({
      id: user.id || user.email,
      email: user.email,
      name: user.name || user.full_name || user.email,
      role: 'Administrator',
      department: user.department || 'Administration',
      signedInAt: new Date().toISOString()
    }));

    window.location.href = 'admin.html';
  });
})();
