const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const adminLoginError = document.getElementById('adminLoginError');
const showAdminPassword = document.getElementById('showAdminPassword');


function getUsers() {

  try {

    return JSON.parse(
      localStorage.getItem('routeflowUsers') || '[]'
    );

  } catch (error) {

    return [];

  }

}


/*
 * ADMIN LOGIN
 *
 * Only users whose role is Administrator
 * are allowed into the administration portal.
 */

adminLoginForm.addEventListener('submit', function (event) {

  event.preventDefault();

  adminLoginError.textContent = '';

  const email =
    adminEmail.value.trim().toLowerCase();

  const password =
    adminPassword.value;

  const user = getUsers().find(item =>
    item.email &&
    item.email.toLowerCase() === email &&
    item.password === password
  );


  if (!user) {

    adminLoginError.textContent =
      'The administrator email or password is incorrect.';

    return;

  }


  if (!user.active) {

    adminLoginError.textContent =
      'This administrator account has been disabled.';

    return;

  }


  if (user.role !== 'Administrator') {

    adminLoginError.textContent =
      'This account does not have administrator privileges.';

    return;

  }


  /*
   * Save authenticated session
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

window.location.replace('admin.html');


  /*
   * Enter administration portal
   */

  window.location.href = 'admin.html';

});


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
