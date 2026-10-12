
/* KSUCflow authentication guard
   Supabase is the source of truth for authentication.
   Keep diagnostic errors visible instead of silently signing
   the user out whenever profile verification fails.
*/
(function () {
  'use strict';

  const path = window.location.pathname.toLowerCase();
  const isAdminPage = path.endsWith('/admin.html') || path === '/admin.html';
  const loginPage = isAdminPage ? 'admin-login.html' : 'login.html';

  function redirectTo(page) {
    window.location.replace(new URL(page, window.location.href).href);
  }

  async function protectPage() {
    document.documentElement.style.visibility = 'hidden';

    if (!window.ksucSupabase || !window.ksucLoadProfile) {
      console.error('KSUCflow: Supabase client or profile loader is missing.');
      document.documentElement.style.visibility = 'visible';
      alert('Authentication could not initialise. Please refresh the page. If the problem continues, contact ICT.');
      return;
    }

    try {
      const { data, error } = await window.ksucSupabase.auth.getSession();

      if (error) throw error;

      const authUser = data && data.session && data.session.user;

      if (!authUser) {
        localStorage.removeItem('ksucSession');
        redirectTo(loginPage);
        return;
      }

      const profile = await window.ksucLoadProfile(authUser);

      if (!profile || !profile.role) {
        throw new Error('Your KSUCflow profile has no assigned role.');
      }

      if (isAdminPage && profile.role !== 'Administrator') {
        document.documentElement.style.visibility = 'visible';
        alert('This account does not have administrator privileges.');
        redirectTo('index.html');
        return;
      }

      if (!isAdminPage && profile.role === 'Administrator') {
        redirectTo('admin.html');
        return;
      }

      localStorage.setItem('ksucSession', JSON.stringify(profile));
      document.documentElement.style.visibility = 'visible';

    } catch (error) {
      console.error('KSUCflow authentication verification failed:', error);

      document.documentElement.style.visibility = 'visible';

      // Do not automatically sign out here. Preserve the Supabase
      // session so that the underlying error can be diagnosed.
      alert(
        'KSUCflow could not verify your profile. ' +
        'Open the browser Console or contact ICT with the error details.'
      );
    }
  }

  protectPage();
})();
