
'use strict';

/* =========================================================
   KSUCflow
   Koitaleel Samoei University College
   Dashboard, Documents, Notifications & Workflow
========================================================= */

const DOCUMENTS_KEY = 'ksucDocuments';
const ACTIVITY_KEY = 'ksucActivity';
const SETTINGS_KEY = 'ksucSettings';
const SESSION_KEY = 'ksucSession';

const PDF_DB_NAME = 'KSUCflowFiles';
const PDF_DB_VERSION = 1;
const PDF_STORE = 'documents';

const byId = id => document.getElementById(id);

/* =========================================================
   USER & GENERAL HELPERS
========================================================= */

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function currentUserName() {
  return getCurrentUser()?.name || 'System User';
}

function currentUserDepartment() {
  return getCurrentUser()?.department || '';
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

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function formatFileSize(bytes) {
  if (!bytes) return '';

  if (bytes < 1024) return `${bytes} B`;

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
  toast.style.position = 'fixed';
  toast.style.zIndex = '2147483647';
  toast.style.right = '24px';
  toast.style.bottom = '24px';
  toast.style.maxWidth = 'min(420px, calc(100vw - 32px))';

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

    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn('Unable to load documents.', error);
  }

  const starterDocuments = [
    {
      ref: 'KSU/FIN/2026/084',
      title: 'Budget Reallocation Request',
      origin: 'Finance Department',
      destination: "Vice Chancellor's Office",
      currentOffice: 'Finance Department',
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
          status: 'Awaiting action',
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
      currentOffice: 'Administration',
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
      currentOffice: 'Human Resource',
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
          to: 'Human Resource',
          user: 'Human Resource',
          status: 'Registered',
          remarks: '',
          date: '2026-10-03T09:30:00'
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
      currentOffice: 'External Relations',
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
          to: 'External Relations',
          user: 'External Relations',
          status: 'Registered',
          remarks: '',
          date: '2026-10-04T11:00:00'
        }
      ],
      notesList: []
    }
  ];

  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(starterDocuments));
  return starterDocuments;
}

function saveDocuments(documents) {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
}

function loadActivity() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ACTIVITY_KEY) || 'null'
    );

    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn('Unable to load activity.', error);
  }

  const initial = [{
    action: 'System started',
    detail: 'KSUCflow document tracking system initialized.',
    type: 'system',
    date: new Date().toISOString()
  }];

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(initial));
  return initial;
}

function saveActivity(activity) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
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

function latestHistory(documentRecord) {
  const history = documentRecord.history;

  if (!Array.isArray(history) || !history.length) return null;

  return history[history.length - 1];
}

function getCurrentOffice(documentRecord) {
  if (documentRecord.currentOffice) {
    return documentRecord.currentOffice;
  }

  const last = latestHistory(documentRecord);

  return last?.to || documentRecord.origin || '';
}

function isCompleted(documentRecord) {
  return [
    'Completed',
    'Approved',
    'Not approved'
  ].includes(documentRecord.status);
}

function isAwaitingAction(documentRecord) {
  return [
    'Awaiting action',
    'Returned for changes'
  ].includes(documentRecord.status);
}

function isDocumentForCurrentOffice(documentRecord) {
  const department = currentUserDepartment();

  return Boolean(
    department &&
    getCurrentOffice(documentRecord) === department &&
    !isCompleted(documentRecord) &&
    documentRecord.status !== 'In transit'
  );
}

function isDocumentAwaitingReceipt(documentRecord) {
  return Boolean(
    currentUserDepartment() &&
    documentRecord.status === 'In transit' &&
    documentRecord.destination === currentUserDepartment()
  );
}

function isDocumentAwaitingMyAction(documentRecord) {
  return (
    isDocumentForCurrentOffice(documentRecord) &&
    isAwaitingAction(documentRecord)
  );
}

function addHistory(documentRecord, {
  action,
  from = '',
  to = '',
  status,
  remarks = ''
}) {
  if (!Array.isArray(documentRecord.history)) {
    documentRecord.history = [];
  }

  documentRecord.history.push({
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

  const awaitingReceipt = documents.filter(
    isDocumentAwaitingReceipt
  ).length;

  const awaitingAction = documents.filter(
    isDocumentAwaitingMyAction
  ).length;

  const transit = documents.filter(
    item => item.status === 'In transit'
  ).length;

  const completed = documents.filter(isCompleted).length;

  if (byId('totalDocuments')) {
    byId('totalDocuments').textContent = documents.length;
  }

  if (byId('awaitingDocuments')) {
    byId('awaitingDocuments').textContent = awaitingAction;
  }

  if (byId('approvedDocuments')) {
    byId('approvedDocuments').textContent = documents.filter(
      item => item.status === 'Approved'
    ).length;
  }

  if (byId('transitDocuments')) {
    byId('transitDocuments').textContent = transit;
  }

  if (byId('myInbox')) {
    byId('myInbox').textContent = documents.filter(
      isDocumentForCurrentOffice
    ).length;
  }

  if (byId('awaitingReceipt')) {
    byId('awaitingReceipt').textContent = awaitingReceipt;
  }

  if (byId('myActions')) {
    byId('myActions').textContent = awaitingAction;
  }

  if (byId('completedDocuments')) {
    byId('completedDocuments').textContent = completed;
  }

  if (byId('currentOffice')) {
    byId('currentOffice').textContent =
      currentUserDepartment() || 'Not assigned';
  }

  renderDocuments(byId('documentSearch')?.value || '');
  renderActivity();
  renderNotifications();
}

/* =========================================================
   RECENT DOCUMENTS
========================================================= */

function statusClass(status) {
  return 'status-' + String(status || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function injectDashboardPolish() {
  if (byId('ksucDashboardPolish')) return;

  const style = document.createElement('style');
  style.id = 'ksucDashboardPolish';

  style.textContent = `
    #recentDocuments {
      width: 100%;
      min-width: 0;
      overflow-x: auto;
    }

    #recentDocuments .document-row {
      display: grid;
      grid-template-columns: minmax(180px, 1.7fr)
                             minmax(130px, 1fr)
                             minmax(120px, auto)
                             auto;
      align-items: center;
      gap: 16px;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: 15px 16px;
      border-bottom: 1px solid #eee8e8;
      background: #fff;
    }

    #recentDocuments .document-row:last-child {
      border-bottom: 0;
    }

    #recentDocuments .document-main {
      min-width: 0;
    }

    #recentDocuments .document-title {
      color: #25212a;
      font-size: 14px;
      font-weight: 650;
      line-height: 1.45;
      overflow-wrap: anywhere;
      margin-bottom: 5px;
    }

    #recentDocuments .document-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px 8px;
      color: #77717a;
      font-size: 12px;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    #recentDocuments .document-status {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    #recentDocuments .status {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      max-width: 100%;
      padding: 5px 9px;
      border-radius: 999px;
      background: #f3f0f0;
      color: #50474b;
      font-size: 11px;
      font-weight: 650;
      line-height: 1.35;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    #recentDocuments .status-in-transit {
      background: #fff0d8;
      color: #8b5700;
    }

    #recentDocuments .status-awaiting-action,
    #recentDocuments .status-returned-for-changes {
      background: #fff0ed;
      color: #a33325;
    }

    #recentDocuments .status-received {
      background: #e9f3ff;
      color: #205c9b;
    }

    #recentDocuments .status-approved,
    #recentDocuments .status-completed {
      background: #e7f7ed;
      color: #206a3c;
    }

    #recentDocuments .status-not-approved {
      background: #fbe7e7;
      color: #9a2727;
    }

    #recentDocuments .attachment-indicator {
      color: #7d0000;
      font-size: 11px;
      font-weight: 700;
    }

    #recentDocuments .document-date {
      color: #77717a;
      font-size: 12px;
      line-height: 1.5;
      white-space: normal;
    }

    #recentDocuments .document-view-link {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-height: 34px;
      padding: 6px 12px;
      border: 1px solid #ead9d9;
      border-radius: 8px;
      color: #7d0000;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
    }

    #recentDocuments .document-view-link:hover {
      background: #7d0000;
      color: #fff;
    }

    #recentDocuments .empty-state {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 28px 18px;
      color: #77717a;
      text-align: center;
    }

    #recentDocuments .empty-state strong {
      color: #302830;
    }

    #notificationModal,
    #reportsModal,
    #customizerModal,
    #adminModal,
    #userModal,
    #reviewModal,
    #documentModal {
      max-width: calc(100vw - 28px);
      max-height: calc(100dvh - 28px);
      overflow: auto;
      box-sizing: border-box;
    }

    #notificationModal::backdrop,
    #reportsModal::backdrop,
    #customizerModal::backdrop,
    #adminModal::backdrop,
    #userModal::backdrop,
    #reviewModal::backdrop,
    #documentModal::backdrop {
      background: rgba(24, 16, 20, .58);
      backdrop-filter: blur(3px);
    }

    #notificationList {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: min(60dvh, 540px);
      overflow-y: auto;
    }

    #notificationList .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px;
      border: 1px solid #eee4e4;
      border-radius: 12px;
      background: #fff;
      color: inherit;
      text-decoration: none;
      overflow-wrap: anywhere;
    }

    #notificationList .notification-item:hover {
      border-color: #d9bcbc;
      background: #fffafa;
    }

    #notificationList .notification-icon {
      display: grid;
      place-items: center;
      flex: 0 0 36px;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f7eaea;
      color: #7d0000;
      font-weight: 800;
    }

    #notificationList .notification-copy {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
      gap: 5px;
    }

    #notificationList .notification-copy strong {
      color: #29232a;
      font-size: 13px;
    }

    #notificationList .notification-copy span {
      color: #716973;
      font-size: 12px;
      line-height: 1.5;
    }

    #notificationList .notification-copy small {
      color: #7d0000;
      font-size: 11px;
      font-weight: 700;
    }

    #notificationList .notification-dot {
      flex: 0 0 8px;
      width: 8px;
      height: 8px;
      margin-top: 6px;
      border-radius: 50%;
      background: #7d0000;
    }

    #toast {
      pointer-events: none;
    }

    @media (max-width: 760px) {
      #recentDocuments .document-row {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px 12px;
        padding: 14px 12px;
      }

      #recentDocuments .document-main {
        grid-column: 1 / -1;
      }

      #recentDocuments .document-status {
        grid-column: 1;
      }

      #recentDocuments .document-date {
        grid-column: 1;
      }

      #recentDocuments .document-view-link {
        grid-column: 2;
        grid-row: 2 / span 2;
        align-self: center;
      }
    }
  `;

  document.head.appendChild(style);
}

function renderDocuments(searchTerm = '') {
  const container = byId('recentDocuments');
  if (!container) return;

  const search = String(searchTerm).trim().toLowerCase();

  let documents = loadDocuments();

  if (search) {
    documents = documents.filter(item => [
      item.ref,
      item.title,
      item.subject,
      item.origin,
      item.destination,
      getCurrentOffice(item),
      item.status
    ].join(' ').toLowerCase().includes(search));
  }

  documents.sort((a, b) =>
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  documents = documents.slice(0, 8);

  if (!documents.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No documents found</strong>
        <span>Try another search or register a new document.</span>
      </div>`;
    return;
  }

  container.innerHTML = documents.map(item => `
    <div class="document-row">
      <div class="document-main">
        <div class="document-title">
          ${escapeHtml(item.title || item.subject || 'Untitled document')}
        </div>
        <div class="document-meta">
          <span>${escapeHtml(item.ref || 'No reference')}</span>
          <span>•</span>
          <span>${escapeHtml(getCurrentOffice(item) || 'Office not set')}</span>
        </div>
      </div>

      <div class="document-status">
        <span class="status ${statusClass(item.status)}">
          ${escapeHtml(item.status || 'Unspecified')}
        </span>
        ${item.hasAttachment
          ? '<span class="attachment-indicator">PDF attached</span>'
          : ''}
      </div>

      <div class="document-date">${formatDate(item.createdAt)}</div>

      <a class="document-view-link"
         href="document-view.html?ref=${encodeURIComponent(item.ref || '')}">
        View record
      </a>
    </div>
  `).join('');
}

/* =========================================================
   ACTIVITY FEED
========================================================= */

function renderActivity() {
  const container = byId('activityList');
  if (!container) return;

  const activity = loadActivity().slice(0, 8);

  if (!activity.length) {
    container.innerHTML = `
      <div class="empty-state"><strong>No recent activity</strong></div>`;
    return;
  }

  container.innerHTML = activity.map(item => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div class="activity-content">
        <strong>${escapeHtml(item.action)}</strong>
        <span>${escapeHtml(item.detail)}</span>
        <small>
          ${formatDate(item.date)}
          ${item.user ? ` • ${escapeHtml(item.user)}` : ''}
        </small>
      </div>
    </div>
  `).join('');
}

/* =========================================================
   LIVE NOTIFICATIONS
   Outstanding workflow items determine the count.
   Completing an action removes the corresponding alert
   when the document status/current office changes.
========================================================= */

function getNotifications() {
  const department = currentUserDepartment();
  if (!department) return [];

  const notifications = [];

  loadDocuments().forEach(item => {
    if (isDocumentAwaitingReceipt(item)) {
      notifications.push({
        type: 'receipt',
        title: 'Document awaiting receipt',
        detail: `${item.ref} is in transit to ${department}.`,
        ref: item.ref,
        date: latestHistory(item)?.date || item.createdAt,
        icon: '↓',
        actionLabel: 'Receive document'
      });

      return;
    }

    if (isDocumentForCurrentOffice(item) && isAwaitingAction(item)) {
      notifications.push({
        type: 'action',
        title: 'Action required',
        detail: `${item.ref} — ${item.title || item.subject || 'Document'} requires attention.`,
        ref: item.ref,
        date: latestHistory(item)?.date || item.createdAt,
        icon: '!',
        actionLabel: 'Open document'
      });
    }
  });

  notifications.sort((a, b) =>
    new Date(b.date || 0) - new Date(a.date || 0)
  );

  return notifications;
}

function renderNotifications() {
  const notifications = getNotifications();
  const count = notifications.length;
  const displayCount = count > 99 ? '99+' : String(count);

  [
    'notificationCount',
    'notificationBadge'
  ].forEach(id => {
    const element = byId(id);

    if (element) {
      element.textContent = displayCount;
      element.hidden = count === 0;
      element.setAttribute('aria-label', `${count} outstanding notifications`);
    }
  });

  [
    'notificationsBtn',
    'topNotificationsBtn'
  ].forEach(id => {
    const button = byId(id);
    if (button) {
      button.setAttribute(
        'aria-label',
        count ? `Notifications, ${count} outstanding` : 'Notifications, none outstanding'
      );
    }
  });

  const container = byId('notificationList');
  if (!container) return;

  if (!notifications.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>You're all caught up</strong>
        <span>No outstanding receipt or action notifications for your office.</span>
      </div>`;
    return;
  }

  container.innerHTML = notifications.map(item => `
    <a class="notification-item"
       href="document-view.html?ref=${encodeURIComponent(item.ref)}">
      <span class="notification-icon">${escapeHtml(item.icon)}</span>
      <span class="notification-copy">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.detail)}</span>
        <small>${escapeHtml(item.actionLabel)} · ${formatDate(item.date)}</small>
      </span>
      <span class="notification-dot" aria-hidden="true"></span>
    </a>
  `).join('');
}

/* =========================================================
   PDF DATABASE
========================================================= */

function openPdfDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = indexedDB.open(PDF_DB_NAME, PDF_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(PDF_STORE)) {
        database.createObjectStore(PDF_STORE, { keyPath: 'ref' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePdfFile(ref, file) {
  const database = await openPdfDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PDF_STORE, 'readwrite');

    transaction.objectStore(PDF_STORE).put({
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

    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('PDF storage was cancelled.'));
    };
  });
}

async function getPdfFile(ref) {
  const database = await openPdfDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PDF_STORE, 'readonly');
    const request = transaction.objectStore(PDF_STORE).get(ref);

    request.onsuccess = () => {
      const result = request.result || null;
      database.close();
      resolve(result);
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
    const transaction = database.transaction(PDF_STORE, 'readwrite');
    transaction.objectStore(PDF_STORE).delete(ref);

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

function clearSelectedFile() {
  const input = byId('documentFile');
  const selectedFile = byId('selectedFile');
  const selectedFileName = byId('selectedFileName');

  if (input) input.value = '';
  if (selectedFile) selectedFile.style.display = 'none';
  if (selectedFileName) selectedFileName.textContent = '';
}

function setupPdfUpload() {
  const input = byId('documentFile');
  if (!input) return;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      clearSelectedFile();
      showToast('Only PDF documents are allowed.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      clearSelectedFile();
      showToast('The PDF must not exceed 10 MB.', 'error');
      return;
    }

    if (byId('selectedFileName')) {
      byId('selectedFileName').textContent =
        `${file.name} (${formatFileSize(file.size)})`;
    }

    if (byId('selectedFile')) {
      byId('selectedFile').style.display = 'block';
    }
  });

  byId('removeSelectedFile')?.addEventListener('click', clearSelectedFile);
}

/* =========================================================
   DOCUMENT REGISTRATION
========================================================= */

function setupDocumentRegistration() {
  const form = byId('documentForm');
  const modal = byId('documentModal');

  if (!form || !modal) {
    console.warn('KSUCflow: registration form or modal was not found.');
    return;
  }

  function openRegistrationModal() {
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  }

  function closeRegistrationModal() {
    if (typeof modal.close === 'function') {
      if (modal.open) modal.close();
    } else {
      modal.removeAttribute('open');
    }
  }

  byId('openModal')?.addEventListener('click', openRegistrationModal);
  byId('quickRegisterBtn')?.addEventListener('click', openRegistrationModal);
  byId('closeDocumentModal')?.addEventListener('click', closeRegistrationModal);
  byId('cancelDocumentBtn')?.addEventListener('click', closeRegistrationModal);

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const ref = byId('reference')?.value.trim();
    const title = byId('subject')?.value.trim();
    const origin = byId('origin')?.value.trim();
    const destination = byId('department')?.value;
    const action = byId('action')?.value;
    const notes = byId('notes')?.value.trim() || '';
    const file = byId('documentFile')?.files?.[0] || null;

    if (!ref || !title || !origin || !destination || !action) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const documents = loadDocuments();

    if (documents.some(item =>
      String(item.ref || '').toLowerCase() === ref.toLowerCase()
    )) {
      showToast('That reference number already exists.', 'error');
      return;
    }

    if (file && file.type !== 'application/pdf') {
      showToast('Only PDF documents are allowed.', 'error');
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      showToast('The PDF must not exceed 10 MB.', 'error');
      return;
    }

    const now = new Date().toISOString();

    const record = {
      ref,
      title,
      subject: title,
      origin,
      originatingOffice: origin,
      destination,
      currentOffice: origin,
      action,
      requiredAction: action,
      notes,
      kind: 'Internal',
      status: 'Received',
      state: 'active',
      hasAttachment: Boolean(file),
      attachmentName: file?.name || '',
      attachmentType: file?.type || '',
      attachmentSize: file?.size || 0,
      createdAt: now,
      registeredBy: currentUserName(),
      registeredAt: now,
      history: [{
        action: 'Document registered',
        from: origin,
        to: origin,
        user: currentUserName(),
        department: currentUserDepartment(),
        status: 'Received',
        remarks: notes || 'Document registered into KSUCflow.',
        date: now
      }],
      notesList: notes ? [{
        note: notes,
        text: notes,
        user: currentUserName(),
        date: now
      }] : []
    };

    if (file) {
      try {
        await savePdfFile(ref, file);
      } catch (error) {
        console.error('PDF storage error:', error);
        showToast('Unable to save the PDF attachment.', 'error');
        return;
      }
    }

    documents.unshift(record);
    saveDocuments(documents);

    addActivity('Document registered', `${ref} — ${title}`, 'document');

    form.reset();
    clearSelectedFile();
    renderDashboard();
    closeRegistrationModal();

    showToast('Document registered successfully.');
  });
}

/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {
  byId('documentSearch')?.addEventListener('input', event => {
    renderDocuments(event.target.value);
  });
}

/* =========================================================
   REVIEW / QUICK VIEW
========================================================= */

function openDocumentReview(ref) {
  const documentRecord = loadDocuments().find(item => item.ref === ref);

  if (!documentRecord) {
    showToast('Document could not be found.', 'error');
    return;
  }

  window.location.href =
    `document-view.html?ref=${encodeURIComponent(ref)}`;
}

function setupReviewModal() {
  byId('closeReviewModal')?.addEventListener('click', () => {
    byId('reviewModal')?.close();
  });

  byId('closeReviewBtn')?.addEventListener('click', () => {
    byId('reviewModal')?.close();
  });
}

/* =========================================================
   REPORTS
========================================================= */

function showReports() {
  const documents = loadDocuments();

  const counts = {
    total: documents.length,
    received: documents.filter(item => item.status === 'Received').length,
    transit: documents.filter(item => item.status === 'In transit').length,
    awaiting: documents.filter(item => item.status === 'Awaiting action').length,
    returned: documents.filter(item => item.status === 'Returned for changes').length,
    approved: documents.filter(item => item.status === 'Approved').length,
    completed: documents.filter(item => item.status === 'Completed').length,
    rejected: documents.filter(item => item.status === 'Not approved').length
  };

  const container = byId('reportsContent') || byId('reportContent');

  if (container) {
    container.innerHTML = `
      <div class="report-summary">
        ${Object.entries({
          'Total documents': counts.total,
          'Received': counts.received,
          'In transit': counts.transit,
          'Awaiting action': counts.awaiting,
          'Returned for changes': counts.returned,
          'Approved': counts.approved,
          'Completed': counts.completed,
          'Not approved': counts.rejected
        }).map(([label, value]) => `
          <div>
            <strong>${escapeHtml(label)}</strong>
            <span>${value}</span>
          </div>
        `).join('')}
      </div>`;
  }

  return counts;
}

/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {
  const defaults = {
    systemName: 'KSUCflow',
    institution: 'Koitaleel Samoei University College'
  };

  try {
    return {
      ...defaults,
      ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || {})
    };
  } catch {
    return defaults;
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function updateUserInterface() {
  const user = getCurrentUser();
  const settings = loadSettings();

  const name = user?.name || 'User';
  const role = user?.role || 'Staff';
  const avatar = name.trim().charAt(0).toUpperCase();

  const fields = {
    currentUserName: name,
    currentUserRole: role,
    userAvatar: avatar,
    userName: name,
    userRole: role,
    avatar,
    greetingName: name,
    institutionName: settings.institution,
    appName: settings.systemName,
    greeting: `Welcome back, ${name}.`
  };

  Object.entries(fields).forEach(([id, value]) => {
    if (byId(id)) byId(id).textContent = value;
  });
}

/* =========================================================
   MODAL HELPERS
========================================================= */

function openDialog(id) {
  const modal = byId(id);
  if (!modal) return;

  if (typeof modal.showModal === 'function') {
    if (!modal.open) modal.showModal();
  } else {
    modal.setAttribute('open', '');
    modal.style.zIndex = '99999';
  }
}

function closeDialog(id) {
  const modal = byId(id);
  if (!modal) return;

  if (typeof modal.close === 'function') {
    if (modal.open) modal.close();
  } else {
    modal.removeAttribute('open');
  }
}

/* =========================================================
   NAVIGATION & MODALS
========================================================= */

function setupNavigation() {
  [
    'notificationsBtn',
    'topNotificationsBtn',
    'notificationButton'
  ].forEach(id => {
    byId(id)?.addEventListener('click', () => {
      renderNotifications();
      openDialog('notificationModal');
    });
  });

  byId('closeNotificationModal')?.addEventListener('click', () => {
    closeDialog('notificationModal');
  });

  [
    'reportsBtn',
    'quickReportsBtn',
    'reportsButton'
  ].forEach(id => {
    byId(id)?.addEventListener('click', () => {
      showReports();
      openDialog('reportsModal');
    });
  });

  byId('closeReportsModal')?.addEventListener('click', () => {
    closeDialog('reportsModal');
  });

  [
    'settingsBtn',
    'settingsButton'
  ].forEach(id => {
    byId(id)?.addEventListener('click', () => {
      const settings = loadSettings();

      if (byId('systemNameSetting')) {
        byId('systemNameSetting').value = settings.systemName;
      }

      if (byId('institutionSetting')) {
        byId('institutionSetting').value = settings.institution;
      }

      openDialog('customizerModal');
    });
  });

  byId('closeCustomizerModal')?.addEventListener('click', () => {
    closeDialog('customizerModal');
  });

  byId('cancelSettingsBtn')?.addEventListener('click', () => {
    closeDialog('customizerModal');
  });

  const saveSettingsButton =
    byId('saveSettingsBtn') || byId('saveSettings');

  saveSettingsButton?.addEventListener('click', () => {
    saveSettings({
      systemName:
        byId('systemNameSetting')?.value.trim() || 'KSUCflow',
      institution:
        byId('institutionSetting')?.value.trim() ||
        'Koitaleel Samoei University College'
    });

    updateUserInterface();
    closeDialog('customizerModal');
    showToast('Settings saved successfully.');
  });

  byId('adminBtn')?.addEventListener('click', () => {
    const user = getCurrentUser();

    if (user?.role === 'Administrator') {
      window.location.href = 'admin.html';
      return;
    }

    showToast('Administrator access is required.', 'error');
  });

  byId('closeAdminModal')?.addEventListener('click', () => {
    closeDialog('adminModal');
  });

  byId('userMenuBtn')?.addEventListener('click', () => {
    const user = getCurrentUser();

    if (byId('userModalName')) {
      byId('userModalName').textContent = user?.name || 'User';
    }

    if (byId('userModalRole')) {
      byId('userModalRole').textContent = user?.role || 'Staff';
    }

    openDialog('userModal');
  });

  byId('closeUserModal')?.addEventListener('click', () => {
    closeDialog('userModal');
  });

  byId('userSettingsBtn')?.addEventListener('click', () => {
    closeDialog('userModal');
    openDialog('customizerModal');
  });

  [
    'signOutBtn',
    'signOut',
    'userSignOutBtn'
  ].forEach(id => {
    byId(id)?.addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = 'login.html';
    });
  });
}

/* =========================================================
   WORKFLOW SHORTCUTS
========================================================= */

function setupWorkflowShortcuts() {
  byId('myInboxButton')?.addEventListener('click', () => {
    localStorage.setItem('ksucDocumentFilter', JSON.stringify({
      type: 'office',
      value: currentUserDepartment()
    }));

    window.location.href = 'documents.html';
  });

  byId('awaitingReceiptButton')?.addEventListener('click', () => {
    localStorage.setItem('ksucDocumentFilter', JSON.stringify({
      type: 'status',
      value: 'In transit'
    }));

    window.location.href = 'documents.html';
  });

  byId('myActionsButton')?.addEventListener('click', () => {
    localStorage.setItem('ksucDocumentFilter', JSON.stringify({
      type: 'status',
      value: 'Awaiting action'
    }));

    window.location.href = 'documents.html';
  });
}

/* =========================================================
   DATA MIGRATION
========================================================= */

function migrateDocuments() {
  const documents = loadDocuments();
  let changed = false;

  documents.forEach(item => {
    if (!Array.isArray(item.history)) {
      item.history = [];
      changed = true;
    }

    if (!Array.isArray(item.notesList)) {
      item.notesList = [];
      changed = true;
    }

    if (!item.title && item.subject) {
      item.title = item.subject;
      changed = true;
    }

    if (!item.currentOffice) {
      const last = latestHistory(item);

      item.currentOffice =
        item.status === 'In transit'
          ? (last?.from || item.origin || '')
          : (last?.to || item.destination || item.origin || '');

      changed = true;
    }

    if ([
      'For approval',
      'For action',
      'For review',
      'For information'
    ].includes(item.status)) {
      item.status = 'Awaiting action';
      changed = true;
    }

    // An in-transit document remains with the sending office
    // until the receiving office records receipt.
    if (item.status === 'In transit') {
      const last = latestHistory(item);

      if (last?.action === 'Document forwarded' && last.from &&
          item.currentOffice !== last.from) {
        item.currentOffice = last.from;
        changed = true;
      }
    }
  });

  if (changed) saveDocuments(documents);
}

/* =========================================================
   INITIALIZE
========================================================= */

function initializeApp() {
  injectDashboardPolish();

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

  // Refresh the dashboard when another page/tab changes
  // documents in the same browser storage.
  window.addEventListener('storage', event => {
    if ([
      DOCUMENTS_KEY,
      ACTIVITY_KEY,
      SETTINGS_KEY
    ].includes(event.key)) {
      updateUserInterface();
      renderDashboard();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      renderDashboard();
    }
  });

  // Keep the dashboard's displayed counts current while open.
  window.addEventListener('focus', renderDashboard);
}

document.addEventListener('DOMContentLoaded', initializeApp);
