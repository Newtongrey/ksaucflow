const DEFAULT_USERS = [

  {
    id: 1,
    name: 'Newton Mwangi',
    email: 'newton.mwangi@ksuc.ac.ke',
    department: 'Registry',
    role: 'Administrator',
    active: true,
    password: 'ChangeMe123!'
  },

  {
    id: 2,
    name: 'James Kariuki',
    email: 'james.kariuki@ksuc.ac.ke',
    department: 'Finance',
    role: 'Department Head',
    active: true,
    password: 'ChangeMe123!'
  },

  {
    id: 3,
    name: 'Sarah Mwangi',
    email: 'sarah.mwangi@ksuc.ac.ke',
    department: 'Human Resources',
    role: 'Staff',
    active: true,
    password: 'ChangeMe123!'
  },

  {
    id: 4,
    name: 'Brian Otieno',
    email: 'brian.otieno@ksuc.ac.ke',
    department: 'Academic Affairs',
    role: 'Staff',
    active: false,
    password: 'ChangeMe123!'
  }

];


function users() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem('routeflowUsers') || 'null'
      );

    if (saved && Array.isArray(saved)) {
      return saved;
    }

  } catch (error) {

    console.warn('Unable to read saved users.');

  }


  localStorage.setItem(
    'routeflowUsers',
    JSON.stringify(DEFAULT_USERS)
  );

  return DEFAULT_USERS;

}


/*
 * STAFF LOGIN
 */

document
  .querySelector('#loginForm')
  .addEventListener('submit', function (event) {

    event.preventDefault();

    const email =
      document
        .querySelector('#email')
        .value
        .trim()
        .toLowerCase();

    const password =
      document
        .querySelector('#password')
        .value;

    const error =
      document.querySelector('#error');


    error.textContent = '';


    const user = users().find(item =>
      item.email &&
      item.email.toLowerCase() === email &&
      item.password === password
    );


    /*
     * Invalid credentials
     */

    if (!user) {

      error.textContent =
        'The email address or password is incorrect.';

      return;

    }


    /*
     * Disabled account
     */

    if (!user.active) {

      error.textContent =
        'This account has been disabled. Contact an administrator.';

      return;

    }


    /*
     * Administrators must use the
     * dedicated administrator portal.
     */

    if (user.role === 'Administrator') {

      error.textContent =
        'Administrators must sign in through the Admin Portal.';

      return;

    }


    /*
     * Create staff session
     */

    localStorage.setItem(
      'ksucSession',
      JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        department: user.department
      })
    );


    /*
     * Open staff dashboard
     */

    window.location.href = 'index.html';

  });


/*
 * SHOW / HIDE PASSWORD
 */

document
  .querySelector('#showPassword')
  .addEventListener('click', function (event) {

    const field =
      document.querySelector('#password');


    if (field.type === 'password') {

      field.type = 'text';

      event.target.textContent = 'Hide';

    } else {

      field.type = 'password';

      event.target.textContent = 'Show';

    }

  });
