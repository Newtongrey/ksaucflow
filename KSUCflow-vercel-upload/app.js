'use strict';

/* =========================================================
   KSUCflow
   Document Tracking & Workflow System
   Koitaleel Samoei University College
========================================================= */

const DOCUMENTS_KEY = 'ksucDocuments';
const ACTIVITY_KEY = 'ksucActivity';
const SETTINGS_KEY = 'ksucSettings';
const SESSION_KEY = 'ksucSession';

const PDF_DB_NAME = 'KSUCflowFiles';
const PDF_DB_VERSION = 1;
const PDF_STORE = 'documents';

/* =========================================================
   BASIC HELPERS
========================================================= */

const byId = id => document.getElementById(id);

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY) || 'null'
    );
  } catch (error) {
    return null;
  }
}

function currentUserName() {
  const user = getCurrentUser();
  return user?.name || 'System User';
}

function currentUserDepartment() {
  const user = getCurrentUser();
  return user?.department || '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function formatFileSize(bytes) {
  if (!bytes) return '';

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showToast(message, type = 'success') {
  let toast = byId('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(window.ksucToastTimer);

  window.ksucToastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
}

/* =========================================================
   STORAGE
========================================================= */

function loadDocuments() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(DOCUMENTS_KEY) || 'null'
    );

    if (Array.isArray(saved)) {
      return saved;
    }
  } catch (error) {
    console.warn('Unable to load documents.');
  }

  const starterDocuments = [
    {
      ref: 'KSU/FIN/2026/084',
      title: 'Budget Reallocation Request',
      origin: 'Finance Department',
      destination: "Vice Chancellor's Office",
      currentOffice: "Vice Chancellor's Office",
      action: 'For approval',
      notes: 'Budget reallocation request awaiting approval.',
      kind: 'Internal',
      status: 'Awaiting action',
      state: 'active',
      hasAttachment: false,
      attachmentName: '',
      attachmentType: '',
      attachmentSize: 0,
      createdAt: '2026-10-01T08:30:00',
      registeredBy: 'Registry',
      history: [
        {
          action: 'Document registered',
          from: 'Registry',
          to: 'Finance Department',
          user: 'Registry',
          status: 'Registered',
          remarks: '',
          date: '2026-10-01T08:30:00'
        },
        {
          action: 'Document received',
          from: 'Registry',
          to: 'Finance Department',
          user: 'Finance Department',
          status: 'Received',
          remarks: '',
          date: '2026-10-01T09:00:00'
        }
      ],
      notesList: []
    },

    {
      ref: 'KSU/ADM/2026/127',
      title: 'Maintenance Contract',
      origin: 'Administration',
      destination: 'Procurement',
      currentOffice: 'Procurement',
      action: 'For action',
      notes: 'Maintenance contract for review.',
      kind: 'Internal',
      status: 'In transit',
      state: 'active',
      hasAttachment: false,
      attachmentName: '',
      attachmentType: '',
      attachmentSize: 0,
      createdAt: '2026-10-02T10:00:00',
      registeredBy: 'Administration',
      history: [
        {
          action: 'Document registered',
          from: 'Administration',
          to: 'Administration',
          user: 'Administration',
          status: 'Registered',
          remarks: '',
          date: '2026-10-02T10:00:00'
        },
        {
          action: 'Document forwarded',
          from: 'Administration',
          to: 'Procurement',
          user: 'Administration',
          status: 'In transit',
          remarks: 'Forwarded to Procurement.',
          date: '2026-10-02T11:00:00'
        }
      ],
      notesList: []
    },

    {
      ref: 'KSU/HR/2026/211',
      title: 'Recruitment of Laboratory Assistant',
      origin: 'Human Resource',
      destination: "Vice Chancellor's Office",
      currentOffice: "Vice Chancellor's Office",
      action: 'For approval',
      notes: 'Recruitment request.',
      kind: 'Internal',
      status: 'Awaiting action',
      state: 'active',
      hasAttachment: false,
      attachmentName: '',
      attachmentType: '',
      attachmentSize: 0,
      createdAt: '2026-10-03T09:30:00',
      registeredBy: 'Human Resource',
      history: [
        {
          action: 'Document registered',
          from: 'Human Resource',
          to: "Vice Chancellor's Office",
          user: 'Human Resource',
          status: 'Registered',
          remarks: '',
          date: '2026-10-03T09:30:00'
        },
        {
          action: 'Document received',
          from: 'Human Resource',
          to: "Vice Chancellor's Office",
          user: "Vice Chancellor's Office",
          status: 'Received',
          remarks: '',
          date: '2026-10-03T10:00:00'
        }
      ],
      notesList: []
    },

    {
      ref: 'KSU/ACA/2026/056',
      title: 'Curriculum Review',
      origin: 'Academics',
      destination: 'Academic Affairs',
      currentOffice: 'Academic Affairs',
      action: 'For review',
      notes: 'Curriculum review document.',
      kind: 'Internal',
      status: 'Approved',
      state: 'completed',
      hasAttachment: false,
      attachmentName: '',
      attachmentType: '',
      attachmentSize: 0,
      createdAt: '2026-09-20T09:00:00',
      registeredBy: 'Academics',
      history: [
        {
          action: 'Document registered',
          from: 'Academics',
          to: 'Academic Affairs',
          user: 'Academics',
          status: 'Registered',
          remarks: '',
          date: '2026-09-20T09:00:00'
        },
        {
          action: 'Document received',
          from: 'Academics',
          to: 'Academic Affairs',
          user: 'Academic Affairs',
          status: 'Received',
          remarks: '',
          date: '2026-09-20T09:30:00'
        },
        {
          action: 'Document approved',
          from: 'Academic Affairs',
          to: 'Academic Affairs',
          user: 'Academic Affairs',
          status: 'Approved',
          remarks: 'Approved.',
          date: '2026-09-22T14:00:00'
        }
      ],
      notesList: []
    },

    {
      ref: 'KSU/EXT/2026/092',
      title: 'Invitation to External Engagement',
      origin: 'External Relations',
      destination: "Vice Chancellor's Office",
      currentOffice: "Vice Chancellor's Office",
      action: 'For information',
      notes: 'External engagement invitation.',
      kind: 'External',
      status: 'Awaiting action',
      state: 'active',
      hasAttachment: false,
      attachmentName: '',
      attachmentType: '',
      attachmentSize: 0,
      createdAt: '2026-10-04T11:00:00',
      registeredBy: 'External Relations',
      history: [
        {
          action: 'Document registered',
          from: 'External Relations',
          to: "Vice Chancellor's Office",
          user: 'External Relations',
          status: 'Registered',
          remarks: '',
          date: '2026-10-04T11:00:00'
        }
      ],
      notesList: []
    }
  ];

  localStorage.setItem(
    DOCUMENTS_KEY,
    JSON.stringify(starterDocuments)
  );

  return starterDocuments;
}

function loadActivity() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ACTIVITY_KEY) || 'null'
    );

    if (Array.isArray(saved)) {
      return saved;
    }
  } catch (error) {
    console.warn('Unable to load activity.');
  }

  const activity = [
    {
      action: 'System started',
      detail: 'KSUCflow document tracking system initialized.',
      type: 'system',
      date: new Date().toISOString()
    }
  ];

  localStorage.setItem(
    ACTIVITY_KEY,
    JSON.stringify(activity)
  );

  return activity;
}

function saveDocuments(documents) {
  localStorage.setItem(
    DOCUMENTS_KEY,
    JSON.stringify(documents)
  );
}

function saveActivity(activity) {
  localStorage.setItem(
    ACTIVITY_KEY,
    JSON.stringify(activity)
  );
}

/* =========================================================
   ACTIVITY
========================================================= */

function addActivity(action, detail, type = 'document') {
  const activity = loadActivity();

  activity.unshift({
    action,
    detail,
    type,
    date: new Date().toISOString(),
    user: currentUserName(),
    department: currentUserDepartment()
  });

  saveActivity(activity.slice(0, 50));

  renderActivity();
}

/* =========================================================
   WORKFLOW HELPERS
========================================================= */

function latestHistory(document) {
  if (!Array.isArray(document.history) || !document.history.length) {
    return null;
  }

  return document.history[document.history.length - 1];
}

function getCurrentOffice(document) {
  if (document.currentOffice) {
    return document.currentOffice;
  }

  const last = latestHistory(document);

  return last?.to || document.destination || document.origin || '';
}

function isInTransit(document) {
  return document.status === 'In transit';
}

function isReceived(document) {
  return document.status === 'Received';
}

function isAwaitingAction(document) {
  return (
    document.status === 'Awaiting action' ||
    document.status === 'Returned for changes'
  );
}

function isCompleted(document) {
  return (
    document.status === 'Completed' ||
    document.status === 'Approved' ||
    document.status === 'Not approved'
  );
}

function isDocumentForCurrentOffice(document) {
  const department = currentUserDepartment();

  if (!department) return false;

  return (
    getCurrentOffice(document) === department &&
    !isCompleted(document) &&
    !isInTransit(document)
  );
}

function isDocumentAwaitingReceipt(document) {
  const department = currentUserDepartment();

  if (!department) return false;

  return (
    document.status === 'In transit' &&
    document.destination === department
  );
}

function isDocumentAwaitingMyAction(document) {
  return (
    isDocumentForCurrentOffice(document) &&
    isAwaitingAction(document)
  );
}

function addHistory(document, {
  action,
  from = '',
  to = '',
  status,
  remarks = ''
}) {
  if (!Array.isArray(document.history)) {
    document.history = [];
  }

  document.history.push({
    action,
    from,
    to,
    user: currentUserName(),
    department: currentUserDepartment(),
    status,
    remarks,
    date: new Date().toISOString()
  });
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  const documents = loadDocuments();
  const department = currentUserDepartment();

  const total = documents.length;

  const awaitingReceipt = documents.filter(
    isDocumentAwaitingReceipt
  ).length;

  const inbox = documents.filter(
    isDocumentForCurrentOffice
  ).length;

  const awaitingAction = documents.filter(
    isDocumentAwaitingMyAction
  ).length;

  const transit = documents.filter(
    document => document.status === 'In transit'
  ).length;

  const completed = documents.filter(
    isCompleted
  ).length;

  if (byId('totalDocuments')) {
    byId('totalDocuments').textContent = total;
  }

  if (byId('awaitingDocuments')) {
    byId('awaitingDocuments').textContent =
      awaitingAction;
  }

  if (byId('approvedDocuments')) {
    byId('approvedDocuments').textContent =
      documents.filter(
        document => document.status === 'Approved'
      ).length;
  }

  if (byId('transitDocuments')) {
    byId('transitDocuments').textContent = transit;
  }

  if (byId('myInbox')) {
    byId('myInbox').textContent = inbox;
  }

  if (byId('awaitingReceipt')) {
    byId('awaitingReceipt').textContent =
      awaitingReceipt;
  }

  if (byId('myActions')) {
    byId('myActions').textContent =
      awaitingAction;
  }

  if (byId('completedDocuments')) {
    byId('completedDocuments').textContent =
      completed;
  }

  if (byId('currentOffice')) {
    byId('currentOffice').textContent =
      department || 'Not assigned';
  }

  renderNotifications();
  renderDocuments();
  renderActivity();
}

/* =========================================================
   DOCUMENT LIST
========================================================= */

function statusClass(status) {
  const value = String(status || '')
    .toLowerCase()
    .replace(/\s+/g, '-');

  return `status-${value}`;
}

function renderDocuments(searchTerm = '') {
  const container = byId('recentDocuments');

  if (!container) return;

  const documents = loadDocuments();

  const search = String(searchTerm)
    .trim()
    .toLowerCase();

  let filtered = documents;

  if (search) {
    filtered = documents.filter(document =>
      [
        document.ref,
        document.title,
        document.origin,
        document.destination,
        document.currentOffice,
        document.status
      ]
        .join(' ')
        .toLowerCase()
        .includes(search)
    );
  }

  filtered.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  filtered = filtered.slice(0, 8);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No documents found</strong>
        <span>There are no documents matching your search.</span>
      </div>
    `;

    return;
  }

  container.innerHTML = filtered.map(document => `
    <div class="document-row">

      <div class="document-main">

        <div class="document-title">
          ${escapeHtml(document.title)}
        </div>

        <div class="document-meta">
          <span>${escapeHtml(document.ref)}</span>
          <span>•</span>
          <span>
            ${escapeHtml(
              getCurrentOffice(document)
            )}
          </span>
        </div>

      </div>

      <div class="document-status">
        <span class="status ${statusClass(document.status)}">
          ${escapeHtml(document.status)}
        </span>

        ${
          document.hasAttachment
            ? '<span class="attachment-indicator">PDF</span>'
            : ''
        }
      </div>

      <div class="document-date">
        ${formatDate(document.createdAt)}
      </div>

      <a
        class="document-view-link"
        href="document-view.html?ref=${encodeURIComponent(document.ref)}"
      >
        View
      </a>

    </div>
  `).join('');
}

/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity() {
  const container = byId('activityList');

  if (!container) return;

  const activity = loadActivity();

  const items = activity.slice(0, 8);

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No recent activity</strong>
      </div>
    `;

    return;
  }

  container.innerHTML = items.map(item => `
    <div class="activity-item">

      <div class="activity-dot"></div>

      <div class="activity-content">

        <strong>
          ${escapeHtml(item.action)}
        </strong>

        <span>
          ${escapeHtml(item.detail)}
        </span>

        <small>
          ${formatDate(item.date)}
          ${
            item.user
              ? ` • ${escapeHtml(item.user)}`
              : ''
          }
        </small>

      </div>

    </div>
  `).join('');
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function getNotifications() {
  const documents = loadDocuments();

  const notifications = [];

  documents.forEach(document => {

    if (isDocumentAwaitingReceipt(document)) {
      notifications.push({
        type: 'receipt',
        title: 'Document awaiting receipt',
        detail: `${document.ref} is on its way to ${currentUserDepartment()}.`,
        ref: document.ref
      });
    }

    if (isDocumentAwaitingMyAction(document)) {
      notifications.push({
        type: 'action',
        title: 'Action required',
        detail: `${document.ref} requires action.`,
        ref: document.ref
      });
    }

    if (document.status === 'Returned for changes') {
      if (
        getCurrentOffice(document) ===
        currentUserDepartment()
      ) {
        notifications.push({
          type: 'returned',
          title: 'Document returned',
          detail: `${document.ref} was returned for changes.`,
          ref: document.ref
        });
      }
    }

  });

  return notifications;
}

function renderNotifications() {
  const notifications = getNotifications();

  const count = notifications.length;

  if (byId('notificationCount')) {
    byId('notificationCount').textContent =
      count > 99 ? '99+' : count;
  }

  if (byId('notificationBadge')) {
    byId('notificationBadge').textContent =
      count > 99 ? '99+' : count;
  }

  const container = byId('notificationList');

  if (!container) return;

  if (!notifications.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No new notifications</strong>
        <span>You're all caught up.</span>
      </div>
    `;

    return;
  }

  container.innerHTML = notifications.map(notification => `
    <a
      class="notification-item"
      href="document-view.html?ref=${encodeURIComponent(notification.ref)}"
    >

      <strong>
        ${escapeHtml(notification.title)}
      </strong>

      <span>
        ${escapeHtml(notification.detail)}
      </span>

    </a>
  `).join('');
}

/* =========================================================
   PDF DATABASE
========================================================= */

function openPdfDatabase() {
  return new Promise((resolve, reject) => {

    const request = indexedDB.open(
      PDF_DB_NAME,
      PDF_DB_VERSION
    );

    request.onupgradeneeded = function () {

      const database = request.result;

      if (!database.objectStoreNames.contains(PDF_STORE)) {
        database.createObjectStore(
          PDF_STORE,
          { keyPath: 'ref' }
        );
      }

    };

    request.onsuccess = function () {
      resolve(request.result);
    };

    request.onerror = function () {
      reject(request.error);
    };

  });
}

async function savePdfFile(ref, file) {
  const database = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      database.transaction(
        PDF_STORE,
        'readwrite'
      );

    const store =
      transaction.objectStore(PDF_STORE);

    store.put({
      ref,
      file,
      savedAt: new Date().toISOString()
    });

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

  });
}

async function getPdfFile(ref) {
  const database = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      database.transaction(
        PDF_STORE,
        'readonly'
      );

    const store =
      transaction.objectStore(PDF_STORE);

    const request =
      store.get(ref);

    request.onsuccess = () => {
      database.close();
      resolve(request.result || null);
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };

  });
}

async function deletePdfFile(ref) {
  const database = await openPdfDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      database.transaction(
        PDF_STORE,
        'readwrite'
      );

    const store =
      transaction.objectStore(PDF_STORE);

    store.delete(ref);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };

  });
}

/* =========================================================
   PDF UPLOAD
========================================================= */

function setupPdfUpload() {
  const input = byId('documentFile');

  if (!input) return;

  input.addEventListener(
    'change',
    function () {

      const file = input.files?.[0];

      if (!file) return;

      if (file.type !== 'application/pdf') {
        input.value = '';

        showToast(
          'Only PDF documents are allowed.',
          'error'
        );

        return;
      }

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        input.value = '';

        showToast(
          'The PDF must not exceed 10 MB.',
          'error'
        );

        return;
      }

      const selectedFile = byId('selectedFile');
      const selectedFileName = byId('selectedFileName');

      if (selectedFileName) {
        selectedFileName.textContent =
          `${file.name} (${formatFileSize(file.size)})`;
      }

      if (selectedFile) {
        selectedFile.style.display = 'block';
      }

    }
  );

  const removeButton =
    byId('removeSelectedFile');

  if (removeButton) {

    removeButton.addEventListener(
      'click',
      function () {

        input.value = '';

        const selectedFile =
          byId('selectedFile');

        const selectedFileName =
          byId('selectedFileName');

        if (selectedFile) {
          selectedFile.style.display = 'none';
        }

        if (selectedFileName) {
          selectedFileName.textContent = '';
        }

      }
    );

  }
}

/* =========================================================
   DOCUMENT REGISTRATION
========================================================= */

function setupDocumentRegistration() {

  const form =
    byId('documentForm');

  const modal =
    byId('documentModal');

  const openButton =
    byId('openModal');

  const quickRegisterButton =
    byId('quickRegisterBtn');

  const closeButton =
    byId('closeDocumentModal');

  const cancelButton =
    byId('cancelDocumentBtn');

  if (!form || !modal) {
    console.warn(
      'KSUCflow: document registration form or modal not found.'
    );

    return;
  }

  /* -------------------------------------------------------
     OPEN MODAL
  ------------------------------------------------------- */

  function openRegistrationModal() {

    if (
      typeof modal.showModal === 'function'
    ) {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }

  }

  /* -------------------------------------------------------
     CLOSE MODAL
  ------------------------------------------------------- */

  function closeRegistrationModal() {

    if (
      typeof modal.close === 'function'
    ) {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }

  }

  if (openButton) {
    openButton.addEventListener(
      'click',
      openRegistrationModal
    );
  }

  if (quickRegisterButton) {
    quickRegisterButton.addEventListener(
      'click',
      openRegistrationModal
    );
  }

  if (closeButton) {
    closeButton.addEventListener(
      'click',
      closeRegistrationModal
    );
  }

  if (cancelButton) {
    cancelButton.addEventListener(
      'click',
      closeRegistrationModal
    );
  }

  /* -------------------------------------------------------
     FORM SUBMISSION
  ------------------------------------------------------- */

  form.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();

      /*
       * IMPORTANT:
       * These IDs match the actual index.html.
       */

      const ref =
        byId('reference')?.value.trim();

      const title =
        byId('subject')?.value.trim();

      const origin =
        byId('origin')?.value.trim();

      const destination =
        byId('department')?.value;

      const action =
        byId('action')?.value;

      const notes =
        byId('notes')?.value.trim() || '';

      const fileInput =
        byId('documentFile');

      const file =
        fileInput?.files?.[0] || null;

      /* ---------------------------------------------------
         VALIDATION
      --------------------------------------------------- */

      if (
        !ref ||
        !title ||
        !origin ||
        !destination ||
        !action
      ) {

        showToast(
          'Please complete all required fields.',
          'error'
        );

        return;
      }

      /* ---------------------------------------------------
         CHECK DUPLICATE REFERENCE
      --------------------------------------------------- */

      const documents =
        loadDocuments();

      const duplicate =
        documents.some(
          document =>
            String(document.ref || '')
              .toLowerCase() ===
            ref.toLowerCase()
        );

      if (duplicate) {

        showToast(
          'A document with this reference number already exists.',
          'error'
        );

        return;
      }

      /* ---------------------------------------------------
         CHECK PDF
      --------------------------------------------------- */

      if (file) {

        if (
          file.type !== 'application/pdf'
        ) {

          showToast(
            'Only PDF documents are allowed.',
            'error'
          );

          return;
        }

        if (
          file.size >
          10 * 1024 * 1024
        ) {

          showToast(
            'The PDF must not exceed 10 MB.',
            'error'
          );

          return;
        }

      }

      /* ---------------------------------------------------
         CREATE DOCUMENT
      --------------------------------------------------- */

      const now =
        new Date().toISOString();

      const documentRecord = {

        ref,

        title,

        subject: title,

        origin,

        originatingOffice: origin,

        destination,

        /*
         * The registering office is the
         * current holder initially.
         */
        currentOffice: origin,

        action,

        requiredAction: action,

        notes,

        kind: 'Internal',

        status: 'Received',

        state: 'active',

        hasAttachment:
          Boolean(file),

        attachmentName:
          file?.name || '',

        attachmentType:
          file?.type || '',

        attachmentSize:
          file?.size || 0,

        createdAt: now,

        registeredBy:
          currentUserName(),

        registeredAt: now,

        history: [

          {

            action:
              'Document registered',

            from:
              origin,

            to:
              origin,

            user:
              currentUserName(),

            department:
              currentUserDepartment(),

            status:
              'Received',

            remarks:
              notes ||
              'Document registered into KSUCflow.',

            date:
              now

          }

        ],

        notesList:
          notes
            ? [
                {
                  note: notes,
                  text: notes,
                  user:
                    currentUserName(),
                  date: now
                }
              ]
            : []

      };

      /* ---------------------------------------------------
         SAVE PDF
      --------------------------------------------------- */

      if (file) {

        try {

          await savePdfFile(
            ref,
            file
          );

        } catch (error) {

          console.error(
            'PDF storage error:',
            error
          );

          showToast(
            'Unable to save the PDF attachment.',
            'error'
          );

          return;
        }

      }

      /* ---------------------------------------------------
         SAVE DOCUMENT
      --------------------------------------------------- */

      documents.unshift(
        documentRecord
      );

      saveDocuments(
        documents
      );

      /* ---------------------------------------------------
         ACTIVITY
      --------------------------------------------------- */

      addActivity(
        'Document registered',
        `${ref} — ${title}`,
        'document'
      );

      /* ---------------------------------------------------
         RESET FORM
      --------------------------------------------------- */

      form.reset();

      const selectedFile =
        byId('selectedFile');

      const selectedFileName =
        byId('selectedFileName');

      if (selectedFile) {
        selectedFile.style.display =
          'none';
      }

      if (selectedFileName) {
        selectedFileName.textContent =
          '';
      }

      /* ---------------------------------------------------
         REFRESH DASHBOARD
      --------------------------------------------------- */

      renderDashboard();

      /* ---------------------------------------------------
         CLOSE
      --------------------------------------------------- */

      closeRegistrationModal();

      /* ---------------------------------------------------
         SUCCESS
      --------------------------------------------------- */

      showToast(
        'Document registered successfully.'
      );

      /*
       * Stay on dashboard.
       * The user can click View on the document
       * when it appears in Recent Documents.
       */

    }
  );

}

/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

  const input =
    byId('documentSearch');

  if (!input) return;

  input.addEventListener(
    'input',
    function () {

      renderDocuments(
        input.value
      );

    }
  );

}

/* =========================================================
   REVIEW / QUICK VIEW
========================================================= */

function openDocumentReview(ref) {

  const documents =
    loadDocuments();

  const document =
    documents.find(
      item => item.ref === ref
    );

  if (!document) {

    showToast(
      'Document could not be found.',
      'error'
    );

    return;
  }

  window.location.href =
    `document-view.html?ref=${encodeURIComponent(ref)}`;

}

function setupReviewModal() {
  /*
    Compatibility hook.
  */
}

/* =========================================================
   REPORTS
========================================================= */

function showReports() {

  const documents =
    loadDocuments();

  const total =
    documents.length;

  const transit =
    documents.filter(
      document =>
        document.status === 'In transit'
    ).length;

  const awaiting =
    documents.filter(
      document =>
        document.status === 'Awaiting action'
    ).length;

  const received =
    documents.filter(
      document =>
        document.status === 'Received'
    ).length;

  const approved =
    documents.filter(
      document =>
        document.status === 'Approved'
    ).length;

  const completed =
    documents.filter(
      document =>
        document.status === 'Completed'
    ).length;

  const rejected =
    documents.filter(
      document =>
        document.status === 'Not approved'
    ).length;

  const report = `

    <div class="report-summary">

      <div>
        <strong>Total documents</strong>
        <span>${total}</span>
      </div>

      <div>
        <strong>Received</strong>
        <span>${received}</span>
      </div>

      <div>
        <strong>In transit</strong>
        <span>${transit}</span>
      </div>

      <div>
        <strong>Awaiting action</strong>
        <span>${awaiting}</span>
      </div>

      <div>
        <strong>Approved</strong>
        <span>${approved}</span>
      </div>

      <div>
        <strong>Completed</strong>
        <span>${completed}</span>
      </div>

      <div>
        <strong>Not approved</strong>
        <span>${rejected}</span>
      </div>

    </div>

  `;

  const container =
    byId('reportsContent') ||
    byId('reportContent');

  if (container) {
    container.innerHTML =
      report;
  }

  return {
    total,
    received,
    transit,
    awaiting,
    approved,
    completed,
    rejected
  };

}

/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {

  const defaults = {

    systemName:
      'KSUCflow',

    institution:
      'Koitaleel Samoei University College'

  };

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          SETTINGS_KEY
        ) || 'null'
      );

    return {
      ...defaults,
      ...(saved || {})
    };

  } catch (error) {

    return defaults;

  }

}

function saveSettings(settings) {

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );

}

/* =========================================================
   USER INTERFACE
========================================================= */

function updateUserInterface() {

  const user =
    getCurrentUser();

  const settings =
    loadSettings();

  const userName =
    user?.name || 'User';

  const userRole =
    user?.role || 'Staff';

  const avatar =
    userName
      .trim()
      .charAt(0)
      .toUpperCase();

  /*
   * Current index.html IDs
   */

  if (byId('currentUserName')) {
    byId('currentUserName').textContent =
      userName;
  }

  if (byId('currentUserRole')) {
    byId('currentUserRole').textContent =
      userRole;
  }

  if (byId('userAvatar')) {
    byId('userAvatar').textContent =
      avatar;
  }

  /*
   * Compatibility IDs
   */

  if (byId('userName')) {
    byId('userName').textContent =
      userName;
  }

  if (byId('userRole')) {
    byId('userRole').textContent =
      userRole;
  }

  if (byId('avatar')) {
    byId('avatar').textContent =
      avatar;
  }

  if (byId('greetingName')) {
    byId('greetingName').textContent =
      userName;
  }

  if (byId('institutionName')) {
    byId('institutionName').textContent =
      settings.institution;
  }

  if (byId('appName')) {
    byId('appName').textContent =
      settings.systemName;
  }

  if (byId('greeting')) {
    byId('greeting').textContent =
      `Welcome back, ${userName}.`;
  }

}

/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  /* -------------------------------------------------------
     NOTIFICATIONS
  ------------------------------------------------------- */

  const notificationButtons = [
    byId('notificationsBtn'),
    byId('topNotificationsBtn'),
    byId('notificationButton')
  ].filter(Boolean);

  notificationButtons.forEach(button => {

    button.addEventListener(
      'click',
      function () {

        const modal =
          byId('notificationModal');

        renderNotifications();

        if (
          modal &&
          typeof modal.showModal === 'function'
        ) {
          modal.showModal();
        }

      }
    );

  });

  const closeNotification =
    byId('closeNotificationModal');

  if (closeNotification) {

    closeNotification.addEventListener(
      'click',
      function () {

        const modal =
          byId('notificationModal');

        if (modal) {
          modal.close();
        }

      }
    );

  }

  /* -------------------------------------------------------
     REPORTS
  ------------------------------------------------------- */

  const reportsButtons = [
    byId('reportsBtn'),
    byId('quickReportsBtn'),
    byId('reportsButton')
  ].filter(Boolean);

  reportsButtons.forEach(button => {

    button.addEventListener(
      'click',
      function () {

        showReports();

        const modal =
          byId('reportsModal');

        if (
          modal &&
          typeof modal.showModal === 'function'
        ) {
          modal.showModal();
        }

      }
    );

  });

  const closeReports =
    byId('closeReportsModal');

  if (closeReports) {

    closeReports.addEventListener(
      'click',
      function () {

        const modal =
          byId('reportsModal');

        if (modal) {
          modal.close();
        }

      }
    );

  }

  /* -------------------------------------------------------
     SETTINGS
  ------------------------------------------------------- */

  const settingsButtons = [
    byId('settingsBtn'),
    byId('settingsButton')
  ].filter(Boolean);

  settingsButtons.forEach(button => {

    button.addEventListener(
      'click',
      function () {

        const settings =
          loadSettings();

        if (byId('systemNameSetting')) {
          byId('systemNameSetting').value =
            settings.systemName;
        }

        if (byId('institutionSetting')) {
          byId('institutionSetting').value =
            settings.institution;
        }

        if (byId('systemNameInput')) {
          byId('systemNameInput').value =
            settings.systemName;
        }

        if (byId('institutionInput')) {
          byId('institutionInput').value =
            settings.institution;
        }

        const modal =
          byId('customizerModal');

        if (
          modal &&
          typeof modal.showModal === 'function'
        ) {
          modal.showModal();
        }

      }
    );

  });

  const closeSettings =
    byId('closeCustomizerModal');

  if (closeSettings) {

    closeSettings.addEventListener(
      'click',
      function () {

        const modal =
          byId('customizerModal');

        if (modal) {
          modal.close();
        }

      }
    );

  }

  const cancelSettings =
    byId('cancelSettingsBtn');

  if (cancelSettings) {

    cancelSettings.addEventListener(
      'click',
      function () {

        const modal =
          byId('customizerModal');

        if (modal) {
          modal.close();
        }

      }
    );

  }

  const saveSettingsButton =
    byId('saveSettingsBtn') ||
    byId('saveSettings');

  if (saveSettingsButton) {

    saveSettingsButton.addEventListener(
      'click',
      function () {

        const settings = {

          systemName:
            byId('systemNameSetting')?.value.trim() ||
            byId('systemNameInput')?.value.trim() ||
            'KSUCflow',

          institution:
            byId('institutionSetting')?.value.trim() ||
            byId('institutionInput')?.value.trim() ||
            'Koitaleel Samoei University College'

        };

        saveSettings(
          settings
        );

        updateUserInterface();

        const modal =
          byId('customizerModal');

        if (modal) {
          modal.close();
        }

        showToast(
          'Settings saved successfully.'
        );

      }
    );

  }

  /* -------------------------------------------------------
     ADMINISTRATION
  ------------------------------------------------------- */

  const adminButton =
    byId('adminBtn');

  if (adminButton) {

    adminButton.addEventListener(
      'click',
      function () {

        const modal =
          byId('adminModal');

        if (
          modal &&
          typeof modal.showModal === 'function'
        ) {
          modal.showModal();
        } else {
          window.location.href =
            'admin.html';
        }

      }
    );

  }

  const closeAdmin =
    byId('closeAdminModal');

  if (closeAdmin) {

    closeAdmin.addEventListener(
      'click',
      function () {

        const modal =
          byId('adminModal');

        if (modal) {
          modal.close();
        }

      }
    );

  }

  /* -------------------------------------------------------
     USER MENU
  ------------------------------------------------------- */

  const userMenu =
    byId('userMenuBtn');

  if (userMenu) {

    userMenu.addEventListener(
      'click',
      function () {

        const user =
          getCurrentUser();

        if (byId('userModalName')) {
          byId('userModalName').textContent =
            user?.name || 'User';
        }

        if (byId('userModalRole')) {
          byId('userModalRole').textContent =
            user?.role || 'Staff';
        }

        const modal =
          byId('userModal');

        if (
          modal &&
          typeof modal.showModal === 'function'
        ) {
          modal.showModal();
        }

      }
    );

  }

  const closeUser =
    byId('closeUserModal');

  if (closeUser) {

    closeUser.addEventListener(
      'click',
      function () {

        const modal =
          byId('userModal');

        if (modal) {
          modal.close();
        }

      }
    );

  }

  /* -------------------------------------------------------
     SIGN OUT
  ------------------------------------------------------- */

  const signOutButtons = [
    byId('signOutBtn'),
    byId('signOut'),
    byId('userSignOutBtn')
  ].filter(Boolean);

  signOutButtons.forEach(button => {

    button.addEventListener(
      'click',
      function () {

        localStorage.removeItem(
          SESSION_KEY
        );

        window.location.href =
          'login.html';

      }
    );

  });

}

/* =========================================================
   DASHBOARD QUICK FILTERS
========================================================= */

function setupWorkflowShortcuts() {

  const inboxButton =
    byId('myInboxButton');

  if (inboxButton) {

    inboxButton.addEventListener(
      'click',
      function () {

        const department =
          currentUserDepartment();

        localStorage.setItem(
          'ksucDocumentFilter',
          JSON.stringify({
            type: 'office',
            value: department
          })
        );

        window.location.href =
          'documents.html';

      }
    );

  }

  const receiptButton =
    byId('awaitingReceiptButton');

  if (receiptButton) {

    receiptButton.addEventListener(
      'click',
      function () {

        localStorage.setItem(
          'ksucDocumentFilter',
          JSON.stringify({
            type: 'status',
            value: 'In transit'
          })
        );

        window.location.href =
          'documents.html';

      }
    );

  }

  const actionButton =
    byId('myActionsButton');

  if (actionButton) {

    actionButton.addEventListener(
      'click',
      function () {

        localStorage.setItem(
          'ksucDocumentFilter',
          JSON.stringify({
            type: 'status',
            value: 'Awaiting action'
          })
        );

        window.location.href =
          'documents.html';

      }
    );

  }

}

/* =========================================================
   CLEANUP / DATA MIGRATION
========================================================= */

function migrateDocuments() {

  const documents =
    loadDocuments();

  let changed = false;

  documents.forEach(document => {

    if (!Array.isArray(document.history)) {
      document.history = [];
      changed = true;
    }

    if (!Array.isArray(document.notesList)) {
      document.notesList = [];
      changed = true;
    }

    if (!document.currentOffice) {

      const last =
        latestHistory(document);

      document.currentOffice =
        last?.to ||
        document.destination ||
        document.origin ||
        '';

      changed = true;
    }

    if (
      document.status === 'For approval' ||
      document.status === 'For action' ||
      document.status === 'For review' ||
      document.status === 'For information'
    ) {

      document.status =
        'Awaiting action';

      changed = true;
    }

  });

  if (changed) {
    saveDocuments(
      documents
    );
  }

}

/* =========================================================
   INITIALIZE
========================================================= */

function initializeApp() {

  loadDocuments();

  loadActivity();

  migrateDocuments();

  updateUserInterface();

  renderDashboard();

  setupDocumentRegistration();

  setupPdfUpload();

  setupReviewModal();

  setupSearch();

  setupNavigation();

  setupWorkflowShortcuts();

  document.addEventListener(
    'visibilitychange',
    function () {

      if (
        document.visibilityState ===
        'visible'
      ) {

        renderDashboard();

      }

    }
  );

}

/* =========================================================
   START
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  initializeApp
);
