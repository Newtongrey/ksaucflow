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
  if (!window.ksucSupabase) {
    adminLoginError.textContent = 'The sign-in service is not ready. Refresh the page or contact ICT.';
    return;
  }
  const originalLabel = adminSubmit.textContent;
  adminSubmit.disabled = true;
  adminSubmit.textContent = 'Signing in…';
  try {
    const { data, error } = await window.ksucSupabase.auth.signInWithPassword({
      email: adminEmail.value.trim().toLowerCase(), password: adminPassword.value
    });
    if (error) throw error;
    const sessionUser = await window.ksucLoadProfile(data.user);
    if (sessionUser.role !== 'Administrator') {
      await window.ksucSupabase.auth.signOut();
      adminLoginError.textContent = 'This account does not have administrator privileges.';
      return;
    }
    localStorage.setItem('ksucSession', JSON.stringify(sessionUser));
    window.location.replace('admin.html');
  } catch (error) {
    console.error('KSUCflow administrator sign-in failed:', error);
    adminLoginError.textContent = error.message && /profile is assigned/i.test(error.message)
      ? error.message
      : 'Unable to sign in. Check your credentials and confirm your administrator profile is active.';
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
