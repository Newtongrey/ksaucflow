/* KSUCflow route and session guard.
   Supabase Auth is the session source; profiles/RLS remain the access boundary.
   Redirects always stay on the exact deployment origin to avoid preview/production
   session confusion.
*/
(function () {
  'use strict';

  const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const pageName = currentPath.split('/').pop() || 'index.html';
  const isAdminPage = pageName === 'admin.html';
  const loginPage = isAdminPage ? 'admin-login.html' : 'login.html';

  function navigate(page) {
    const target = new URL('/' + String(page).replace(/^\/+/, ''), window.location.origin);
    if (target.origin !== window.location.origin) {
      console.error('KSUCflow blocked a cross-origin navigation:', target.href);
      return;
    }
    window.location.replace(target.href);
  }

  function showFailure(message) {
    document.documentElement.style.visibility = 'visible';
    const shell = document.getElementById('adminShell');
    const blocked = document.getElementById('authBlocked');
    const blockedMessage = document.getElementById('authBlockedMessage');
    const status = document.getElementById('authStatus');

    if (shell && blocked) {
      shell.hidden = true;
      blocked.hidden = false;
      if (blockedMessage) blockedMessage.textContent = message;
      const retry = document.getElementById('retryAuth');
      if (retry) retry.addEventListener('click', function () { window.location.reload(); }, { once: true });
    } else if (status) {
      status.hidden = false;
      status.className = 'notice notice-error';
      status.textContent = message;
    } else {
      console.error('KSUCflow authentication:', message);
      window.alert(message);
    }
  }

  async function protectPage() {
    document.documentElement.style.visibility = 'hidden';

    if (!window.ksucSupabase || typeof window.ksucLoadProfile !== 'function') {
      showFailure('The sign-in service could not be initialised. Refresh the page; if this continues, check the Supabase configuration and script loading order.');
      return null;
    }

    try {
      const sessionResult = await window.ksucSupabase.auth.getSession();
      if (sessionResult.error) throw sessionResult.error;

      const authUser = sessionResult.data && sessionResult.data.session && sessionResult.data.session.user;
      if (!authUser) {
        localStorage.removeItem('ksucSession');
        navigate(loginPage);
        return null;
      }

      const profile = await window.ksucLoadProfile(authUser);
      if (!profile || !profile.role) {
        throw new Error('The signed-in account has no assigned KSUCflow role.');
      }

      if (isAdminPage && profile.role !== 'Administrator') {
        navigate('index.html');
        return null;
      }

      if (!isAdminPage && profile.role === 'Administrator') {
        navigate('admin.html');
        return null;
      }

      localStorage.setItem('ksucSession', JSON.stringify(profile));
      document.documentElement.style.visibility = 'visible';
      return profile;
    } catch (error) {
      console.error('KSUCflow session/profile verification failed:', error);
      showFailure(
        'KSUCflow could not verify your profile. Your sign-in session has been preserved. ' +
        'Details: ' + (error && error.message ? error.message : 'Unknown authentication error') +
        '. Check the profiles table permissions and your browser Console.'
      );
      return null;
    }
  }

  window.ksucAuthReady = protectPage();
})();