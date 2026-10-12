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
      // Protected pages without a dedicated error panel receive a safe fallback
      // screen instead of exposing the page after profile verification failed.
      console.error('KSUCflow authentication verification failed:', message);
      const overlay = document.createElement('main');
      overlay.id = 'ksucAuthFailureOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;background:#f5f7fa;font-family:Arial,sans-serif;color:#202b3c';
      const card = document.createElement('section');
      card.style.cssText = 'width:min(520px,100%);padding:30px;background:#fff;border:1px solid #e5eaf0;border-radius:14px;box-shadow:0 16px 50px rgba(0,0,0,.1)';
      const heading = document.createElement('h1');
      heading.textContent = 'KSUCflow could not verify your session';
      heading.style.cssText = 'font-size:23px;margin:0 0 12px;color:#7D0000';
      const details = document.createElement('p');
      details.textContent = message;
      details.style.cssText = 'font-size:13px;line-height:1.7;color:#657286;overflow-wrap:anywhere';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Try again';
      retry.style.cssText = 'padding:10px 14px;margin:8px 8px 0 0;border:0;border-radius:7px;background:#7D0000;color:#fff;font-weight:700;cursor:pointer';
      retry.addEventListener('click', function () { window.location.reload(); });
      const login = document.createElement('a');
      login.href = new URL('/' + loginPage, window.location.origin).href;
      login.textContent = 'Return to sign in';
      login.style.cssText = 'display:inline-block;padding:10px 14px;margin-top:8px;border:1px solid #dce3eb;border-radius:7px;color:#7D0000;text-decoration:none;font-weight:700;font-size:13px';
      card.append(heading, details, retry, login);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
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

      // Administrators may also open the document portal. Only the
      // dedicated admin page is role-restricted; this avoids route ping-pong.
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