const documents = [
  { ref: 'MI/FIN/2026/084', title: 'Quarter 3 budget reallocation request', origin: 'School of Engineering', destination: 'Finance', action: 'For approval', kind: 'action', status: 'Awaiting action', state: '' },
  { ref: 'MI/ADM/2026/127', title: 'Annual maintenance contract renewal', origin: 'Procurement Office', destination: 'Office of the Director', action: 'For signature', kind: 'review', status: 'In transit', state: 'transit' },
  { ref: 'MI/HR/2026/211', title: 'Request to recruit laboratory assistant', origin: 'School of Sciences', destination: 'Human Resources', action: 'For action', kind: 'action', status: 'Received', state: 'transit' },
  { ref: 'MI/ACA/2026/056', title: 'Proposed curriculum review schedule', origin: 'Academic Affairs', destination: 'Office of the Director', action: 'For review', kind: 'review', status: 'Completed', state: 'done' },
  { ref: 'MI/EXT/2026/092', title: 'Invitation to regional research forum', origin: 'Ministry of Education', destination: 'Academic Affairs', action: 'For information', kind: 'info', status: 'Received', state: 'transit' }
];
const storedDocuments = JSON.parse(localStorage.getItem('ksucDocuments') || 'null');
if (Array.isArray(storedDocuments)) { documents.splice(0, documents.length, ...storedDocuments); }
const activity = [
  ['AM', '#6584c8', '<strong>Finance</strong> received MI/FIN/2026/084', '12 minutes ago'],
  ['JK', '#ae806e', '<strong>James Kariuki</strong> routed a document to HR', '34 minutes ago'],
  ['AO', '#7c9f90', '<strong>Academic Affairs</strong> completed MI/ACA/2026/056', '1 hour ago'],
  ['SM', '#927bb7', '<strong>Sarah Mwangi</strong> registered a new document', '2 hours ago']
];
const rows = document.querySelector('#documentRows');
const activityList = document.querySelector('#activityList');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
function renderDocuments(list = documents) {
  rows.innerHTML = list.map(d => `<tr><td><span class="doc-title">${escapeHtml(d.title)}</span><span class="ref">${escapeHtml(d.ref)}</span></td><td>${escapeHtml(d.origin)}</td><td><span class="route">${escapeHtml(d.destination)}</span></td><td><span class="tag ${d.kind}">${escapeHtml(d.action)}</span></td><td><span class="status ${d.state || ''}">${escapeHtml(d.status)}</span></td><td>${d.status === 'Awaiting action' ? `<button class="review-button" data-ref="${escapeHtml(d.ref)}" style="border:0;border-radius:5px;background:#376fd5;color:#fff;padding:6px 8px;font-size:10px;cursor:pointer">Review</button>` : `<button class="review-button" data-ref="${escapeHtml(d.ref)}" style="border:1px solid #dce4eb;border-radius:5px;background:#fff;color:#526174;padding:6px 8px;font-size:10px;cursor:pointer">View outcome</button>`}</td></tr>`).join('');
  document.querySelector('#docCount').textContent = documents.length + 7;
}
function renderActivity() { activityList.innerHTML = activity.map(a => `<div class="activity-row"><div class="activity-dot" style="background:${a[1]}">${a[0]}</div><div><p>${a[2]}</p><small>${a[3]}</small></div></div>`).join(''); }
renderDocuments(); renderActivity();
document.querySelector('#search').addEventListener('input', e => { const term = e.target.value.toLowerCase(); renderDocuments(documents.filter(d => Object.values(d).join(' ').toLowerCase().includes(term))); });
const modal = document.querySelector('#documentModal');
document.querySelector('#openModal').onclick = () => modal.showModal();
document.querySelector('#documentForm').addEventListener('submit', e => { e.preventDefault(); const ref = document.querySelector('#reference').value; const origin = document.querySelector('#origin').value; const title = document.querySelector('#subject').value; const destination = document.querySelector('#department').value; const action = document.querySelector('#action').value; documents.unshift({ref,title,origin,destination,action,kind: action === 'For information' ? 'info' : 'action',status:'In transit',state:'transit'}); activity.unshift(['AM','#6584c8',`<strong>Registry</strong> routed ${ref} to ${destination}`,'Just now']); renderDocuments(); renderActivity(); modal.close(); e.target.reset(); });

// In production, access to this screen belongs to the administrator role.
const defaults = { title: 'KSUCflow', institution: 'KENYA SCIENCE UNIVERSITY COLLEGE', label: 'Administration portal', welcome: 'Here is the movement across the institution today.', primary: '#376fd5', sidebar: '#182b4d' };
document.querySelector('#documentForm').addEventListener('submit', () => localStorage.setItem('ksucDocuments', JSON.stringify(documents)));
const customizer = document.querySelector('#customizerModal');
const settingsForm = document.querySelector('#customizerForm');
function applySettings(s) {
  document.querySelector('#appTitle').innerHTML = `${s.title.replace(/</g, '&lt;')}`;
  document.querySelector('#brandMark').textContent = s.title.charAt(0).toUpperCase() || 'R';
  document.querySelector('#institutionName').childNodes[0].nodeValue = s.institution.toUpperCase();
  document.querySelector('#portalLabel').textContent = s.label;
  document.querySelector('#welcomeText').textContent = s.welcome;
  document.querySelector('.sidebar').style.background = s.sidebar;
  document.querySelectorAll('.primary').forEach(el => el.style.background = s.primary);
  document.querySelectorAll('.text-button').forEach(el => el.style.color = s.primary);
  document.title = `${s.title} | Document Tracker`;
}
function fillSettings(s) { ['Title','Institution','Label','Welcome','Primary','Sidebar'].forEach(key => document.querySelector(`#setting${key}`).value = s[key.toLowerCase()]); }
function currentSettings() { const s = JSON.parse(localStorage.getItem('routeflowAdminSettings') || 'null') || defaults; if (s.title === 'RouteFlow') { s.title = defaults.title; localStorage.setItem('routeflowAdminSettings', JSON.stringify(s)); } return s; }
applySettings(currentSettings());
document.querySelector('#openCustomizer').addEventListener('click', () => { fillSettings(currentSettings()); customizer.showModal(); });
settingsForm.addEventListener('submit', e => { e.preventDefault(); const s = { title: document.querySelector('#settingTitle').value.trim() || defaults.title, institution: document.querySelector('#settingInstitution').value.trim() || defaults.institution, label: document.querySelector('#settingLabel').value.trim() || defaults.label, welcome: document.querySelector('#settingWelcome').value.trim() || defaults.welcome, primary: document.querySelector('#settingPrimary').value, sidebar: document.querySelector('#settingSidebar').value }; localStorage.setItem('routeflowAdminSettings', JSON.stringify(s)); applySettings(s); customizer.close(); });
document.querySelector('#resetSettings').addEventListener('click', () => { localStorage.removeItem('routeflowAdminSettings'); fillSettings(defaults); applySettings(defaults); });

// Admin user-management prototype. A production system must store password hashes on a secure server.
const starterUsers = [
  { id: 1, name: 'Newton Mwangi', email: 'newton.mwangi@makena.ac.ke', department: 'Registry', role: 'Administrator', active: true, password: 'ChangeMe123!' },
  { id: 2, name: 'James Kariuki', email: 'james.kariuki@makena.ac.ke', department: 'Finance', role: 'Department Head', active: true, password: 'ChangeMe123!' },
  { id: 3, name: 'Sarah Mwangi', email: 'sarah.mwangi@makena.ac.ke', department: 'Human Resources', role: 'Staff', active: true, password: 'ChangeMe123!' },
  { id: 4, name: 'Brian Otieno', email: 'brian.otieno@makena.ac.ke', department: 'Academic Affairs', role: 'Staff', active: false, password: 'ChangeMe123!' }
];
const adminModal = document.querySelector('#adminModal');
const userModal = document.querySelector('#userModal');
const userRows = document.querySelector('#userRows');
const safe = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function getUsers() { return JSON.parse(localStorage.getItem('routeflowUsers') || 'null') || starterUsers; }
function saveUsers(users) { localStorage.setItem('routeflowUsers', JSON.stringify(users)); }
function renderUsers() {
  const users = getUsers();
  document.querySelector('#totalUsers').textContent = users.length;
  document.querySelector('#activeUsers').textContent = users.filter(u => u.active).length;
  document.querySelector('#adminUsers').textContent = users.filter(u => u.role === 'Administrator').length;
  userRows.innerHTML = users.map(u => `<tr><td><strong>${safe(u.name)}</strong><span class="ref">${safe(u.email)}</span></td><td>${safe(u.department)}</td><td><span class="tag ${u.role === 'Administrator' ? 'review' : 'action'}">${safe(u.role)}</span></td><td><span class="status ${u.active ? 'done' : ''}">${u.active ? 'Active' : 'Disabled'}</span></td><td><div class="user-actions"><button data-action="reset" data-id="${u.id}">Reset password</button><button data-action="toggle" data-id="${u.id}">${u.active ? 'Disable' : 'Enable'}</button></div></td></tr>`).join('');
}
// The dedicated admin page is linked directly from the sidebar.
document.querySelector('#closeAdmin').addEventListener('click', () => adminModal.close());
document.querySelector('#addUser').addEventListener('click', () => { document.querySelector('#userForm').reset(); document.querySelector('#userMode').textContent = 'NEW USER'; document.querySelector('#userModalTitle').textContent = 'Create user account'; document.querySelector('#saveUser').textContent = 'Create user'; userModal.showModal(); });
document.querySelector('#userForm').addEventListener('submit', e => { e.preventDefault(); const users = getUsers(); users.push({ id: Date.now(), name: document.querySelector('#userName').value.trim(), email: document.querySelector('#userEmail').value.trim(), department: document.querySelector('#userDepartment').value, role: document.querySelector('#userRole').value, active: true, password: document.querySelector('#userPassword').value }); saveUsers(users); renderUsers(); userModal.close(); });
userRows.addEventListener('click', e => { const button = e.target.closest('button[data-action]'); if (!button) return; const users = getUsers(); const user = users.find(u => u.id === Number(button.dataset.id)); if (!user) return; if (button.dataset.action === 'toggle') { user.active = !user.active; saveUsers(users); renderUsers(); return; } const newPassword = window.prompt(`Set a new temporary password for ${user.name} (minimum 8 characters):`); if (newPassword === null) return; if (newPassword.length < 8) { window.alert('Password must contain at least 8 characters.'); return; } user.password = newPassword; saveUsers(users); window.alert(`Password reset for ${user.name}. Share the temporary password securely.`); });

const viewMessages = { overview: ['Document movement', 'Recent records routed through the registry', documents], documents: ['All documents', 'Every document currently registered in KSUCflow', documents], inbox: ['My inbox', 'Documents requiring your attention', documents.filter(d => d.status === 'Awaiting action')], departments: ['Department routing', 'Documents currently moving across departments', documents.filter(d => d.status !== 'Completed')], reports: ['Reports', 'Current document movement report', documents] };
function setView(view) {
  const [title, subtitle, list] = viewMessages[view];
  document.querySelector('.document-panel .panel-heading h2').textContent = title;
  document.querySelector('.document-panel .panel-heading p').textContent = subtitle;
  renderDocuments(list);
  document.querySelectorAll('[data-view]').forEach(link => link.classList.toggle('active', link.dataset.view === view));
  if (view === 'reports') window.setTimeout(() => window.alert(`KSUCflow report: ${documents.length} documents registered, ${documents.filter(d => d.status === 'Awaiting action').length} awaiting action, and ${documents.filter(d => d.status === 'Completed').length} completed.`), 50);
}
document.querySelectorAll('[data-view]').forEach(link => link.addEventListener('click', () => setView(link.dataset.view)));
document.querySelector('.filter').addEventListener('click', () => { const pending = documents.filter(d => d.status === 'Awaiting action'); renderDocuments(pending); document.querySelector('.document-panel .panel-heading h2').textContent = 'Filtered: awaiting action'; });
document.querySelector('.icon-button').addEventListener('click', () => window.alert('You have 4 documents awaiting action.'));
document.querySelector('.text-button').addEventListener('click', () => setView('documents'));
document.querySelector('.full-width').addEventListener('click', () => window.alert('The activity feed is current. New registrations and routing updates will appear here.'));
document.querySelector('.dots').addEventListener('click', () => window.alert('Activity refresh is enabled.'));
document.querySelector('#signOut').addEventListener('click', () => { localStorage.removeItem('ksucSession'); location.href = 'login.html'; });
const signedInUser = JSON.parse(localStorage.getItem('ksucSession') || 'null');
if (signedInUser) {
  document.querySelector('#greeting').textContent = `Good morning, ${signedInUser.name.split(' ')[0]}.`;
  if (signedInUser.role !== 'Administrator') { document.querySelector('#openAdminDashboard').style.display = 'none'; document.querySelector('#openCustomizer').style.display = 'none'; }
}

let reviewedDocument = null;
const reviewModal = document.querySelector('#reviewModal');
const reviewForm = document.querySelector('#reviewForm');
const decision = document.querySelector('#decision');
const returnDepartmentLabel = document.querySelector('#returnDepartmentLabel');
function updateReviewFields() { returnDepartmentLabel.hidden = decision.value === 'approved'; }
rows.addEventListener('click', event => {
  const button = event.target.closest('.review-button'); if (!button) return;
  reviewedDocument = documents.find(doc => doc.ref === button.dataset.ref); if (!reviewedDocument) return;
  if (reviewedDocument.status !== 'Awaiting action') { window.alert(`${reviewedDocument.status}${reviewedDocument.decisionReason ? `: ${reviewedDocument.decisionReason}` : ''}`); return; }
  document.querySelector('#reviewDocument').textContent = `${reviewedDocument.ref} — ${reviewedDocument.title}`;
  document.querySelector('#returnDepartment').value = reviewedDocument.destination;
  reviewForm.reset(); document.querySelector('#returnDepartment').value = reviewedDocument.destination; updateReviewFields(); reviewModal.showModal();
});
decision.addEventListener('change', updateReviewFields);
reviewForm.addEventListener('submit', event => {
  event.preventDefault(); if (!reviewedDocument) return;
  const reason = document.querySelector('#decisionReason').value.trim(); if (!reason) return;
  const selected = decision.value; const responsibleDepartment = document.querySelector('#returnDepartment').value;
  if (selected === 'approved') { reviewedDocument.status = 'Approved'; reviewedDocument.state = 'done'; }
  if (selected === 'not-approved') { reviewedDocument.status = 'Not approved'; reviewedDocument.state = ''; reviewedDocument.destination = responsibleDepartment; }
  if (selected === 'revert') { reviewedDocument.status = 'Returned for changes'; reviewedDocument.state = 'transit'; reviewedDocument.destination = responsibleDepartment; }
  reviewedDocument.decisionReason = reason; reviewedDocument.reviewedBy = signedInUser?.name || 'Reviewer';
  localStorage.setItem('ksucDocuments', JSON.stringify(documents));
  const label = selected === 'approved' ? 'approved' : selected === 'not-approved' ? 'not approved' : `returned to ${responsibleDepartment} for changes`;
  activity.unshift(['KS', '#3971db', `<strong>${reviewedDocument.reviewedBy}</strong> ${label} ${reviewedDocument.ref}`, 'Just now']); renderDocuments(); renderActivity(); reviewModal.close();
});
document.querySelector('#documentForm').addEventListener('submit', () => { if (documents[0]) { documents[0].status = 'Awaiting action'; documents[0].state = ''; localStorage.setItem('ksucDocuments', JSON.stringify(documents)); renderDocuments(); } });
