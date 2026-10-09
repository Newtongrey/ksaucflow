/* KSUCflow Supabase-backed session guard.
   This is a client-side convenience gate; database RLS remains the actual data-access boundary. */
(async function () {
  const path = window.location.pathname.toLowerCase();
  const isAdminPage = path.endsWith('admin.html');
  const loginTarget = isAdminPage ? 'admin-login.html' : 'login.html';

  document.documentElement.style.visibility = 'hidden';

  function redirect(target) {
    window.location.replace(target);
  }

  try {
    if (!window.ksucSupabase || !window.ksucLoadProfile) {
      throw new Error('KSUCflow authentication service is unavailable.');
    }

    const { data: sessionData, error: sessionError } = await window.ksucSupabase.auth.getSession();
    if (sessionError) throw sessionError;
    const authUser = sessionData.session && sessionData.session.user;

    if (!authUser) {
      localStorage.removeItem('ksucSession');
      redirect(loginTarget);
      return;
    }

    const profile = await window.ksucLoadProfile(authUser);
    if (isAdminPage && profile.role !== 'Administrator') {
      redirect('index.html');
      return;
    }
    if (!isAdminPage && profile.role === 'Administrator') {
      redirect('admin.html');
      return;
    }

    localStorage.setItem('ksucSession', JSON.stringify(profile));
    document.documentElement.style.visibility = 'visible';
  } catch (error) {
    console.error('KSUCflow session verification failed:', error);
    localStorage.removeItem('ksucSession');
    try { await window.ksucSupabase?.auth.signOut(); } catch (_) {}
    redirect(loginTarget);
  }
})();
