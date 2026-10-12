/*
 * KSUCflow privileged user administration.
 * Required Vercel environment variables:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 * The service-role key is server-only and must NEVER be placed in frontend files.
 */
const allowedRoles = new Set(['Staff', 'Department Head', 'Administrator']);
const isAdminRole = value => ['administrator', 'admin', 'system_admin', 'super_admin']
  .includes(String(value || '').trim().toLowerCase().replace(/[\\s-]+/g, '_'));

function reply(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store');
  return res.json(body);
}

async function supabaseRequest(url, key, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + (options.bearer || key),
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = { message: text }; }
  if (!response.ok) {
    const error = new Error((data && (data.msg || data.message || data.error_description || data.error)) || 'Supabase request failed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, { error: 'Method not allowed.' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return reply(res, 403, { error: 'Cross-origin requests are not allowed.' });
    } catch (_) {
      return reply(res, 403, { error: 'Invalid request origin.' });
    }
  }

  const base = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !anonKey || !serviceKey) {
    return reply(res, 503, {
      error: 'Secure user administration is not configured yet. Add SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY to the Vercel project environment, then redeploy.'
    });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!token) return reply(res, 401, { error: 'A signed-in administrator session is required.' });

  try {
    const authUser = await supabaseRequest(base + '/auth/v1/user', anonKey, {
      method: 'GET',
      bearer: token[1]
    });
    if (!authUser || !authUser.id) return reply(res, 401, { error: 'Session could not be verified.' });

    const ownProfiles = await supabaseRequest(
      base + '/rest/v1/profiles?select=id,role&id=eq.' + encodeURIComponent(authUser.id) + '&limit=1',
      serviceKey,
      { method: 'GET' }
    );
    if (!Array.isArray(ownProfiles) || !ownProfiles.length ||
        !isAdminRole(ownProfiles[0].role)) {
      return reply(res, 403, { error: 'Only a verified KSUCflow administrator may manage accounts.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const action = String(body.action || '');
    if (action === 'invite') {
      const email = String(body.email || '').trim().toLowerCase();
      const fullName = String(body.full_name || '').trim();
      const departmentId = body.department_id ? String(body.department_id) : null;
      const role = String(body.role || 'Staff');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(res, 400, { error: 'Enter a valid email address.' });
      if (!fullName) return reply(res, 400, { error: 'Full name is required.' });
      if (!allowedRoles.has(role)) return reply(res, 400, { error: 'Invalid account role.' });
      if (role === 'Administrator') {
        const admins = await supabaseRequest(base + '/rest/v1/profiles?select=id&role=eq.Administrator', serviceKey, { method: 'GET' });
        if (!Array.isArray(admins) || admins.length === 0) return reply(res, 409, { error: 'Could not verify existing administrator accounts.' });
      }

      const invited = await supabaseRequest(base + '/auth/v1/invite', serviceKey, {
        method: 'POST',
        body: JSON.stringify({ email, data: { full_name: fullName, role, department_id: departmentId } })
      });
      if (!invited || !invited.id) return reply(res, 502, { error: 'Supabase did not return the invited account.' });

      try {
        await supabaseRequest(base + '/rest/v1/profiles?on_conflict=id', serviceKey, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ id: invited.id, full_name: fullName, department_id: departmentId, role })
        });
      } catch (profileError) {
        // Avoid leaving a half-provisioned account when the profile cannot be created.
        try {
          await supabaseRequest(base + '/auth/v1/admin/users/' + encodeURIComponent(invited.id), serviceKey, { method: 'DELETE' });
        } catch (_) {}
        throw new Error('The invitation was created but the KSUCflow profile could not be saved. Check the profiles table columns and retry after correcting them. ' + profileError.message);
      }
      return reply(res, 200, { ok: true, message: 'Invitation sent and profile created.', user_id: invited.id });
    }

    if (action === 'update-profile') {
      const id = String(body.user_id || '');
      const fullName = String(body.full_name || '').trim();
      const role = String(body.role || '');
      const departmentId = body.department_id ? String(body.department_id) : null;
      if (!id) return reply(res, 400, { error: 'Profile ID is required.' });
      if (!allowedRoles.has(role)) return reply(res, 400, { error: 'Invalid account role.' });
      if (!fullName) return reply(res, 400, { error: 'Full name is required.' });
      if (id === authUser.id && role !== 'Administrator') return reply(res, 409, { error: 'You cannot remove administrator privileges from your own active session.' });
      const target = await supabaseRequest(base + '/rest/v1/profiles?select=id,role&id=eq.' + encodeURIComponent(id), serviceKey, { method: 'GET' });
      if (!Array.isArray(target) || !target.length) return reply(res, 404, { error: 'Profile not found.' });
      if (isAdminRole(target[0].role) && role !== 'Administrator') {
        const admins = await supabaseRequest(base + '/rest/v1/profiles?select=id&role=eq.Administrator', serviceKey, { method: 'GET' });
        if (Array.isArray(admins) && admins.length <= 1) return reply(res, 409, { error: 'The last administrator cannot be demoted.' });
      }
      await supabaseRequest(base + '/rest/v1/profiles?id=eq.' + encodeURIComponent(id), serviceKey, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ full_name: fullName, department_id: departmentId, role })
      });
      return reply(res, 200, { ok: true, message: 'Profile updated.' });
    }

    if (action === 'deactivate') {
      const id = String(body.user_id || '');
      if (!id) return reply(res, 400, { error: 'User ID is required.' });
      if (id === authUser.id) return reply(res, 409, { error: 'You cannot deactivate your own account.' });
      const target = await supabaseRequest(base + '/rest/v1/profiles?select=id,role&id=eq.' + encodeURIComponent(id), serviceKey, { method: 'GET' });
      if (!Array.isArray(target) || !target.length) return reply(res, 404, { error: 'Profile not found.' });
      if (String(target[0].role || '').toLowerCase() === 'administrator') {
        const admins = await supabaseRequest(base + '/rest/v1/profiles?select=id&role=eq.Administrator', serviceKey, { method: 'GET' });
        if (Array.isArray(admins) && admins.length <= 1) return reply(res, 409, { error: 'The last administrator cannot be deactivated.' });
      }
      await supabaseRequest(base + '/auth/v1/admin/users/' + encodeURIComponent(id), serviceKey, {
        method: 'PUT',
        body: JSON.stringify({ ban_duration: '876000h' })
      });
      return reply(res, 200, { ok: true, message: 'Account access deactivated. The profile record has been retained for audit history.' });
    }

    return reply(res, 400, { error: 'Unsupported action.' });
  } catch (error) {
    console.error('KSUCflow admin API error:', error);
    const status = Number(error.status) >= 400 && Number(error.status) < 500 ? Number(error.status) : 500;
    return reply(res, status, { error: error.message || 'Account administration failed.' });
  }
};
