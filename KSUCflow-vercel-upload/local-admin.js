/* KSUCflow local-only administration portal. Demo data is browser-specific. */
(function () {
  'use strict';
  const demo = window.KSUCflowDemo;
  if (!demo) return;
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel = value => value ? new Date(value).toLocaleDateString('en-KE',{day:'2-digit',month:'short',year:'numeric'}) : '—';
  let users = [];
  function load() {
    users = demo.readUsers();
    render();
    $('adminName').textContent = demo.getSession()?.name || 'Administrator';
    $('adminAvatar').textContent = ($('adminName').textContent.match(/\b\w/g)||['A']).slice(0,2).join('').toUpperCase();
    $('totalUsers').textContent = users.length;
    $('activeUsers').textContent = users.filter(u => u.active !== false && demo.normalizeRole(u.role) !== 'Administrator').length;
    $('adminUsers').textContent = users.filter(u => demo.normalizeRole(u.role) === 'Administrator' && u.active !== false).length;
    try { $('documentTotal').textContent = JSON.parse(localStorage.getItem('ksucDocuments') || '[]').length; } catch (_) { $('documentTotal').textContent = '0'; }
    $('directoryCount').textContent = users.length + ' profiles · stored in this browser';
    $('authCheck').textContent = 'Local demo session';
    $('dbCheck').textContent = 'Browser localStorage (not a shared database)';
    $('authDot').classList.add('ok'); $('dbDot').classList.add('ok');
  }
  function render() {
    const query = $('profileSearch').value.trim().toLowerCase();
    const dept = $('departmentFilter').value;
    const role = $('roleFilter').value;
    const filtered = users.filter(u => (!query || [u.full_name,u.email,u.staff_number,u.id].some(v => String(v||'').toLowerCase().includes(query))) && (!dept || u.department === dept) && (!role || demo.normalizeRole(u.role) === role));
    $('userRows').innerHTML = filtered.length ? filtered.map(u => {
      const name = u.full_name || 'Unnamed staff';
      return '<tr><td><div class="profile-name"><span class="profile-avatar">'+escapeHtml(name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase())+'</span><span><strong>'+escapeHtml(name)+'</strong><small>'+escapeHtml(u.email)+'</small><small>'+escapeHtml(u.staff_number||u.id)+'</small></span></div></td>'+
      '<td>'+escapeHtml(u.department||'Unassigned')+'</td><td>'+escapeHtml(demo.normalizeRole(u.role))+'</td><td>'+dateLabel(u.created_at)+'</td>'+
      '<td><div class="admin-row-actions"><button class="copy-button" data-toggle="'+escapeHtml(u.id)+'" type="button">'+(u.active===false?'Reactivate':'Deactivate')+'</button><button class="copy-button" data-edit="'+escapeHtml(u.id)+'" type="button">Edit</button></div><small class="muted">'+(u.active===false?'Inactive':'Active')+'</small></td></tr>';
    }).join('') : '<tr><td colspan="5" class="table-message">No profiles match these filters.</td></tr>';
    $('directoryCount').textContent = 'Showing '+filtered.length+' of '+users.length+' profiles · local demo only';
    $('totalUsers').textContent = users.length;
    $('activeUsers').textContent = users.filter(u=>u.active!==false&&demo.normalizeRole(u.role)!=='Administrator').length;
    $('adminUsers').textContent = users.filter(u=>demo.normalizeRole(u.role)==='Administrator'&&u.active!==false).length;
    const departments = [...new Set(users.map(u=>u.department).filter(Boolean))].sort();
    const selected = $('departmentFilter').value;
    $('departmentFilter').innerHTML = '<option value="">All departments</option>'+departments.map(d=>'<option'+(d===selected?' selected':'')+'>'+escapeHtml(d)+'</option>').join('');
  }
  function feedback(message, error) {
    const el = $('staffFeedback'); el.textContent = message; el.style.color = error ? '#9c3030' : '#287a50';
  }
  function cleanEmail(value) { return String(value||'').trim().toLowerCase(); }
  function createProfile(data) {
    const email = cleanEmail(data.email);
    if (!data.full_name || !email) throw new Error('Full name and email are required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    if (users.some(u => cleanEmail(u.email) === email)) throw new Error('An account with '+email+' already exists.');
    const profile = {
      id: 'demo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),
      full_name: data.full_name.trim(), email, staff_number: String(data.staff_number||'').trim(),
      department: String(data.department||'Unassigned').trim() || 'Unassigned',
      job_title: String(data.job_title||'').trim(), role: demo.normalizeRole(data.role),
      active: true, password: String(data.password||'DemoStaff123!'),
      created_at: new Date().toISOString(), demo: true
    };
    users.push(profile); demo.saveUsers(users); return profile;
  }
  function csvCell(value) { const s=String(value==null?'':value); return '"'+s.replace(/"/g,'""')+'"'; }
  function download(name, text, type) {
    const blob = new Blob([text],{type:type||'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url);
  }
  function parseCsv(text) {
    const rows=[]; let row=[], cell='', quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i], next=text[i+1];
      if(ch==='"'&&quoted&&next==='"'){cell+='"';i++;}
      else if(ch==='"') quoted=!quoted;
      else if(ch===','&&!quoted){row.push(cell.trim());cell='';}
      else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell.trim());if(row.some(v=>v!==''))rows.push(row);row=[];cell='';}
      else cell+=ch;
    }
    if(cell.length||row.length){row.push(cell.trim());if(row.some(v=>v!==''))rows.push(row);}
    if(!rows.length) throw new Error('The CSV file is empty.');
    const headers=rows.shift().map(h=>h.replace(/^\uFEFF/,'').trim().toLowerCase().replace(/[\s-]+/g,'_'));
    const required=['full_name','email','department','role'];
    const missing=required.filter(h=>!headers.includes(h));
    if(missing.length) throw new Error('Missing required CSV columns: '+missing.join(', ')+'. Download the template for the correct headings.');
    return rows.map((cells,index)=>{const obj={};headers.forEach((h,i)=>obj[h]=cells[i]||'');obj._row=index+2;return obj;});
  }
  $('staffForm').addEventListener('submit', function(e){
    e.preventDefault();
    try {
      const user=createProfile({full_name:$('staffName').value,email:$('staffEmail').value,staff_number:$('staffNumber').value,department:$('staffDepartment').value,job_title:$('staffJobTitle').value,role:$('staffRole').value,password:$('staffPassword').value});
      $('staffForm').reset(); $('staffPassword').value='DemoStaff123!';
      load(); feedback('Created '+user.full_name+'. Demo password: '+user.password+' (local demo only).');
    } catch(err) { feedback(err.message,true); }
  });
  $('bulkImportForm').addEventListener('submit', async function(e){
    e.preventDefault(); const file=$('staffCsv').files[0]; if(!file){feedback('Choose a CSV file first.',true);return;}
    try {
      const rows=parseCsv(await file.text()); let created=0, skipped=0; const issues=[];
      rows.forEach(row=>{
        try { createProfile({full_name:row.full_name,email:row.email,staff_number:row.staff_number,department:row.department,job_title:row.job_title,role:row.role,password:row.demo_password||'DemoStaff123!'});created++; }
        catch(err){skipped++;issues.push('Row '+row._row+': '+err.message);}
      });
      load(); $('bulkImportSummary').textContent='Import complete: '+created+' created, '+skipped+' skipped. All records exist only in this browser.';
      if(issues.length) $('bulkImportIssues').textContent=issues.slice(0,30).join('\n')+(issues.length>30?'\n…and '+(issues.length-30)+' more issues.':'');
      else $('bulkImportIssues').textContent='No row errors.';
      feedback('Bulk import finished.',skipped>0);
    } catch(err){feedback(err.message,true);}
  });
  $('downloadCsvTemplate').addEventListener('click',function(){
    const headers=['full_name','email','staff_number','department','job_title','role'];
    const example=['Jane Demo','jane.demo@ksuc.ac.ke','DEMO-004','ICT Department','ICT Officer','Staff'];
    download('KSUCflow-staff-import-template.csv',[headers.map(csvCell).join(','),example.map(csvCell).join(',')].join('\r\n'),'text/csv;charset=utf-8;');
  });
  $('exportStaffCsv').addEventListener('click',function(){
    const headers=['full_name','email','staff_number','department','job_title','role','active','created_at'];
    const rows=users.map(u=>headers.map(k=>csvCell(k==='role'?demo.normalizeRole(u[k]):u[k])).join(','));
    download('KSUCflow-staff-directory-demo.csv',[headers.map(csvCell).join(','),...rows].join('\r\n'),'text/csv;charset=utf-8;');
  });
  $('userRows').addEventListener('click',function(e){
    const toggle=e.target.closest('[data-toggle]'); const edit=e.target.closest('[data-edit]');
    if(toggle){const u=users.find(x=>x.id===toggle.dataset.toggle);if(!u)return;if(u.id==='demo-admin-001'&&u.active!==false&&users.filter(x=>demo.normalizeRole(x.role)==='Administrator'&&x.active!==false).length===1){alert('The last active administrator cannot be deactivated.');return;}u.active=u.active===false;demo.saveUsers(users);load();return;}
    if(edit){const u=users.find(x=>x.id===edit.dataset.edit);if(!u)return;
      const name=prompt('Full name:',u.full_name);if(name===null)return;
      const email=prompt('Email:',u.email);if(email===null)return;
      const dept=prompt('Department:',u.department||'');if(dept===null)return;
      const role=prompt('Role (Staff, Department Head, Administrator):',demo.normalizeRole(u.role));if(role===null)return;
      const normalized=demo.normalizeRole(role);if(normalized==='Administrator'&&demo.normalizeRole(u.role)!=='Administrator'&&!confirm('Grant administrator access to '+name+'?'))return;
      if(users.some(x=>x.id!==u.id&&cleanEmail(x.email)===cleanEmail(email))){alert('That email is already assigned to another profile.');return;}
      u.full_name=name.trim();u.email=cleanEmail(email);u.department=dept.trim()||'Unassigned';u.role=normalized;demo.saveUsers(users);load();
    }
  });
  ['profileSearch','departmentFilter','roleFilter'].forEach(id=>$(id).addEventListener(id==='profileSearch'?'input':'change',render));
  $('refreshProfiles').addEventListener('click',load);
  $('signOut').addEventListener('click',demo.signOut);
  $('settingsForm').addEventListener('submit',function(e){e.preventDefault();const settings={title:$('appName').value.trim()||'KSUCflow',institution:$('institution').value.trim()||'KOITALEEL SAMOEI UNIVERSITY COLLEGE',primary:$('primaryColor').value};localStorage.setItem('ksucAdminSettings',JSON.stringify(settings));$('brandName').textContent=settings.title;document.documentElement.style.setProperty('--brand',settings.primary);document.documentElement.style.setProperty('--brand-dark',settings.primary);$('settingsFeedback').textContent='Saved in this browser.';});
  $('resetSettings').addEventListener('click',function(){localStorage.removeItem('ksucAdminSettings');$('appName').value='KSUCflow';$('institution').value='KOITALEEL SAMOEI UNIVERSITY COLLEGE';$('primaryColor').value='#7D0000';$('brandName').textContent='KSUCflow';document.documentElement.style.setProperty('--brand','#7D0000');document.documentElement.style.setProperty('--brand-dark','#7D0000');$('settingsFeedback').textContent='Defaults restored.';});
  const saved=JSON.parse(localStorage.getItem('ksucAdminSettings')||'{}');$('appName').value=saved.title||'KSUCflow';$('institution').value=saved.institution||'KOITALEEL SAMOEI UNIVERSITY COLLEGE';$('primaryColor').value=saved.primary||'#7D0000';$('brandName').textContent=$('appName').value;document.documentElement.style.setProperty('--brand',$('primaryColor').value);document.documentElement.style.setProperty('--brand-dark',$('primaryColor').value);
  $('primaryColor').addEventListener('input',()=>{const v=$('primaryColor').value;document.documentElement.style.setProperty('--brand',v);document.documentElement.style.setProperty('--brand-dark',v);});
  $('signOut').addEventListener('click',demo.signOut);
  $('inviteUserForm')?.addEventListener('submit',e=>{e.preventDefault();$('staffName').value=$('inviteFullName').value;$('staffEmail').value=$('inviteEmail').value;$('staffDepartment').value=$('inviteDepartment').value;$('staffRole').value=$('inviteRole').value;$('staffForm').requestSubmit();});
  load();
})();