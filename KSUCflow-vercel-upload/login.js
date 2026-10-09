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
    localStorage.setItem('ksucSession', JSON.stringify(sessionUser));
    window.location.replace('index.html');
  } catch (error) {
    console.error('KSUCflow staff sign-in failed:', error);
    loginError.textContent = error.message && /profile is assigned/i.test(error.message)
      ? error.message
      : 'Unable to sign in. Check your email and password, and confirm your account has been activated by the administrator.';
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
