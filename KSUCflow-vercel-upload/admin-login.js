'use strict';

const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const adminLoginError = document.getElementById('adminLoginError');
const showAdminPassword = document.getElementById('showAdminPassword');
const adminSubmit = adminLoginForm.querySelector('button[type="submit"]');

adminLoginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  adminLoginError.textContent = '';

  if (!window.ksucSupabase || typeof window.ksucLoadProfile !== 'function') {
    adminLoginError.textContent = 'The sign-in service is not ready. Refresh the page; if the problem continues, contact ICT.';
    return;
  }

  const originalLabel = adminSubmit.textContent;
  adminSubmit.disabled = true;
  adminSubmit.textContent = 'Verifying account…';

  try {
    const result = await window.ksucSupabase.auth.signInWithPassword({
      email: adminEmail.value.trim().toLowerCase(),
      password: adminPassword.value
    });
    if (result.error) throw result.error;

    const sessionUser = await window.ksucLoadProfile(result.data.user);
    if (sessionUser.role !== 'Administrator') {
      await window.ksucSupabase.auth.signOut();
      adminLoginError.textContent = 'This account does not have administrator privileges. Use the Staff Portal instead.';
      return;
    }

    // Verify that Supabase has persisted the session before navigating.
    const sessionResult = await window.ksucSupabase.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    const persistedUser = sessionResult.data && sessionResult.data.session && sessionResult.data.session.user;
    if (!persistedUser || persistedUser.id !== result.data.user.id) {
      throw new Error('The sign-in succeeded but the browser did not retain the session. Allow site storage for this deployment, then try again.');
    }

    localStorage.setItem('ksucSession', JSON.stringify(sessionUser));

    // Keep the user on the exact deployment currently serving this login page.
    window.location.replace(new URL('/admin.html', window.location.origin).href);
  } catch (error) {
    console.error('KSUCflow administrator sign-in failed:', error);
    const message = error && error.message ? error.message : '';
    if (/invalid login credentials/i.test(message)) {
      adminLoginError.textContent = 'The email or password is incorrect.';
    } else if (/profile is assigned|no KSUCflow profile/i.test(message)) {
      adminLoginError.textContent = message;
    } else if (/permission|row-level security|policy|profiles/i.test(message)) {
      adminLoginError.textContent = 'Your sign-in worked, but KSUCflow could not read your administrator profile. Check the profiles table access policy. Details: ' + message;
    } else {
      adminLoginError.textContent = message || 'Unable to sign in. Check your credentials and confirm your administrator profile is active.';
    }
  } finally {
    adminSubmit.disabled = false;
    adminSubmit.textContent = originalLabel;
  }
});

showAdminPassword.addEventListener('click', function () {
  const showing = adminPassword.type === 'password';
  adminPassword.type = showing ? 'text' : 'password';
  showAdminPassword.textContent = showing ? 'Hide' : 'Show';
});
