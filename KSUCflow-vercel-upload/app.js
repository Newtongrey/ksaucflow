/* =========================================================
   KSUCflow - Main Application
   ========================================================= */

'use strict';


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const DOCUMENTS_KEY = 'ksucDocuments';
const ACTIVITY_KEY = 'ksucActivity';
const SETTINGS_KEY = 'ksucSettings';
const SESSION_KEY = 'ksucSession';


/* =========================================================
   PDF DATABASE
   Browser IndexedDB storage for uploaded PDF files.
   ========================================================= */

const PDF_DB_NAME = 'KSUCflowFiles';
const PDF_DB_VERSION = 1;
const PDF_STORE_NAME = 'documents';


/* =========================================================
   DEFAULT DOCUMENTS
   ========================================================= */

const starterDocuments = [
  {
    ref: 'KSU/FIN/2026/084',
    title: 'Budget Reallocation Request',
    origin: 'Finance Department',
    destination: 'Vice Chancellor\'s Office',
    action: 'For approval',
    notes: 'Request for approval of budget reallocation.',
    kind: 'Internal',
    status: 'Awaiting action',
    state: '',
    hasAttachment: false,
    attachmentName: '',
    attachmentType: '',
    attachmentSize: 0,
    createdAt: '2026-09-10T09:20:00',
    registeredBy: 'System',
    history: [
      {
        action: 'Document registered',
        by: 'System',
        department: 'Finance Department',
        date: '2026-09-10T09:20:00',
        note: 'Document registered and routed.'
      }
    ],
    notesList: []
  },

  {
    ref: 'KSU/ADM/2026/127',
    title: 'Maintenance Contract',
    origin: 'Administration',
    destination: 'Procurement',
    action: 'For action',
    notes: 'Maintenance contract submitted for processing.',
    kind: 'Internal',
    status: 'In transit',
    state: '',
    hasAttachment: false,
    attachmentName: '',
    attachmentType: '',
    attachmentSize: 0,
    createdAt: '2026-09-09T11:15:00',
    registeredBy: 'System',
    history: [
      {
        action: 'Document registered',
        by: 'System',
        department: 'Administration',
        date: '2026-09-09T11:15:00',
        note: 'Document registered.'
      },
      {
        action: 'Forwarded',
        by: 'System',
        department: 'Procurement',
        date: '2026-09-09T12:30:00',
        note: 'Forwarded to Procurement.'
      }
    ],
    notesList: []
  },

  {
    ref: 'KSU/HR/2026/211',
    title: 'Recruitment of Laboratory Assistant',
    origin: 'Human Resource',
    destination: 'Vice Chancellor\'s Office',
    action: 'For approval',
    notes: '',
    kind: 'Internal',
    status: 'Awaiting action',
    state: '',
    hasAttachment: false,
    attachmentName: '',
    attachmentType: '',
    attachmentSize: 0,
    createdAt: '2026-09-08T10:00:00',
    registeredBy: 'System',
    history: [
      {
        action: 'Document registered',
        by: 'System',
        department: 'Human Resource',
        date: '2026-09-08T10:00:00',
        note: 'Document registered.'
      }
    ],
    notesList: []
  },

  {
    ref: 'KSU/ACA/2026/056',
    title: 'Curriculum Review',
    origin: 'Academics',
    destination: 'Academic Affairs',
    action: 'For review',
    notes: 'Curriculum review documents submitted.',
    kind: 'Academic',
    status: 'Approved',
    state: '',
    hasAttachment: false,
    attachmentName: '',
    attachmentType: '',
    attachmentSize: 0,
    createdAt: '2026-09-07T14:00:00',
    registeredBy: 'System',
    history: [
      {
        action: 'Document registered',
        by: 'System',
        department: 'Academics',
        date: '2026-09-07T14:00:00',
        note: 'Document registered.'
      },
      {
        action: 'Approved',
        by: 'System',
        department: 'Academic Affairs',
        date: '2026-09-08T09:30:00',
        note: 'Curriculum review approved.'
      }
    ],
    notesList: []
  },

  {
    ref: 'KSU/EXT/2026/092',
    title: 'Invitation to External Engagement',
    origin: 'External Relations',
    destination: 'Vice Chancellor\'s Office',
    action: 'For information',
    notes: '',
    kind: 'External',
    status: 'Awaiting action',
    state: '',
    hasAttachment: false,
    attachmentName: '',
    attachmentType: '',
    attachmentSize: 0,
    createdAt: '2026-09-06T08:30:00',
    registeredBy: 'System',
    history: [
      {
        action: 'Document registered',
        by: 'System',
        department: 'External Relations',
        date: '2026-09-06T08:30:00',
        note: 'External document registered.'
      }
    ],
    notesList: []
  }
];


/* =========================================================
   LOAD DOCUMENTS
   ========================================================= */

let documents = loadDocuments();


function loadDocuments() {

  try {

    const saved = localStorage.getItem(DOCUMENTS_KEY);

    if (!saved) {

      localStorage.setItem(
        DOCUMENTS_KEY,
        JSON.stringify(starterDocuments)
      );

      return [...starterDocuments];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [...starterDocuments];
    }

    return parsed;

  } catch (error) {

    console.error('Unable to load documents:', error);

    return [...starterDocuments];
  }
}


/* =========================================================
   ACTIVITY
   ========================================================= */

let activity = loadActivity();


function loadActivity() {

  try {

    const saved = localStorage.getItem(ACTIVITY_KEY);

    if (saved) {

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

  } catch (error) {

    console.error('Unable to load activity:', error);
  }

  return [
    {
      action: 'System started',
      detail: 'KSUCflow document management portal is ready.',
      date: new Date().toISOString(),
      type: 'system'
    }
  ];
}


/* =========================================================
   SAVE HELPERS
   ========================================================= */

function saveDocuments() {

  localStorage.setItem(
    DOCUMENTS_KEY,
    JSON.stringify(documents)
  );
}


function saveActivity() {

  localStorage.setItem(
    ACTIVITY_KEY,
    JSON.stringify(activity)
  );
}


/* =========================================================
   CURRENT USER
   ========================================================= */

function getCurrentUser() {

  try {

    const session = localStorage.getItem(SESSION_KEY);

    if (session) {

      const parsed = JSON.parse(session);

      return {
        name: parsed.name || parsed.username || 'Current User',
        role: parsed.role || 'Staff',
        department: parsed.department || 'ICT'
      };
    }

  } catch (error) {

    console.warn('Session could not be read.');
  }

  return {
    name: 'Current User',
    role: 'Staff',
    department: 'ICT'
  };
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(value) {

  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(bytes) {

  if (!bytes) {
    return '0 KB';
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(message, type = 'success') {

  const toast = document.querySelector('#toast');

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.className = `toast ${type}`;

  toast.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove('show');

  }, 3500);
}


/* =========================================================
   ADD ACTIVITY
   ========================================================= */

function addActivity(action, detail, type = 'document') {

  activity.unshift({
    action,
    detail,
    type,
    date: new Date().toISOString()
  });

  activity = activity.slice(0, 50);

  saveActivity();

  renderActivity();
}


/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderDashboard() {

  const total = documents.length;

  const awaiting = documents.filter(
    doc => doc.status === 'Awaiting action'
  ).length;

  const approved = documents.filter(
    doc => doc.status === 'Approved'
  ).length;

  const transit = documents.filter(
    doc => doc.status === 'In transit'
  ).length;


  const totalEl = document.querySelector('#totalDocuments');
  const awaitingEl = document.querySelector('#awaitingDocuments');
  const approvedEl = document.querySelector('#approvedDocuments');
  const transitEl = document.querySelector('#transitDocuments');


  if (totalEl) {
    totalEl.textContent = total;
  }

  if (awaitingEl) {
    awaitingEl.textContent = awaiting;
  }

  if (approvedEl) {
    approvedEl.textContent = approved;
  }

  if (transitEl) {
    transitEl.textContent = transit;
  }


  updateNotificationCount();

  renderDocuments();
  renderActivity();
}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function statusClass(status) {

  switch (status) {

    case 'Approved':
      return 'approved';

    case 'Rejected':
    case 'Not approved':
      return 'rejected';

    case 'Returned for changes':
      return 'returned';

    case 'In transit':
      return 'transit';

    case 'Awaiting action':
      return 'pending';

    default:
      return '';
  }
}


/* =========================================================
   RENDER DOCUMENTS
   ========================================================= */

function renderDocuments(searchTerm = '') {

  const container = document.querySelector('#recentDocuments');

  if (!container) {
    return;
  }

  const query = searchTerm.trim().toLowerCase();


  let filtered = [...documents];

  if (query) {

    filtered = filtered.filter(doc => {

      return [
        doc.ref,
        doc.title,
        doc.origin,
        doc.destination,
        doc.action,
        doc.status
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);

    });
  }


  filtered.sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );


  filtered = filtered.slice(0, 8);


  if (!filtered.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">▤</div>
        <h3>No documents found</h3>
        <p>There are no documents matching your search.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = filtered.map(doc => {

    const attachment = doc.hasAttachment
      ? `<span class="attachment-indicator">PDF</span>`
      : '';


    return `
      <div class="document-row">

        <div class="document-main">

          <div class="document-icon">
            ${doc.hasAttachment ? '📄' : '▤'}
          </div>

          <div class="document-info">

            <strong>
              ${escapeHtml(doc.title || 'Untitled Document')}
            </strong>

            <span>
              ${escapeHtml(doc.ref || '')}
            </span>

            <small>
              ${escapeHtml(doc.origin || '')}
              → 
              ${escapeHtml(doc.destination || '')}
            </small>

          </div>

        </div>


        <div class="document-meta">

          ${attachment}

          <span class="status-badge ${statusClass(doc.status)}">
            ${escapeHtml(doc.status || 'Unknown')}
          </span>

          <small>
            ${formatDate(doc.createdAt)}
          </small>

          <a
            href="document-view.html?ref=${encodeURIComponent(doc.ref)}"
            class="row-action"
          >
            View
          </a>

        </div>

      </div>
    `;

  }).join('');
}


/* =========================================================
   RENDER ACTIVITY
   ========================================================= */

function renderActivity() {

  const container = document.querySelector('#activityList');

  if (!container) {
    return;
  }


  const items = activity.slice(0, 8);


  if (!items.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◷</div>
        <h3>No recent activity</h3>
        <p>Activity will appear here.</p>
      </div>
    `;

    return;
  }


  container.innerHTML = items.map(item => {

    return `
      <div class="activity-item">

        <div class="activity-dot"></div>

        <div class="activity-content">

          <strong>
            ${escapeHtml(item.action)}
          </strong>

          <p>
            ${escapeHtml(item.detail)}
          </p>

          <small>
            ${formatDate(item.date)}
          </small>

        </div>

      </div>
    `;

  }).join('');
}


/* =========================================================
   INDEXEDDB
   ========================================================= */

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
          {
            keyPath: 'ref'
          }
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


/* =========================================================
   SAVE PDF
   ========================================================= */

async function savePdfFile(ref, file) {

  const db = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      PDF_STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(
      PDF_STORE_NAME
    );


    store.put({
      ref,
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      savedAt: new Date().toISOString()
    });


    transaction.oncomplete = () => {

      db.close();

      resolve(true);
    };


    transaction.onerror = () => {

      db.close();

      reject(transaction.error);
    };

  });
}


/* =========================================================
   GET PDF
   ========================================================= */

async function getPdfFile(ref) {

  const db = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      PDF_STORE_NAME,
      'readonly'
    );

    const store = transaction.objectStore(
      PDF_STORE_NAME
    );

    const request = store.get(ref);


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


/* =========================================================
   DELETE PDF
   ========================================================= */

async function deletePdfFile(ref) {

  try {

    const db = await openPdfDatabase();

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(
        PDF_STORE_NAME,
        'readwrite'
      );

      const store = transaction.objectStore(
        PDF_STORE_NAME
      );

      store.delete(ref);


      transaction.oncomplete = () => {

        db.close();

        resolve(true);
      };


      transaction.onerror = () => {

        db.close();

        reject(transaction.error);
      };

    });

  } catch (error) {

    console.error(
      'Unable to delete PDF:',
      error
    );

    return false;
  }
}


/* =========================================================
   PDF FILE SELECTION
   ========================================================= */

function setupPdfUpload() {

  const fileInput =
    document.querySelector('#documentFile');

  const selectedFile =
    document.querySelector('#selectedFile');

  const selectedFileName =
    document.querySelector('#selectedFileName');

  const removeButton =
    document.querySelector('#removeSelectedFile');


  if (!fileInput) {
    return;
  }


  fileInput.addEventListener(
    'change',
    () => {

      const file = fileInput.files?.[0];

      if (!file) {

        if (selectedFile) {
          selectedFile.style.display = 'none';
        }

        return;
      }


      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');


      if (!isPdf) {

        fileInput.value = '';

        if (selectedFile) {
          selectedFile.style.display = 'none';
        }

        showToast(
          'Only PDF files are allowed.',
          'error'
        );

        return;
      }


      const maxSize =
        10 * 1024 * 1024;


      if (file.size > maxSize) {

        fileInput.value = '';

        if (selectedFile) {
          selectedFile.style.display = 'none';
        }

        showToast(
          'The PDF must not exceed 10 MB.',
          'error'
        );

        return;
      }


      if (selectedFileName) {

        selectedFileName.textContent =
          `${file.name} (${formatFileSize(file.size)})`;
      }


      if (selectedFile) {

        selectedFile.style.display =
          'block';
      }

    }
  );


  removeButton?.addEventListener(
    'click',
    () => {

      fileInput.value = '';

      if (selectedFile) {
        selectedFile.style.display = 'none';
      }

      if (selectedFileName) {
        selectedFileName.textContent = '';
      }

    }
  );
}


/* =========================================================
   REGISTER DOCUMENT
   ========================================================= */

function setupDocumentRegistration() {

  const modal =
    document.querySelector('#documentModal');

  const form =
    document.querySelector('#documentForm');

  const openButton =
    document.querySelector('#openModal');

  const quickButton =
    document.querySelector('#quickRegisterBtn');

  const cancelButton =
    document.querySelector('#cancelDocumentBtn');

  const closeButton =
    document.querySelector('#closeDocumentModal');


  function openRegisterModal() {

    if (!modal) {
      return;
    }

    modal.showModal();
  }


  function closeRegisterModal() {

    if (!modal) {
      return;
    }

    if (modal.open) {
      modal.close();
    }

    resetDocumentForm();
  }


  openButton?.addEventListener(
    'click',
    openRegisterModal
  );


  quickButton?.addEventListener(
    'click',
    openRegisterModal
  );


  closeButton?.addEventListener(
    'click',
    closeRegisterModal
  );


  /*
    IMPORTANT:
    This is type="button" in index.html,
    therefore it does NOT trigger validation.
  */

  cancelButton?.addEventListener(
    'click',
    event => {

      event.preventDefault();

      closeRegisterModal();
    }
  );


  /*
    CLOSE WHEN CLICKING OUTSIDE THE DIALOG
  */

  modal?.addEventListener(
    'click',
    event => {

      const rect =
        modal.getBoundingClientRect();

      const clickedInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;


      if (!clickedInside) {

        closeRegisterModal();
      }

    }
  );


  /*
    SUBMIT
  */

  form?.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      const reference =
        document.querySelector('#reference')
          ?.value
          .trim();

      const origin =
        document.querySelector('#origin')
          ?.value
          .trim();

      const title =
        document.querySelector('#subject')
          ?.value
          .trim();

      const destination =
        document.querySelector('#department')
          ?.value;

      const action =
        document.querySelector('#action')
          ?.value;

      const notes =
        document.querySelector('#notes')
          ?.value
          .trim() || '';


      const fileInput =
        document.querySelector('#documentFile');

      const file =
        fileInput?.files?.[0] || null;


      /* =========================
         VALIDATION
      ========================== */

      if (!reference) {

        showToast(
          'Please enter the reference number.',
          'error'
        );

        document.querySelector('#reference')?.focus();

        return;
      }


      if (!origin) {

        showToast(
          'Please enter the origin of the document.',
          'error'
        );

        document.querySelector('#origin')?.focus();

        return;
      }


      if (!title) {

        showToast(
          'Please enter the document subject.',
          'error'
        );

        document.querySelector('#subject')?.focus();

        return;
      }


      if (!destination) {

        showToast(
          'Please select the department to route the document to.',
          'error'
        );

        document.querySelector('#department')?.focus();

        return;
      }


      if (!action) {

        showToast(
          'Please select the required action.',
          'error'
        );

        document.querySelector('#action')?.focus();

        return;
      }


      if (!file) {

        showToast(
          'Please attach the PDF document.',
          'error'
        );

        fileInput?.focus();

        return;
      }


      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');


      if (!isPdf) {

        showToast(
          'Only PDF files are allowed.',
          'error'
        );

        return;
      }


      if (file.size > 10 * 1024 * 1024) {

        showToast(
          'The PDF must not exceed 10 MB.',
          'error'
        );

        return;
      }


      /*
        CHECK DUPLICATE REFERENCE
      */

      const duplicate =
        documents.some(
          doc =>
            String(doc.ref).toLowerCase() ===
            reference.toLowerCase()
        );


      if (duplicate) {

        showToast(
          'A document with this reference already exists.',
          'error'
        );

        return;
      }


      /* =========================
         CURRENT USER
      ========================== */

      const currentUser =
        getCurrentUser();


      /* =========================
         CREATE DOCUMENT
      ========================== */

      const now =
        new Date().toISOString();


      const newDocument = {

        ref: reference,

        title,

        origin,

        destination,

        action,

        notes,

        kind: 'Internal',

        status: 'Awaiting action',

        state: '',

        hasAttachment: true,

        attachmentName: file.name,

        attachmentType:
          file.type || 'application/pdf',

        attachmentSize: file.size,

        createdAt: now,

        registeredBy:
          currentUser.name,

        registeredByDepartment:
          currentUser.department,

        history: [

          {
            action: 'Document registered',

            by: currentUser.name,

            department:
              currentUser.department,

            date: now,

            note:
              `Document registered and routed to ${destination}.`
          }

        ],

        notesList: notes
          ? [
              {
                text: notes,
                by: currentUser.name,
                date: now
              }
            ]
          : []

      };


      /* =========================
         SAVE PDF
      ========================== */

      try {

        await savePdfFile(
          reference,
          file
        );

      } catch (error) {

        console.error(
          'PDF storage error:',
          error
        );

        showToast(
          'The PDF could not be saved. Please try again.',
          'error'
        );

        return;
      }


      /* =========================
         SAVE DOCUMENT
      ========================== */

      documents.unshift(
        newDocument
      );

      saveDocuments();


      /* =========================
         ACTIVITY
      ========================== */

      addActivity(
        'Document registered',
        `${reference} was registered and routed to ${destination}.`,
        'document'
      );


      /* =========================
         RESET
      ========================== */

      resetDocumentForm();


      if (modal?.open) {
        modal.close();
      }


      renderDashboard();


      showToast(
        `Document ${reference} registered successfully.`,
        'success'
      );

    }
  );

}


/* =========================================================
   RESET DOCUMENT FORM
   ========================================================= */

function resetDocumentForm() {

  const form =
    document.querySelector('#documentForm');

  form?.reset();


  const selectedFile =
    document.querySelector('#selectedFile');

  const selectedFileName =
    document.querySelector('#selectedFileName');


  if (selectedFile) {

    selectedFile.style.display =
      'none';
  }


  if (selectedFileName) {

    selectedFileName.textContent =
      '';
  }
}


/* =========================================================
   REVIEW DOCUMENT
   ========================================================= */

function openDocumentReview(ref) {

  const doc =
    documents.find(
      item => item.ref === ref
    );


  if (!doc) {

    showToast(
      'Document not found.',
      'error'
    );

    return;
  }


  const modal =
    document.querySelector('#reviewModal');

  const title =
    document.querySelector('#reviewTitle');

  const reference =
    document.querySelector('#reviewReference');

  const content =
    document.querySelector('#reviewContent');


  if (!modal || !content) {
    return;
  }


  title.textContent =
    doc.title || 'Document';

  reference.textContent =
    doc.ref || '';


  content.innerHTML = `

    <div class="review-details">

      <div class="detail-item">
        <span>Reference</span>
        <strong>${escapeHtml(doc.ref)}</strong>
      </div>

      <div class="detail-item">
        <span>Origin</span>
        <strong>${escapeHtml(doc.origin)}</strong>
      </div>

      <div class="detail-item">
        <span>Destination</span>
        <strong>${escapeHtml(doc.destination)}</strong>
      </div>

      <div class="detail-item">
        <span>Required Action</span>
        <strong>${escapeHtml(doc.action)}</strong>
      </div>

      <div class="detail-item">
        <span>Status</span>
        <strong>
          ${escapeHtml(doc.status)}
        </strong>
      </div>

      <div class="detail-item">
        <span>Registered</span>
        <strong>
          ${formatDate(doc.createdAt)}
        </strong>
      </div>

    </div>

    <div class="review-notes">

      <h3>Notes</h3>

      <p>
        ${escapeHtml(doc.notes || 'No notes added.')}
      </p>

    </div>

    <div class="review-file">

      <h3>Attachment</h3>

      <p>
        ${
          doc.hasAttachment
            ? escapeHtml(doc.attachmentName)
            : 'No PDF attached.'
        }
      </p>

    </div>

  `;


  modal.showModal();
}


/* =========================================================
   REVIEW MODAL EVENTS
   ========================================================= */

function setupReviewModal() {

  const modal =
    document.querySelector('#reviewModal');

  const close =
    document.querySelector('#closeReviewModal');

  const closeButton =
    document.querySelector('#closeReviewBtn');


  close?.addEventListener(
    'click',
    () => modal?.close()
  );


  closeButton?.addEventListener(
    'click',
    () => modal?.close()
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  const search =
    document.querySelector('#documentSearch');


  search?.addEventListener(
    'input',
    () => {

      renderDocuments(
        search.value
      );

    }
  );

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function getNotifications() {

  return documents
    .filter(
      doc =>
        doc.status === 'Awaiting action' ||
        doc.status === 'Returned for changes'
    )
    .map(doc => ({

      ref: doc.ref,

      title: doc.title,

      status: doc.status,

      date: doc.createdAt

    }));
}


function updateNotificationCount() {

  const notifications =
    getNotifications();

  const count =
    notifications.length;


  const countEl =
    document.querySelector('#notificationCount');

  const dot =
    document.querySelector('#notificationDot');


  if (countEl) {

    countEl.textContent =
      count > 99
        ? '99+'
        : count;
  }


  if (dot) {

    dot.style.display =
      count > 0
        ? 'block'
        : 'none';
  }
}


function showNotifications() {

  const modal =
    document.querySelector('#notificationModal');

  const list =
    document.querySelector('#notificationList');


  if (!modal || !list) {
    return;
  }


  const notifications =
    getNotifications();


  if (!notifications.length) {

    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ✓
        </div>

        <h3>No notifications</h3>

        <p>
          You have no pending document notifications.
        </p>

      </div>

    `;

  } else {

    list.innerHTML =
      notifications.map(item => `

        <div class="notification-item">

          <div>

            <strong>
              ${escapeHtml(item.title)}
            </strong>

            <p>
              ${escapeHtml(item.ref)}
            </p>

            <small>
              ${formatDate(item.date)}
            </small>

          </div>

          <span class="status-badge ${statusClass(item.status)}">
            ${escapeHtml(item.status)}
          </span>

        </div>

      `).join('');
  }


  modal.showModal();
}


/* =========================================================
   REPORTS
   ========================================================= */

function showReports() {

  const modal =
    document.querySelector('#reportsModal');

  const content =
    document.querySelector('#reportsContent');


  if (!modal || !content) {
    return;
  }


  const total =
    documents.length;

  const awaiting =
    documents.filter(
      d => d.status === 'Awaiting action'
    ).length;

  const approved =
    documents.filter(
      d => d.status === 'Approved'
    ).length;

  const transit =
    documents.filter(
      d => d.status === 'In transit'
    ).length;

  const returned =
    documents.filter(
      d => d.status === 'Returned for changes'
    ).length;

  const rejected =
    documents.filter(
      d =>
        d.status === 'Rejected' ||
        d.status === 'Not approved'
    ).length;


  content.innerHTML = `

    <div class="stats-grid report-stats">

      <div class="stat-card">
        <div>
          <span class="stat-label">
            Total Documents
          </span>
          <strong>${total}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span class="stat-label">
            Awaiting Action
          </span>
          <strong>${awaiting}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span class="stat-label">
            Approved
          </span>
          <strong>${approved}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span class="stat-label">
            In Transit
          </span>
          <strong>${transit}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span class="stat-label">
            Returned
          </span>
          <strong>${returned}</strong>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span class="stat-label">
            Rejected
          </span>
          <strong>${rejected}</strong>
        </div>
      </div>

    </div>

  `;


  modal.showModal();
}


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {

  try {

    const saved =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (saved) {

      return JSON.parse(saved);
    }

  } catch (error) {

    console.warn(
      'Settings could not be loaded.'
    );
  }


  return {

    systemName: 'KSUCflow',

    institution:
      'Koitaleel Samoei University'

  };
}


function saveSettings(settings) {

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );
}


function showSettings() {

  const modal =
    document.querySelector('#customizerModal');

  if (!modal) {
    return;
  }


  const settings =
    loadSettings();


  const systemName =
    document.querySelector(
      '#systemNameSetting'
    );

  const institution =
    document.querySelector(
      '#institutionSetting'
    );


  if (systemName) {

    systemName.value =
      settings.systemName;
  }


  if (institution) {

    institution.value =
      settings.institution;
  }


  modal.showModal();
}


/* =========================================================
   USER MENU
   ========================================================= */

function updateUserInterface() {

  const user =
    getCurrentUser();


  const name =
    document.querySelector(
      '#currentUserName'
    );

  const role =
    document.querySelector(
      '#currentUserRole'
    );

  const avatar =
    document.querySelector(
      '#userAvatar'
    );


  if (name) {
    name.textContent =
      user.name;
  }


  if (role) {
    role.textContent =
      user.role;
  }


  if (avatar) {

    avatar.textContent =
      String(user.name)
        .trim()
        .charAt(0)
        .toUpperCase() || 'U';
  }


  const modalName =
    document.querySelector(
      '#userModalName'
    );

  const modalRole =
    document.querySelector(
      '#userModalRole'
    );


  if (modalName) {
    modalName.textContent =
      user.name;
  }


  if (modalRole) {
    modalRole.textContent =
      user.role;
  }


  const greeting =
    document.querySelector(
      '#greeting'
    );


  if (greeting) {

    greeting.textContent =
      `Welcome back, ${user.name}. Manage your university documents and workflow from one place.`;
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  const reportsButtons = [
    document.querySelector('#reportsBtn'),
    document.querySelector('#quickReportsBtn')
  ];


  reportsButtons.forEach(button => {

    button?.addEventListener(
      'click',
      showReports
    );

  });


  const notificationButtons = [
    document.querySelector('#notificationsBtn'),
    document.querySelector('#topNotificationsBtn')
  ];


  notificationButtons.forEach(button => {

    button?.addEventListener(
      'click',
      showNotifications
    );

  });


  document
    .querySelector('#settingsBtn')
    ?.addEventListener(
      'click',
      showSettings
    );


  document
    .querySelector('#adminBtn')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#adminModal')
          ?.showModal();

      }
    );


  document
    .querySelector('#userMenuBtn')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#userModal')
          ?.showModal();

      }
    );


  document
    .querySelector('#closeNotificationModal')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#notificationModal')
          ?.close();

      }
    );


  document
    .querySelector('#closeReportsModal')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#reportsModal')
          ?.close();

      }
    );


  document
    .querySelector('#closeCustomizerModal')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#customizerModal')
          ?.close();

      }
    );


  document
    .querySelector('#closeAdminModal')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#adminModal')
          ?.close();

      }
    );


  document
    .querySelector('#closeUserModal')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#userModal')
          ?.close();

      }
    );


  document
    .querySelector('#cancelSettingsBtn')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#customizerModal')
          ?.close();

      }
    );


  document
    .querySelector('#saveSettingsBtn')
    ?.addEventListener(
      'click',
      () => {

        const settings = {

          systemName:
            document.querySelector(
              '#systemNameSetting'
            )?.value.trim()
            || 'KSUCflow',

          institution:
            document.querySelector(
              '#institutionSetting'
            )?.value.trim()
            || 'Koitaleel Samoei University'

        };


        saveSettings(settings);


        document
          .querySelector('#customizerModal')
          ?.close();


        showToast(
          'Settings saved successfully.'
        );

      }
    );


  document
    .querySelector('#userSettingsBtn')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#userModal')
          ?.close();

        showSettings();

      }
    );


  document
    .querySelector('#signOutBtn')
    ?.addEventListener(
      'click',
      signOut
    );


  document
    .querySelector('#userSignOutBtn')
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector('#userModal')
          ?.close();

        signOut();

      }
    );

}


/* =========================================================
   SIGN OUT
   ========================================================= */

function signOut() {

  const confirmed =
    window.confirm(
      'Are you sure you want to sign out?'
    );


  if (!confirmed) {
    return;
  }


  localStorage.removeItem(
    SESSION_KEY
  );


  /*
    If login.html exists, return there.
  */

  window.location.href =
    'login.html';
}


/* =========================================================
   CLOSE DIALOGS WITH ESCAPE
   ========================================================= */

function setupDialogBehaviour() {

  document
    .querySelectorAll('dialog')
    .forEach(dialog => {

      dialog.addEventListener(
        'cancel',
        event => {

          /*
            Allow the normal ESC behaviour.
          */

          event.preventDefault();

          dialog.close();

        }
      );

    });

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeApp() {

  console.log(
    'KSUCflow application initializing...'
  );


  updateUserInterface();

  renderDashboard();

  setupDocumentRegistration();

  setupPdfUpload();

  setupReviewModal();

  setupSearch();

  setupNavigation();

  setupDialogBehaviour();


  console.log(
    'KSUCflow application ready.'
  );
}


/* =========================================================
   START APPLICATION
   ========================================================= */

if (
  document.readyState === 'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    initializeApp
  );

} else {

  initializeApp();
}
