/* KSUCflow Supabase client bootstrap.
   This file uses the public publishable key only. Never put a service-role key here. */
(function () {
  if (!window.supabase || !window.KSUC_SUPABASE_URL || !window.KSUC_SUPABASE_PUBLISHABLE_KEY) {
    console.error('KSUCflow Supabase configuration is missing.');
    return;
  }

  window.ksucSupabase = window.supabase.createClient(
    window.KSUC_SUPABASE_URL,
    window.KSUC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  window.ksucRoleName = function (role) {
    const value = String(role || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (['admin', 'administrator', 'system_admin', 'super_admin'].includes(value)) return 'Administrator';
    if (['department_head', 'hod', 'head_of_department'].includes(value)) return 'Department Head';
    return 'Staff';
  };

  window.ksucLoadProfile = async function (user) {
    const client = window.ksucSupabase;
    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) throw new Error('Your account is signed in, but no KSUCflow profile is assigned. Contact the system administrator.');

    const departmentId = profile.department_id || profile.departmentId || null;
    let departmentName = profile.department_name || profile.department || '';

    if (departmentId) {
      const { data: department, error: departmentError } = await client
        .from('departments')
        .select('name')
        .eq('id', departmentId)
        .maybeSingle();
      if (departmentError) throw departmentError;
      if (department && department.name) departmentName = department.name;
    }

    const metadata = user.user_metadata || {};
    const role = window.ksucRoleName(profile.role || metadata.role);
    const name = profile.full_name || profile.name || profile.display_name ||
      metadata.full_name || metadata.name || (user.email || '').split('@')[0];

    return {
      id: user.id,
      authUserId: user.id,
      name: name,
      email: user.email || '',
      role: role,
      department: departmentName || 'Unassigned',
      departmentId: departmentId
    };
  };
})();
