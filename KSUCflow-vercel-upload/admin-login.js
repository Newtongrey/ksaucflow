/* KSUCflow local administrator login.
   Browser-only prototype — not suitable for production security.
*/
(function () {
  'use strict';

  const form = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const errorBox = document.getElementById('adminLoginError');
  const showPassword = document.getElementById('showAdminPassword');

  function showMessage(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    } else {
      alert(message);
    }
  }

  function hideMessage() {
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
      console.error('Could not read saved accounts:', error);
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem('ksucUsers', JSON.stringify(users));
  }

  function isAdmin(user) {
    const role = String(user.role || '')
      .toLowerCase()
      .trim();

    return [
      'admin',
      'administrator',
      'system admin',
      'system_admin',
      'super admin',
      'super_admin'
    ].includes(role);
  }

  function isActive(user) {
    return user.active !== false &&
      String(user.status || '').toLowerCase() !== 'inactive';
  }

  function createSession(user) {
    localStorage.setItem('ksucSession', JSON.stringify({
      id: user.id || user.email,
      email: user.email,
      name: user.name || user.full_name || user.email,
      role: 'Administrator',
      department: user.department || 'Administration',
      signedInAt: new Date().toISOString()
    }));

    window.location.href = 'admin.html';
  }

  if (showPassword && passwordInput) {
    showPassword.addEventListener('click', function () {
      const show = passwordInput.type === 'password';
      passwordInput.type = show ? 'text' : 'password';
      showPassword.textContent = show ? 'Hide' : 'Show';
    });
  }

  if (!form || !emailInput || !passwordInput) {
    console.error('Administrator login form fields were not found.');
    return;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideMessage();

    const email = String(emailInput.value || '')
      .trim()
      .toLowerCase();

    const password = String(passwordInput.value || '');

    if (!email || !password) {
      showMessage('Enter your administrator email and password.');
      return;
    }

    let users = getUsers();

    let administrators = users.filter(function (user) {
      return isAdmin(user) && isActive(user);
    });

    // First-time setup when this browser has no administrator.
    if (administrators.length === 0) {
      const confirmed = window.confirm(
        'No active administrator was found in this browser. ' +
        'Create the first administrator using the email and password entered?'
      );

      if (!confirmed) return;

      const newAdmin = {
        id: 'admin-' + Date.now(),
        name: 'System Administrator',
        email: email,
        password: password,
        role: 'Administrator',
        department: 'Administration',
        active: true,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      users.push(newAdmin);

      try {
        saveUsers(users);
      } catch (error) {
        showMessage('Could not save the administrator account in this browser.');
        return;
      }

      createSession(newAdmin);
      return;
    }

    const user = administrators.find(function (item) {
      return String(item.email || '')
        .trim()
        .toLowerCase() === email;
    });

    if (user && String(user.password || '') === password) {
      createSession(user);
      return;
    }

    showMessage('Incorrect administrator email or password.');
  });

  /*
   * Prototype-only recovery helper.
   * Run resetKsucAdminPassword("your-email@ksuc.ac.ke", "NewPassword")
   * in the browser console on the same site and browser.
   */
  window.resetKsucAdminPassword = function (email, newPassword) {
    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !newPassword || String(newPassword).length < 8) {
      console.error('Provide the administrator email and a password of at least 8 characters.');
      return false;
    }

    const users = getUsers();

    const admin = users.find(function (user) {
      return isAdmin(user) &&
        String(user.email || '').trim().toLowerCase() === normalizedEmail;
    });

    if (!admin) {
      console.error('No matching administrator account was found in this browser.');
      return false;
    }

    admin.password = String(newPassword);
    admin.active = true;
    admin.status = 'active';

    try {
      saveUsers(users);
      console.log('Administrator password updated. You can now sign in.');
      return true;
    } catch (error) {
      console.error('Could not save the new password:', error);
      return false;
    }
  };
})();
