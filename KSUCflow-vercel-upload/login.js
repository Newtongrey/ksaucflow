'use strict';
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('error');
const loginButton = loginForm.querySelector('button[type="submit"]');

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  loginError.textContent = '';
  if (!window.ksucSupabase) {
    loginError.textContent = 'The sign-in service is not ready. Refresh the page or contact ICT.';
    return;
  }
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const originalLabel = loginButton.textContent;
  loginButton.disabled = true;
  loginButton.textContent = 'Signing in…';
  try {
    const { data, error } = await window.ksucSupabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const sessionUser = await window.ksucLoadProfile(data.user);
    if (sessionUser.role === 'Administrator') {
      await window.ksucSupabase.auth.signOut();
      loginError.textContent = 'Administrators must sign in through the Admin Portal.';
      return;
    }
    const sessionResult = await window.ksucSupabase.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    const persistedUser = sessionResult.data && sessionResult.data.session && sessionResult.data.session.user;
    if (!persistedUser || persistedUser.id !== data.user.id) {
      throw new Error('The sign-in succeeded but the browser did not retain the session. Allow site storage for this deployment, then try again.');
    }

    localStorage.setItem('ksucSession', JSON.stringify(sessionUser));
    window.location.replace(new URL('/index.html', window.location.origin).href);
  } catch (error) {
    console.error('KSUCflow staff sign-in failed:', error);
    const message = error && error.message ? error.message : '';
    if (/invalid login credentials/i.test(message)) {
      loginError.textContent = 'The email or password is incorrect.';
    } else if (/profile is assigned|no KSUCflow profile/i.test(message)) {
      loginError.textContent = message;
    } else if (/permission|row-level security|policy|profiles/i.test(message)) {
      loginError.textContent = 'Sign-in succeeded, but KSUCflow could not read your profile. Contact the administrator to check profile access. Details: ' + message;
    } else {
      loginError.textContent = message || 'Unable to sign in. Check your email and password, and confirm your account has been activated by the administrator.';
    }
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = originalLabel;
  }
});

document.getElementById('showPassword').addEventListener('click', function (event) {
  const field = document.getElementById('password');
  const showing = field.type === 'password';
  field.type = showing ? 'text' : 'password';
  event.currentTarget.textContent = showing ? 'Hide' : 'Show';
});
