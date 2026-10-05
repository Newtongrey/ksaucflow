/* =========================================================
   KSUCflow - Dashboard Application
   Frontend prototype
   ========================================================= */

const documents = [
  {
    ref: 'MI/FIN/2026/084',
    title: 'Quarter 3 budget reallocation request',
    origin: 'School of Engineering',
    destination: 'Finance',
    action: 'For approval',
    kind: 'action',
    status: 'Awaiting action',
    state: ''
  },
  {
    ref: 'MI/ADM/2026/127',
    title: 'Annual maintenance contract renewal',
    origin: 'Procurement Office',
    destination: 'Office of the Director',
    action: 'For signature',
    kind: 'review',
    status: 'In transit',
    state: 'transit'
  },
  {
    ref: 'MI/HR/2026/211',
    title: 'Request to recruit laboratory assistant',
    origin: 'School of Sciences',
    destination: 'Human Resources',
    action: 'For action',
    kind: 'action',
    status: 'Received',
    state: 'transit'
  },
  {
    ref: 'MI/ACA/2026/056',
    title: 'Proposed curriculum review schedule',
    origin: 'Academic Affairs',
    destination: 'Office of the Director',
    action: 'For review',
    kind: 'review',
    status: 'Completed',
    state: 'done'
  },
  {
    ref: 'MI/EXT/2026/092',
    title: 'Invitation to regional research forum',
    origin: 'Ministry of Education',
    destination: 'Academic Affairs',
    action: 'For information',
    kind: 'info',
    status: 'Received',
    state: 'transit'
  }
];

/* =========================================================
   STORAGE
   ========================================================= */

const savedDocuments = JSON.parse(
  localStorage.getItem('ksucDocuments') || 'null'
);

if (Array.isArray(savedDocuments)) {
  documents.splice(0, documents.length, ...savedDocuments);
}

const activity = JSON.parse(
  localStorage.getItem('ksucActivity') || 'null'
) || [
  ['AM', '#6584c8', '<strong>Finance</strong> received MI/FIN/2026/084', '12 minutes ago'],
  ['JK', '#ae806e', '<strong>James Kariuki</strong> routed a document to HR', '34 minutes ago'],
  ['AO', '#7c9f90', '<strong>Academic Affairs</strong> completed MI/ACA/2026/056', '1 hour ago'],
  ['SM', '#927bb7', '<strong>Sarah Mwangi</strong> registered a new document', '2 hours ago']
];
/* =========================================================
   PDF FILE STORAGE
   ========================================================= */

const PDF_DB_NAME = 'KSUCflowFiles';
const PDF_DB_VERSION = 1;
const PDF_STORE_NAME = 'documents';

function openPdfDatabase() {
  return new Promise((resolve, reject) => {

    const request = indexedDB.open(
      PDF_DB_NAME,
      PDF_DB_VERSION
    );

    request.onupgradeneeded = event => {

      const db = event.target.result;

      if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
        db.createObjectStore(
          PDF_STORE_NAME,
          { keyPath: 'ref' }
        );
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function savePdfFile(ref, file) {

  const db = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        PDF_STORE_NAME,
        'readwrite'
      );

    const store =
      transaction.objectStore(PDF_STORE_NAME);

    store.put({
      ref,
      name: file.name,
      type: file.type,
      size: file.size,
      file
    });

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function getPdfFile(ref) {

  const db = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        PDF_STORE_NAME,
        'readonly'
      );

    const store =
      transaction.objectStore(PDF_STORE_NAME);

    const request =
      store.get(ref);

    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function deletePdfFile(ref) {

  const db = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        PDF_STORE_NAME,
        'readwrite'
      );

    const store =
      transaction.objectStore(PDF_STORE_NAME);

    store.delete(ref);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
/* =========================================================
   HELPERS
   ========================================================= */

const rows = document.querySelector('#documentRows');
const activityList = document.querySelector('#activityList');

const escapeHtml = value =>
  String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

function saveDocuments() {
  localStorage.setItem(
    'ksucDocuments',
    JSON.stringify(documents)
  );
}

function saveActivity() {
  localStorage.setItem(
    'ksucActivity',
    JSON.stringify(activity)
  );
}

/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */

function showToast(message, type = 'success') {

  let container = document.querySelector('#toastContainer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position:fixed;
      top:24px;
      right:24px;
      z-index:99999;
      display:flex;
      flex-direction:column;
      gap:10px;
      width:min(380px,calc(100vw - 32px));
    `;

    document.body.appendChild(container);
  }

  const toast = document.createElement('div');

  const icon =
    type === 'error' ? '✕' :
    type === 'warning' ? '!' :
    '✓';

  const iconBackground =
    type === 'error' ? '#dc3545' :
    type === 'warning' ? '#d99a18' :
    '#23865b';

  toast.style.cssText = `
    display:flex;
    align-items:center;
    gap:12px;
    padding:14px 16px;
    background:#fff;
    border:1px solid #e5eaf0;
    border-radius:12px;
    box-shadow:0 15px 40px rgba(15,35,60,.15);
    color:#263548;
    font-size:13px;
    animation:ksucToastIn .25s ease;
  `;

  toast.innerHTML = `
    <span style="
      width:25px;
      height:25px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:${iconBackground};
      color:#fff;
      font-weight:700;
      flex-shrink:0;
    ">${icon}</span>

    <span style="flex:1;line-height:1.4">
      ${escapeHtml(message)}
    </span>

    <button style="
      border:0;
      background:transparent;
      color:#8a96a5;
      cursor:pointer;
      font-size:17px;
    ">×</button>
  `;

  toast.querySelector('button').onclick = () => toast.remove();

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.isConnected) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = '.25s ease';

      setTimeout(() => toast.remove(), 250);
    }
  }, 3500);
}

/* =========================================================
   DOCUMENT RENDERING
   ========================================================= */

function renderDocuments(list = documents) {

  if (!rows) return;

  rows.innerHTML = list.map(documentItem => {

    const isPending =
      documentItem.status === 'Awaiting action';

    return `
      <tr>

        <td>
          <span class="doc-title">
            ${escapeHtml(documentItem.title)}
          </span>

          <span class="ref">
            ${escapeHtml(documentItem.ref)}
          </span>
        </td>

        <td>
          ${escapeHtml(documentItem.origin)}
        </td>

        <td>
          <span class="route">
            ${escapeHtml(documentItem.destination)}
          </span>
        </td>

        <td>
          <span class="tag ${documentItem.kind}">
            ${escapeHtml(documentItem.action)}
          </span>
        </td>

        <td>
          <span class="status ${documentItem.state || ''}">
            ${escapeHtml(documentItem.status)}
          </span>
        </td>

        <td>

          <button
            class="review-button"
            data-ref="${escapeHtml(documentItem.ref)}"
            style="
              border:${isPending ? '0' : '1px solid #dce4eb'};
              border-radius:6px;
              background:${isPending ? '#376fd5' : '#fff'};
              color:${isPending ? '#fff' : '#526174'};
              padding:7px 10px;
              font-size:10px;
              cursor:pointer;
            "
          >
            ${isPending ? 'Review' : 'View'}
          </button>

        </td>

      </tr>
    `;
  }).join('');

  const countElement = document.querySelector('#docCount');

  if (countElement) {
    countElement.textContent = documents.length;
  }
}

/* =========================================================
   ACTIVITY
   ========================================================= */

function renderActivity() {

  if (!activityList) return;

  activityList.innerHTML = activity
    .slice(0, 8)
    .map(item => `
      <div class="activity-row">

        <div
          class="activity-dot"
          style="background:${item[1]}"
        >
          ${item[0]}
        </div>

        <div>
          <p>${item[2]}</p>
          <small>${item[3]}</small>
        </div>

      </div>
    `)
    .join('');
}

function addActivity(initials, colour, message) {

  activity.unshift([
    initials,
    colour,
    message,
    'Just now'
  ]);

  saveActivity();
  renderActivity();
}

/* =========================================================
   INITIAL RENDER
   ========================================================= */

renderDocuments();
renderActivity();

/* =========================================================
   SEARCH
   ========================================================= */

const search = document.querySelector('#search');

if (search) {

  search.addEventListener('input', event => {

    const term =
      event.target.value.trim().toLowerCase();

    if (!term) {
      renderDocuments(documents);
      return;
    }

    const filtered = documents.filter(documentItem =>
      Object.values(documentItem)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );

    renderDocuments(filtered);
  });
}

/* =========================================================
   REGISTER DOCUMENT
   ========================================================= */

/* =========================================================
   REGISTER DOCUMENT
   ========================================================= */

const modal =
  document.querySelector('#documentModal');

const documentForm =
  document.querySelector('#documentForm');

const documentFile =
  document.querySelector('#documentFile');

const selectedFile =
  document.querySelector('#selectedFile');

const selectedFileName =
  document.querySelector('#selectedFileName');

const removeSelectedFile =
  document.querySelector('#removeSelectedFile');


/* ---------------------------------------------------------
   OPEN REGISTER DOCUMENT MODAL
   --------------------------------------------------------- */

document
  .querySelector('#openModal')
  ?.addEventListener('click', () => {

    modal?.showModal();

  });


/* ---------------------------------------------------------
   PDF FILE SELECTION
   --------------------------------------------------------- */

documentFile?.addEventListener(
  'change',
  () => {

    const file =
      documentFile.files[0];

    if (!file) {

      if (selectedFile) {
        selectedFile.style.display = 'none';
      }

      return;
    }


    /* PDF ONLY */

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');


    if (!isPdf) {

      showToast(
        'Only PDF documents can be uploaded.',
        'error'
      );

      documentFile.value = '';

      if (selectedFile) {
        selectedFile.style.display = 'none';
      }

      return;
    }


    /* 10 MB MAXIMUM */

    const maxSize =
      10 * 1024 * 1024;


    if (file.size > maxSize) {

      showToast(
        'The PDF is too large. Maximum file size is 10 MB.',
        'error'
      );

      documentFile.value = '';

      if (selectedFile) {
        selectedFile.style.display = 'none';
      }

      return;
    }


    /* DISPLAY SELECTED FILE */

    if (selectedFileName) {

      const sizeMb =
        (file.size / (1024 * 1024))
          .toFixed(2);

      selectedFileName.textContent =
        `${file.name} (${sizeMb} MB)`;
    }

    if (selectedFile) {
      selectedFile.style.display = 'block';
    }

  });


/* ---------------------------------------------------------
   REMOVE SELECTED PDF
   --------------------------------------------------------- */

removeSelectedFile?.addEventListener(
  'click',
  () => {

    if (documentFile) {
      documentFile.value = '';
    }

    if (selectedFile) {
      selectedFile.style.display = 'none';
    }

  });


/* ---------------------------------------------------------
   REGISTER & ROUTE
   --------------------------------------------------------- */

documentForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    const ref =
      document
        .querySelector('#reference')
        .value
        .trim();

    const origin =
      document
        .querySelector('#origin')
        .value
        .trim();

    const title =
      document
        .querySelector('#subject')
        .value
        .trim();

    const destination =
      document
        .querySelector('#department')
        .value;

    const action =
      document
        .querySelector('#action')
        .value;

    const notes =
      document
        .querySelector('#notes')
        .value
        .trim();


    /* -----------------------------------------------------
       BASIC VALIDATION
       ----------------------------------------------------- */

    if (!ref || !origin || !title) {

      showToast(
        'Please complete all required document fields.',
        'warning'
      );

      return;
    }


    /* -----------------------------------------------------
       PDF VALIDATION
       ----------------------------------------------------- */

    const file =
      documentFile?.files?.[0] || null;


    if (!file) {

      showToast(
        'Please select a PDF document to upload.',
        'warning'
      );

      return;
    }


    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');


    if (!isPdf) {

      showToast(
        'Only PDF documents can be uploaded.',
        'error'
      );

      return;
    }


    const maxSize =
      10 * 1024 * 1024;


    if (file.size > maxSize) {

      showToast(
        'The PDF is too large. Maximum file size is 10 MB.',
        'error'
      );

      return;
    }


    /* -----------------------------------------------------
       DUPLICATE REFERENCE CHECK
       ----------------------------------------------------- */

    const duplicate =
      documents.some(
        item =>
          item.ref.toLowerCase() ===
          ref.toLowerCase()
      );


    if (duplicate) {

      showToast(
        'A document with this reference number already exists.',
        'error'
      );

      return;
    }


    /* -----------------------------------------------------
       SHOW UPLOAD STATE
       ----------------------------------------------------- */

    const submitButton =
      documentForm.querySelector(
        'button[type="submit"]'
      );

    const originalButtonText =
      submitButton?.textContent ||
      'Register & route';


    if (submitButton) {

      submitButton.disabled = true;

      submitButton.textContent =
        'Saving document...';
    }


    try {

      /* ---------------------------------------------------
         SAVE PDF INTO INDEXEDDB
         --------------------------------------------------- */

      await savePdfFile(
        ref,
        file
      );


      /* ---------------------------------------------------
         CREATE DOCUMENT RECORD
         --------------------------------------------------- */

      const newDocument = {

        ref,

        title,

        origin,

        destination,

        action,

        notes,

        kind:
          action === 'For information'
            ? 'info'
            : action === 'For review'
              ? 'review'
              : 'action',

        status:
          'Awaiting action',

        state:
          '',

        hasAttachment:
          true,

        attachmentName:
          file.name,

        attachmentType:
          'application/pdf',

        attachmentSize:
          file.size,

        createdAt:
          new Date().toISOString(),

        registeredBy:
          signedInUser?.name ||
          'Registry',

        history: [
          {
            action:
              'Document registered',

            by:
              signedInUser?.name ||
              'Registry',

            department:
              destination,

            date:
              new Date().toISOString(),

            note:
              notes ||
              'Document registered and routed.'
          }
        ],

        notesList:
          notes
            ? [
                {
                  note: notes,

                  by:
                    signedInUser?.name ||
                    'Registry',

                  date:
                    new Date().toISOString()
                }
              ]
            : []
      };


      /* ---------------------------------------------------
         ADD DOCUMENT
         --------------------------------------------------- */

      documents.unshift(
        newDocument
      );


      saveDocuments();


      /* ---------------------------------------------------
         ACTIVITY
         --------------------------------------------------- */

      addActivity(
        'RG',
        '#376fd5',
        `<strong>Registry</strong> registered ${escapeHtml(ref)} and routed it to ${escapeHtml(destination)}`
      );


      /* ---------------------------------------------------
         REFRESH DASHBOARD
         --------------------------------------------------- */

      renderDocuments();


      /* ---------------------------------------------------
         RESET FORM
         --------------------------------------------------- */

      documentForm.reset();

      if (selectedFile) {
        selectedFile.style.display =
          'none';
      }


      modal.close();


      /* ---------------------------------------------------
         SUCCESS
         --------------------------------------------------- */

      showToast(
        `Document ${ref} has been registered and routed to ${destination}.`
      );


    } catch (error) {

      console.error(
        'PDF upload error:',
        error
      );


      /* Remove partially saved PDF */

      try {
        await deletePdfFile(ref);
      } catch (cleanupError) {
        console.error(
          'PDF cleanup error:',
          cleanupError
        );
      }


      showToast(
        'The document could not be saved. Please try again.',
        'error'
      );


    } finally {

      if (submitButton) {

        submitButton.disabled =
          false;

        submitButton.textContent =
          originalButtonText;
      }

    }

  });

/* =========================================================
   SETTINGS
   ========================================================= */

const defaults = {
  title: 'KSUCflow',
  institution: 'KOITALEEL SAMOEI UNIVERSITY',
  label: 'Document management portal',
  welcome: 'Here is the movement across the institution today.',
  primary: '#376fd5',
  sidebar: '#182b4d'
};

function currentSettings() {

  const stored =
    JSON.parse(
      localStorage.getItem('ksucSettings') || 'null'
    );

  return stored || defaults;
}

function applySettings(settings) {

  const title = document.querySelector('#appTitle');
  const mark = document.querySelector('#brandMark');
  const institution =
    document.querySelector('#institutionName');
  const label =
    document.querySelector('#portalLabel');
  const welcome =
    document.querySelector('#welcomeText');

  if (title) {
    title.innerHTML =
      escapeHtml(settings.title);
  }

  if (mark) {
    mark.textContent =
      settings.title.charAt(0).toUpperCase() || 'K';
  }

  if (institution) {
    institution.childNodes[0].nodeValue =
      settings.institution.toUpperCase() + ' ';
  }

  if (label) {
    label.textContent = settings.label;
  }

  if (welcome) {
    welcome.textContent = settings.welcome;
  }

  document
    .querySelector('.sidebar')
    ?.style.setProperty(
      'background',
      settings.sidebar
    );

  document
    .querySelectorAll('.primary')
    .forEach(button =>
      button.style.background = settings.primary
    );

  document
    .querySelectorAll('.text-button')
    .forEach(button =>
      button.style.color = settings.primary
    );

  document.title =
    `${settings.title} | Document Tracker`;
}

function fillSettings(settings) {

  document.querySelector('#settingTitle').value =
    settings.title;

  document.querySelector('#settingInstitution').value =
    settings.institution;

  document.querySelector('#settingLabel').value =
    settings.label;

  document.querySelector('#settingWelcome').value =
    settings.welcome;

  document.querySelector('#settingPrimary').value =
    settings.primary;

  document.querySelector('#settingSidebar').value =
    settings.sidebar;
}

applySettings(currentSettings());

const customizer =
  document.querySelector('#customizerModal');

const settingsForm =
  document.querySelector('#customizerForm');

document
  .querySelector('#openCustomizer')
  ?.addEventListener('click', () => {

    fillSettings(currentSettings());

    customizer.showModal();
  });

settingsForm?.addEventListener('submit', event => {

  event.preventDefault();

  const settings = {

    title:
      document.querySelector('#settingTitle').value.trim()
      || defaults.title,

    institution:
      document.querySelector('#settingInstitution').value.trim()
      || defaults.institution,

    label:
      document.querySelector('#settingLabel').value.trim()
      || defaults.label,

    welcome:
      document.querySelector('#settingWelcome').value.trim()
      || defaults.welcome,

    primary:
      document.querySelector('#settingPrimary').value,

    sidebar:
      document.querySelector('#settingSidebar').value
  };

  localStorage.setItem(
    'ksucSettings',
    JSON.stringify(settings)
  );

  applySettings(settings);

  customizer.close();

  showToast('Portal settings have been saved.');
});

document
  .querySelector('#resetSettings')
  ?.addEventListener('click', () => {

    localStorage.removeItem('ksucSettings');

    fillSettings(defaults);
    applySettings(defaults);

    showToast('Portal settings restored to defaults.');
  });

/* =========================================================
   ADMIN USER MANAGEMENT
   ========================================================= */

const starterUsers = [
  {
    id: 1,
    name: 'Newton Mwangi',
    email: 'newton.mwangi@ksuc.ac.ke',
    department: 'Registry',
    role: 'Administrator',
    active: true
  },
  {
    id: 2,
    name: 'James Kariuki',
    email: 'james.kariuki@ksuc.ac.ke',
    department: 'Finance',
    role: 'Department Head',
    active: true
  },
  {
    id: 3,
    name: 'Sarah Mwangi',
    email: 'sarah.mwangi@ksuc.ac.ke',
    department: 'Human Resources',
    role: 'Staff',
    active: true
  },
  {
    id: 4,
    name: 'Brian Otieno',
    email: 'brian.otieno@ksuc.ac.ke',
    department: 'Academic Affairs',
    role: 'Staff',
    active: false
  }
];

function getUsers() {

  const stored =
    JSON.parse(
      localStorage.getItem('ksucUsers') || 'null'
    );

  if (Array.isArray(stored)) {
    return stored;
  }

  localStorage.setItem(
    'ksucUsers',
    JSON.stringify(starterUsers)
  );

  return starterUsers;
}

function saveUsers(users) {

  localStorage.setItem(
    'ksucUsers',
    JSON.stringify(users)
  );
}

const adminModal =
  document.querySelector('#adminModal');

const userModal =
  document.querySelector('#userModal');

const userRows =
  document.querySelector('#userRows');

function renderUsers() {

  if (!userRows) return;

  const users = getUsers();

  document.querySelector('#totalUsers').textContent =
    users.length;

  document.querySelector('#activeUsers').textContent =
    users.filter(user => user.active).length;

  document.querySelector('#adminUsers').textContent =
    users.filter(user => user.role === 'Administrator').length;

  userRows.innerHTML = users.map(user => `

    <tr>

      <td>
        <strong>${escapeHtml(user.name)}</strong>
        <span class="ref">${escapeHtml(user.email)}</span>
      </td>

      <td>${escapeHtml(user.department)}</td>

      <td>
        <span class="tag ${
          user.role === 'Administrator'
            ? 'review'
            : 'action'
        }">
          ${escapeHtml(user.role)}
        </span>
      </td>

      <td>
        <span class="status ${
          user.active ? 'done' : ''
        }">
          ${user.active ? 'Active' : 'Disabled'}
        </span>
      </td>

      <td>

        <div class="user-actions">

          <button
            data-action="toggle"
            data-id="${user.id}"
          >
            ${user.active ? 'Disable' : 'Enable'}
          </button>

          <button
            data-action="reset"
            data-id="${user.id}"
          >
            Reset password
          </button>

        </div>

      </td>

    </tr>

  `).join('');
}

renderUsers();

document
  .querySelector('#closeAdmin')
  ?.addEventListener('click', () =>
    adminModal.close()
  );

document
  .querySelector('#addUser')
  ?.addEventListener('click', () => {

    document.querySelector('#userForm').reset();

    document.querySelector('#userMode').textContent =
      'NEW USER';

    document.querySelector('#userModalTitle').textContent =
      'Create user account';

    document.querySelector('#saveUser').textContent =
      'Create user';

    userModal.showModal();
  });

document
  .querySelector('#userForm')
  ?.addEventListener('submit', event => {

    event.preventDefault();

    const users = getUsers();

    const email =
      document.querySelector('#userEmail')
        .value.trim()
        .toLowerCase();

    if (users.some(user =>
      user.email.toLowerCase() === email
    )) {

      showToast(
        'A user with this email already exists.',
        'error'
      );

      return;
    }

    users.push({

      id: Date.now(),

      name:
        document.querySelector('#userName')
          .value.trim(),

      email,

      department:
        document.querySelector('#userDepartment').value,

      role:
        document.querySelector('#userRole').value,

      active: true

    });

    saveUsers(users);

    renderUsers();

    userModal.close();

    showToast('User account created successfully.');
  });

userRows?.addEventListener('click', event => {

  const button =
    event.target.closest('button[data-action]');

  if (!button) return;

  const users = getUsers();

  const user =
    users.find(
      item => item.id === Number(button.dataset.id)
    );

  if (!user) return;

  if (button.dataset.action === 'toggle') {

    user.active = !user.active;

    saveUsers(users);
    renderUsers();

    showToast(
      `${user.name} has been ${
        user.active ? 'enabled' : 'disabled'
      }.`
    );

    return;
  }

  if (button.dataset.action === 'reset') {

    showToast(
      'Password reset will be connected to the secure backend in Phase 2.',
      'warning'
    );
  }

});

/* =========================================================
   NAVIGATION
   ========================================================= */

function setView(view) {

  const viewMessages = {

    overview: [
      'Document movement',
      'Recent records routed through the registry',
      documents
    ],

    documents: [
      'All documents',
      'Every document currently registered in KSUCflow',
      documents
    ],

    inbox: [
      'My inbox',
      'Documents requiring your attention',
      documents.filter(
        item => item.status === 'Awaiting action'
      )
    ],

    departments: [
      'Department routing',
      'Documents currently moving across departments',
      documents.filter(
        item => item.status !== 'Completed'
      )
    ],

    reports: [
      'Reports',
      'Current document movement report',
      documents
    ]
  };

  const selected = viewMessages[view];

  if (!selected) return;

  const [title, subtitle, list] = selected;

  document
    .querySelector('.document-panel .panel-heading h2')
    .textContent = title;

  document
    .querySelector('.document-panel .panel-heading p')
    .textContent = subtitle;

  renderDocuments(list);

  document
    .querySelectorAll('[data-view]')
    .forEach(link =>
      link.classList.toggle(
        'active',
        link.dataset.view === view
      )
    );

  if (view === 'reports') {

    showToast(
      `Report ready: ${documents.length} documents, ${documents.filter(d => d.status === 'Awaiting action').length} awaiting action, ${documents.filter(d => d.status === 'Completed').length} completed.`
    );
  }
}

document
  .querySelectorAll('[data-view]')
  .forEach(link =>
    link.addEventListener(
      'click',
      () => setView(link.dataset.view)
    )
  );

/* =========================================================
   FILTER
   ========================================================= */

document
  .querySelector('.filter')
  ?.addEventListener('click', () => {

    const pending =
      documents.filter(
        item => item.status === 'Awaiting action'
      );

    renderDocuments(pending);

    document
      .querySelector('.document-panel .panel-heading h2')
      .textContent =
      'Awaiting action';

    document
      .querySelector('.document-panel .panel-heading p')
      .textContent =
      `${pending.length} document(s) require attention`;

    showToast(
      `${pending.length} document(s) awaiting action.`
    );
  });

/* =========================================================
   HEADER BUTTONS
   ========================================================= */

document
  .querySelector('.icon-button')
  ?.addEventListener('click', () => {

    const count =
      documents.filter(
        item => item.status === 'Awaiting action'
      ).length;

    showToast(
      count
        ? `You have ${count} document(s) awaiting action.`
        : 'You have no documents awaiting action.'
    );
  });

document
  .querySelector('.text-button')
  ?.addEventListener(
    'click',
    () => setView('documents')
  );

document
  .querySelector('.full-width')
  ?.addEventListener('click', () => {

    showToast(
      'Activity feed is up to date.'
    );
  });

document
  .querySelector('.dots')
  ?.addEventListener('click', () => {

    renderActivity();

    showToast('Activity feed refreshed.');
  });

/* =========================================================
   SESSION
   ========================================================= */

const signedInUser =
  JSON.parse(
    localStorage.getItem('ksucSession') || 'null'
  );

if (signedInUser) {

  const firstName =
    signedInUser.name.split(' ')[0];

  const heading =
    document.querySelector('header h1');

  if (heading) {
    heading.textContent =
      `Good morning, ${firstName}.`;
  }

  const userCard =
    document.querySelector('.user-card');

  if (userCard) {

    const name =
      userCard.querySelector('strong');

    const role =
      userCard.querySelector('small');

    if (name) {
      name.textContent =
        signedInUser.name;
    }

    if (role) {
      role.textContent =
        `${signedInUser.role} · ${signedInUser.department}`;
    }
  }

  if (signedInUser.role !== 'Administrator') {

    document
      .querySelector('#openAdminDashboard')
      ?.style.setProperty(
        'display',
        'none'
      );

    document
      .querySelector('#openCustomizer')
      ?.style.setProperty(
        'display',
        'none'
      );
  }
}

/* =========================================================
   SIGN OUT
   ========================================================= */

document
  .querySelector('#signOut')
  ?.addEventListener('click', () => {

    if (
      !confirm(
        'Are you sure you want to sign out of KSUCflow?'
      )
    ) {
      return;
    }

    localStorage.removeItem('ksucSession');

    location.href = 'login.html';
  });

/* =========================================================
   DOCUMENT REVIEW
   ========================================================= */

let reviewedDocument = null;

const reviewModal =
  document.querySelector('#reviewModal');

const reviewForm =
  document.querySelector('#reviewForm');

const decision =
  document.querySelector('#decision');

const returnDepartmentLabel =
  document.querySelector('#returnDepartmentLabel');

function updateReviewFields() {

  if (!returnDepartmentLabel) return;

  returnDepartmentLabel.hidden =
    decision.value === 'approved';
}

rows?.addEventListener('click', event => {

  const button =
    event.target.closest('.review-button');

  if (!button) return;

  reviewedDocument =
    documents.find(
      item => item.ref === button.dataset.ref
    );

  if (!reviewedDocument) return;

  if (
    reviewedDocument.status !==
    'Awaiting action'
  ) {

    showToast(
      reviewedDocument.decisionReason
        ? `${reviewedDocument.status}: ${reviewedDocument.decisionReason}`
        : reviewedDocument.status
    );

    return;
  }

  document.querySelector('#reviewDocument')
    .textContent =
    `${reviewedDocument.ref} — ${reviewedDocument.title}`;

  reviewForm.reset();

  document.querySelector('#returnDepartment').value =
    reviewedDocument.destination;

  updateReviewFields();

  reviewModal.showModal();
});

decision?.addEventListener(
  'change',
  updateReviewFields
);

reviewForm?.addEventListener(
  'submit',
  event => {

    event.preventDefault();

    if (!reviewedDocument) return;

    const reason =
      document.querySelector('#decisionReason')
        .value.trim();

    if (!reason) {

      showToast(
        'Please enter a decision note or instruction.',
        'warning'
      );

      return;
    }

    const selected =
      decision.value;

    const responsibleDepartment =
      document.querySelector('#returnDepartment').value;

    if (selected === 'approved') {

      reviewedDocument.status =
        'Approved';

      reviewedDocument.state =
        'done';
    }

    if (selected === 'not-approved') {

      reviewedDocument.status =
        'Not approved';

      reviewedDocument.state =
        '';

      reviewedDocument.destination =
        responsibleDepartment;
    }

    if (selected === 'revert') {

      reviewedDocument.status =
        'Returned for changes';

      reviewedDocument.state =
        'transit';

      reviewedDocument.destination =
        responsibleDepartment;
    }

    reviewedDocument.decisionReason =
      reason;

    reviewedDocument.reviewedBy =
      signedInUser?.name || 'Reviewer';

    saveDocuments();

    const label =
      selected === 'approved'
        ? 'approved'
        : selected === 'not-approved'
          ? 'not approved'
          : `returned to ${responsibleDepartment} for changes`;

    addActivity(
      'KS',
      '#3971db',
      `<strong>${escapeHtml(reviewedDocument.reviewedBy)}</strong> ${label} ${escapeHtml(reviewedDocument.ref)}`
    );

    renderDocuments();

    reviewModal.close();

    showToast(
      `${reviewedDocument.ref} has been ${label}.`
    );

    reviewedDocument = null;
  }
);

/* =========================================================
   SMALL CSS FOR TOAST
   ========================================================= */

if (!document.querySelector('#ksucToastStyles')) {

  const style =
    document.createElement('style');

  style.id = 'ksucToastStyles';

  style.textContent = `
    @keyframes ksucToastIn {
      from {
        opacity:0;
        transform:translateX(20px);
      }
      to {
        opacity:1;
        transform:translateX(0);
      }
    }
  `;

  document.head.appendChild(style);
}
