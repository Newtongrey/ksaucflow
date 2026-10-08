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
    path.endsWith('/admin.html') ||
    path.endsWith('admin.html');


  const isStaffPage =
    path.endsWith('/index.html') ||
    path.endsWith('index.html') ||
    path.endsWith('/documents.html') ||
    path.endsWith('documents.html') ||
    path.endsWith('/document-view.html') ||
    path.endsWith('document-view.html');


  /*
   * No authenticated session
   */

  if (!currentSession) {

    if (isAdminPage) {

      window.location.replace('admin-login.html');

    } else {

      window.location.replace('login.html');

    }

    return;

  }


  /*
   * Administrator trying to access
   * the normal staff portal
   *
   * Allowing this is intentional for now,
   * because administrators may need to
   * return to the document portal.
   */


  /*
   * Non-administrator trying to access
   * the administration dashboard.
   */

  if (
    isAdminPage &&
    currentSession.role !== 'Administrator'
  ) {

    window.location.replace('index.html');

    return;

  }


  /*
   * Session exists and access is valid.
   */

})();
