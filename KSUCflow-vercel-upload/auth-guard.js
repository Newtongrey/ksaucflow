(function () {

  let currentSession = null;

  try {

    currentSession = JSON.parse(
      localStorage.getItem('ksucSession') || 'null'
    );

  } catch (error) {

    currentSession = null;

  }


  const path =
    window.location.pathname.toLowerCase();


  const isAdminPage =
    path.endsWith('admin.html');


  /*
   * ADMIN PAGE
   */

  if (isAdminPage) {

    /*
     * No session → administrator login
     */

    if (!currentSession) {

      window.location.replace('admin-login.html');

      return;

    }


    /*
     * Session exists but user is not
     * an administrator.
     */

    if (currentSession.role !== 'Administrator') {

      window.location.replace('index.html');

      return;

    }


    /*
     * Administrator is authenticated.
     * Stay on admin.html.
     */

    return;

  }


  /*
   * OTHER PROTECTED PAGES
   */

  if (!currentSession) {

    window.location.replace('login.html');

    return;

  }

})();
