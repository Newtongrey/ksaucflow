const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const adminLoginError = document.getElementById('adminLoginError');
const showAdminPassword = document.getElementById('showAdminPassword');


function getUsers() {

  try {

    const savedUsers = JSON.parse(
      localStorage.getItem('routeflowUsers') || 'null'
    );

    /*
     * If users already exist in localStorage,
     * use them.
     */

    if (Array.isArray(savedUsers)) {
      return savedUsers;
    }

  } catch (error) {

    console.warn('Unable to read saved users.');

  }

  /*
   * No users found.
   * This should normally not happen because
   * login.js initializes the user list.
   */

  return [];

}


/*
 * ADMINISTRATOR LOGIN
 */

adminLoginForm.addEventListener(
  'submit',
  function (event) {

    event.preventDefault();

    adminLoginError.textContent = '';

    const email =
      adminEmail.value
        .trim()
        .toLowerCase();

    const password =
      adminPassword.value;


    /*
     * Find matching account
     */

    const user = getUsers().find(item =>
      item.email &&
      item.email.toLowerCase() === email &&
      item.password === password
    );


    /*
     * Invalid credentials
     */

    if (!user) {

      adminLoginError.textContent =
        'The administrator email or password is incorrect.';

      return;

    }


    /*
     * Disabled account
     */

    if (!user.active) {

      adminLoginError.textContent =
        'This administrator account has been disabled.';

      return;

    }


    /*
     * Role protection
     */

    if (user.role !== 'Administrator') {

      adminLoginError.textContent =
        'This account does not have administrator privileges.';

      return;

    }


    /*
     * Create administrator session
     */

    const session = {
      id: user.id,
      name: user.name,
      role: user.role,
      department: user.department
    };


    localStorage.setItem(
      'ksucSession',
      JSON.stringify(session)
    );


    /*
     * Confirm session before redirecting.
     * This helps prevent redirecting before
     * the browser has stored the session.
     */

    const savedSession =
      localStorage.getItem('ksucSession');


    if (!savedSession) {

      adminLoginError.textContent =
        'Unable to create your login session. Please try again.';

      return;

    }


    /*
     * Enter administration portal
     */

    window.location.replace('admin.html');

  }
);


/*
 * SHOW / HIDE PASSWORD
 */

showAdminPassword.addEventListener(
  'click',
  function () {

    if (adminPassword.type === 'password') {

      adminPassword.type = 'text';

      showAdminPassword.textContent = 'Hide';

    } else {

      adminPassword.type = 'password';

      showAdminPassword.textContent = 'Show';

    }

  }
);
