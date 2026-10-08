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
const NOTIFICATIONS_KEY = 'ksucNotifications';
const NOTIFICATION_SYNC_KEY = 'ksucNotificationSync';

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

function formatRelativeTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diff = Date.now() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'Just now';
  }

  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return formatDate(value);
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

      /* Correct interpretation:
         document is still travelling from
         Administration to Procurement.
      */
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
  if (
    !Array.isArray(document.history) ||
    !document.history.length
  ) {
    return null;
  }

  return document.history[document.history.length - 1];
}

function getCurrentOffice(document) {
  if (document.currentOffice) {
    return document.currentOffice;
  }

  const last = latestHistory(document);

  return (
    last?.to ||
    document.destination ||
    document.origin ||
    ''
  );
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
  const department =
    currentUserDepartment();

  if (!department) return false;

  return (
    getCurrentOffice(document) === department &&
    !isCompleted(document) &&
    !isInTransit(document)
  );
}

function isDocumentAwaitingReceipt(document) {
  const department =
    currentUserDepartment();

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
   NOTIFICATION STORAGE
========================================================= */

function loadStoredNotifications() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(NOTIFICATIONS_KEY) || 'null'
    );

    if (Array.isArray(saved)) {
      return saved;
    }
  } catch (error) {
    console.warn(
      'Unable to load notifications.'
    );
  }

  return [];
}

function saveStoredNotifications(
  notifications
) {
  localStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify(
      notifications.slice(0, 100)
    )
  );
}

function notificationBelongsToCurrentUser(
  notification
) {
  const department =
    currentUserDepartment();

  if (!department) return false;

  if (
    notification.targetDepartment &&
    notification.targetDepartment === department
  ) {
    return true;
  }

  if (
    notification.targetUser &&
    notification.targetUser === currentUserName()
  ) {
    return true;
  }

  return false;
}

function addNotification({
  document,
  title,
  message,
  type = 'workflow',
  targetDepartment = '',
  targetUser = ''
}) {

  const notifications =
    loadStoredNotifications();

  const notification = {
    id:
      `N-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    documentRef:
      document?.ref || '',

    title,
    message,
    type,

    targetDepartment,
    targetUser,

    createdAt:
      new Date().toISOString(),

    read: false
  };

  notifications.unshift(
    notification
  );

  saveStoredNotifications(
    notifications
  );

  renderNotifications();
}

function markNotificationRead(id) {

  const notifications =
    loadStoredNotifications();

  const notification =
    notifications.find(
      item => item.id === id
    );

  if (notification) {
    notification.read = true;
    notification.readAt =
      new Date().toISOString();
  }

  saveStoredNotifications(
    notifications
  );

  renderNotifications();
}

function markAllNotificationsRead() {

  const notifications =
    loadStoredNotifications();

  notifications.forEach(
    notification => {
      if (
        notificationBelongsToCurrentUser(
          notification
        )
      ) {
        notification.read = true;
        notification.readAt =
          new Date().toISOString();
      }
    }
  );

  saveStoredNotifications(
    notifications
  );

  renderNotifications();

  showToast(
    'All notifications marked as read.'
  );
}

function getCurrentUserNotifications() {

  const notifications =
    loadStoredNotifications();

  return notifications.filter(
    notification =>
      notificationBelongsToCurrentUser(
        notification
      )
  );
}

function getUnreadNotificationCount() {

  return getCurrentUserNotifications()
    .filter(
      notification =>
        !notification.read
    )
    .length;
}

/* =========================================================
   WORKFLOW → NOTIFICATION SYNCHRONIZATION
========================================================= */

function notificationAlreadyExists(
  ref,
  historyItem
) {

  const notifications =
    loadStoredNotifications();

  return notifications.some(
    notification =>
      notification.documentRef === ref &&
      notification.historyDate ===
        historyItem.date
  );
}

function syncWorkflowNotifications() {

  const documents =
    loadDocuments();

  const notifications =
    loadStoredNotifications();

  let changed = false;

  documents.forEach(document => {

    if (
      !Array.isArray(document.history)
    ) {
      return;
    }

    document.history.forEach(
      historyItem => {

        if (
          !historyItem ||
          !historyItem.date
        ) {
          return;
        }

        if (
          notificationAlreadyExists(
            document.ref,
            historyItem
          )
        ) {
          return;
        }

        let title = '';
        let message = '';
        let targetDepartment = '';

        const action =
          String(
            historyItem.action || ''
          ).toLowerCase();

        /* -----------------------------------------
           FORWARDED
        ----------------------------------------- */

        if (
          action.includes(
            'forward'
          )
        ) {

          title =
            'Document forwarded';

          message =
            `${document.ref} has been forwarded to ${historyItem.to}.`;

          targetDepartment =
            historyItem.to;

        }

        /* -----------------------------------------
           RECEIVED
        ----------------------------------------- */

        else if (
          action.includes(
            'receive'
          )
        ) {

          title =
            'Document received';

          message =
            `${document.ref} has been received by ${historyItem.to || historyItem.user}.`;

          /*
           * Notify the office/person that
           * sent the document.
           */
          targetDepartment =
            historyItem.from;

        }

        /* -----------------------------------------
           APPROVED
        ----------------------------------------- */

        else if (
          action.includes(
            'approv'
          )
        ) {

          title =
            'Document approved';

          message =
            `${document.ref} has been approved.`;

          targetDepartment =
            historyItem.from ||
            document.origin;

        }

        /* -----------------------------------------
           COMPLETED
        ----------------------------------------- */

        else if (
          action.includes(
            'complet'
          )
        ) {

          title =
            'Document completed';

          message =
            `${document.ref} has been marked as completed.`;

          targetDepartment =
            historyItem.from ||
            document.origin;

        }

        /* -----------------------------------------
           RETURNED
        ----------------------------------------- */

        else if (
          action.includes(
            'return'
          )
        ) {

          title =
            'Document returned';

          message =
            `${document.ref} has been returned for changes.`;

          targetDepartment =
            historyItem.to ||
            document.origin;

        }

        /* -----------------------------------------
           REJECTED
        ----------------------------------------- */

        else if (
          action.includes(
            'reject'
          ) ||
          action.includes(
            'not approved'
          )
        ) {

          title =
            'Document not approved';

          message =
            `${document.ref} was not approved.`;

          targetDepartment =
            historyItem.from ||
            document.origin;

        }

        /* -----------------------------------------
           OTHER ACTIONS
        ----------------------------------------- */

        else if (
          historyItem.action &&
          historyItem.action !==
            'Document registered'
        ) {

          title =
            'Document updated';

          message =
            `${document.ref} has been updated.`;

          targetDepartment =
            historyItem.to ||
            historyItem.from ||
            document.origin;

        }

        /*
         * Registration itself should not create
         * a workflow notification.
         */
        if (
          !title ||
          historyItem.action ===
            'Document registered'
        ) {
          return;
        }

        const notification = {

          id:
            `WF-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,

          documentRef:
            document.ref,

          title,

          message,

          type:
            'workflow',

          targetDepartment,

          targetUser:
            '',

          historyDate:
            historyItem.date,

          createdAt:
            new Date().toISOString(),

          read:
            false

        };

        notifications.unshift(
          notification
        );

        changed = true;

      }
    );

  });

  if (changed) {
    saveStoredNotifications(
      notifications
    );
  }
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const documents =
    loadDocuments();

  const department =
    currentUserDepartment();

  const total =
    documents.length;

  const awaitingReceipt =
    documents.filter(
      isDocumentAwaitingReceipt
    ).length;

  const inbox =
    documents.filter(
      isDocumentForCurrentOffice
    ).length;

  const awaitingAction =
    documents.filter(
      isDocumentAwaitingMyAction
    ).length;

  const transit =
    documents.filter(
      document =>
        document.status ===
        'In transit'
    ).length;

  const completed =
    documents.filter(
      isCompleted
    ).length;

  if (byId('totalDocuments')) {
    byId('totalDocuments')
      .textContent = total;
  }

  if (byId('awaitingDocuments')) {
    byId('awaitingDocuments')
      .textContent =
      awaitingAction;
  }

  if (byId('approvedDocuments')) {
    byId('approvedDocuments')
      .textContent =
      documents.filter(
        document =>
          document.status ===
          'Approved'
      ).length;
  }

  if (byId('transitDocuments')) {
    byId('transitDocuments')
      .textContent =
      transit;
  }

  if (byId('myInbox')) {
    byId('myInbox')
      .textContent =
      inbox;
  }

  if (byId('awaitingReceipt')) {
    byId('awaitingReceipt')
      .textContent =
      awaitingReceipt;
  }

  if (byId('myActions')) {
    byId('myActions')
      .textContent =
      awaitingAction;
  }

  if (byId('completedDocuments')) {
    byId('completedDocuments')
      .textContent =
      completed;
  }

  if (byId('currentOffice')) {
    byId('currentOffice')
      .textContent =
      department ||
      'Not assigned';
  }

  renderNotifications();
  renderDocuments();
  renderActivity();
}

/* =========================================================
   DOCUMENT LIST
========================================================= */

function statusClass(status) {

  const value =
    String(status || '')
      .toLowerCase()
      .replace(/\s+/g, '-');

  return `status-${value}`;
}

function renderDocuments(
  searchTerm = ''
) {

  const container =
    byId('recentDocuments');

  if (!container) {
    return;
  }

  const documents =
    loadDocuments();

  const search =
    String(searchTerm)
      .trim()
      .toLowerCase();

  let filtered =
    documents;

  if (search) {

    filtered =
      documents.filter(
        document =>
          [
            document.ref,
            document.title,
            document.subject,
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

  filtered =
    filtered.slice(0, 8);

  if (!filtered.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No documents found</strong>
        <span>
          There are no documents matching your search.
        </span>
      </div>
    `;

    return;
  }

  container.innerHTML =
    filtered.map(document => {

      const currentOffice =
        getCurrentOffice(document);

      const inTransit =
        isInTransit(document);

      const destination =
        document.destination ||
        '';

      const movement =
        inTransit
          ? `
            <span class="recent-route">
              ${escapeHtml(currentOffice)}
              <span class="route-arrow">→</span>
              ${escapeHtml(destination)}
            </span>
          `
          : `
            <span class="recent-office">
              ${escapeHtml(currentOffice)}
            </span>
          `;

      return `
        <div
          class="document-row ksuc-recent-document"
          data-ref="${escapeHtml(document.ref)}"
        >

          <div class="document-main">

            <div class="document-reference">
              ${escapeHtml(document.ref)}
            </div>

            <div
              class="document-title"
              title="${escapeHtml(document.title)}"
            >
              ${escapeHtml(document.title)}
            </div>

            <div class="document-meta">

              ${movement}

              ${
                document.hasAttachment
                  ? `
                    <span class="recent-pdf">
                      PDF
                    </span>
                  `
                  : ''
              }

            </div>

          </div>

          <div class="document-status">

            <span
              class="status ${statusClass(
                document.status
              )}"
            >
              ${escapeHtml(
                document.status
              )}
            </span>

          </div>

          <div class="document-date">

            <span class="recent-date-label">
              ${formatRelativeTime(
                document.createdAt
              )}
            </span>

            <small>
              ${formatDate(
                document.createdAt
              )}
            </small>

          </div>

          <a
            class="document-view-link"
            href="document-view.html?ref=${encodeURIComponent(
              document.ref
            )}"
          >
            View
          </a>

        </div>
      `;

    }).join('');
}

/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity() {

  const container =
    byId('activityList');

  if (!container) {
    return;
  }

  const activity =
    loadActivity();

  const items =
    activity.slice(0, 8);

  if (!items.length) {

    container.innerHTML = `
      <div class="empty-state">
        <strong>No recent activity</strong>
      </div>
    `;

    return;
  }

  container.innerHTML =
    items.map(item => `

      <div class="activity-item">

        <div class="activity-dot"></div>

        <div class="activity-content">

          <strong>
            ${escapeHtml(
              item.action
            )}
          </strong>

          <span>
            ${escapeHtml(
              item.detail
            )}
          </span>

          <small>
            ${formatDate(
              item.date
            )}

            ${
              item.user
                ? ` • ${escapeHtml(
                    item.user
                  )}`
                : ''
            }

          </small>

        </div>

      </div>

    `).join('');
}

/* =========================================================
   NOTIFICATIONS UI
========================================================= */

function notificationIcon(
  type
) {

  const icons = {

    workflow:
      '↗',

    receipt:
      '✓',

    action:
      '⚡',

    returned:
      '↩',

    approved:
      '✓',

    completed:
      '✓'

  };

  return icons[type] || '•';
}

function renderNotifications() {

  const allNotifications =
    getCurrentUserNotifications();

  const unread =
    allNotifications.filter(
      notification =>
        !notification.read
    );

  const count =
    unread.length;

  /* -----------------------------------------
     COUNTERS
  ----------------------------------------- */

  [
    'notificationCount',
    'notificationBadge'
  ].forEach(id => {

    const element =
      byId(id);

    if (!element) {
      return;
    }

    if (count > 0) {

      element.textContent =
        count > 99
          ? '99+'
          : count;

      element.style.display =
        '';

    } else {

      element.textContent =
        '0';

      /*
       * If CSS handles visibility
       * through empty/zero states,
       * this keeps the value available.
       */
      element.style.display =
        '';

    }

  });

  const container =
    byId('notificationList');

  if (!container) {
    return;
  }

  if (!allNotifications.length) {

    container.innerHTML = `
      <div class="empty-state notification-empty">

        <div class="notification-empty-icon">
          ✓
        </div>

        <strong>
          You're all caught up
        </strong>

        <span>
          New document activity will appear here.
        </span>

      </div>
    `;

    return;
  }

  const sorted =
    [...allNotifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 30);

  container.innerHTML =
    sorted.map(notification => `

      <div
        class="
          notification-item
          ${notification.read
            ? 'notification-read'
            : 'notification-unread'}
        "
        data-notification-id="${escapeHtml(
          notification.id
        )}"
      >

        <div class="notification-icon">

          ${escapeHtml(
            notificationIcon(
              notification.type
            )
          )}

        </div>

        <div class="notification-body">

          <strong>
            ${escapeHtml(
              notification.title
            )}
          </strong>

          <span>
            ${escapeHtml(
              notification.message
            )}
          </span>

          <small>
            ${formatRelativeTime(
              notification.createdAt
            )}
          </small>

        </div>

        ${
          !notification.read
            ? `
              <span
                class="notification-unread-dot"
                title="Unread"
              ></span>
            `
            : ''
        }

      </div>

    `).join('');

  /*
   * Make notification items interactive.
   */
  container
    .querySelectorAll(
      '.notification-item'
    )
    .forEach(item => {

      item.addEventListener(
        'click',
        function () {

          const id =
            item.dataset
              .notificationId;

          const notification =
            allNotifications.find(
              entry =>
                entry.id === id
            );

          if (!notification) {
            return;
          }

          markNotificationRead(
            id
          );

          if (
            notification.documentRef
          ) {

            window.location.href =
              `document-view.html?ref=${encodeURIComponent(
                notification.documentRef
              )}`;

          }

        }
      );

    });

}

/* =========================================================
   NOTIFICATION MODAL LAYERING
========================================================= */

function prepareModalLayering() {

  const style =
    document.createElement('style');

  style.id =
    'ksuc-modal-layering';

  style.textContent = `

    /*
     * KSUCflow modal stacking
     */

    dialog {
      z-index: 10000;
    }

    dialog::backdrop {
      z-index: 9999;
      background:
        rgba(15, 23, 42, 0.58);
    }

    #notificationModal {
      z-index: 20000;
    }

    #notificationModal::backdrop {
      z-index: 19999;
      background:
        rgba(15, 23, 42, 0.68);
    }

    #toast {
      z-index: 50000 !important;
    }

    .notification-item {
      cursor: pointer;
    }

    .notification-unread {
      position: relative;
    }

    .notification-unread-dot {
      width: 9px;
      height: 9px;
      min-width: 9px;
      border-radius: 50%;
      background: #7D0000;
      display: block;
      margin-top: 7px;
    }

    .notification-read {
      opacity: 0.72;
    }

    .notification-body {
      min-width: 0;
    }

    .notification-body strong,
    .notification-body span {
      display: block;
    }

    .notification-body span {
      word-break: break-word;
    }

    /*
     * Recent documents
     */

    .ksuc-recent-document {
      min-width: 0;
    }

    .ksuc-recent-document
    .document-main {
      min-width: 0;
    }

    .document-reference {
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #7D0000;
      margin-bottom: 4px;
      overflow-wrap: anywhere;
    }

    .document-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .document-meta {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 7px;
      flex-wrap: wrap;
    }

    .recent-route,
    .recent-office {
      overflow-wrap: anywhere;
    }

    .route-arrow {
      font-weight: 700;
      margin: 0 3px;
    }

    .recent-pdf {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 5px;
      background: #f1f5f9;
    }

    .document-date {
      white-space: nowrap;
    }

    .document-date small {
      display: block;
      font-size: 0.68rem;
      opacity: 0.62;
      margin-top: 2px;
    }

    @media (max-width: 850px) {

      .ksuc-recent-document {
        grid-template-columns:
          minmax(0, 1fr)
          auto;
        gap: 10px;
      }

      .ksuc-recent-document
      .document-date {
        display: none;
      }

    }

  `;

  document.head.appendChild(
    style
  );

}

/* =========================================================
   PDF DATABASE
========================================================= */

function openPdfDatabase() {

  return new Promise(
    (resolve, reject) => {

      const request =
        indexedDB.open(
          PDF_DB_NAME,
          PDF_DB_VERSION
        );

      request.onupgradeneeded =
        function () {

          const database =
            request.result;

          if (
            !database.objectStoreNames
              .contains(PDF_STORE)
          ) {

            database.createObjectStore(
              PDF_STORE,
              {
                keyPath: 'ref'
              }
            );

          }

        };

      request.onsuccess =
        function () {
          resolve(
            request.result
          );
        };

      request.onerror =
        function () {
          reject(
            request.error
          );
        };

    }
  );

}

async function savePdfFile(
  ref,
  file
) {

  const database =
    await openPdfDatabase();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        database.transaction(
          PDF_STORE,
          'readwrite'
        );

      const store =
        transaction.objectStore(
          PDF_STORE
        );

      store.put({
        ref,
        file,
        savedAt:
          new Date().toISOString()
      });

      transaction.oncomplete =
        () => {

          database.close();

          resolve();

        };

      transaction.onerror =
        () => {

          database.close();

          reject(
            transaction.error
          );

        };

    }
  );

}

async function getPdfFile(
  ref
) {

  const database =
    await openPdfDatabase();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        database.transaction(
          PDF_STORE,
          'readonly'
        );

      const store =
        transaction.objectStore(
          PDF_STORE
        );

      const request =
        store.get(ref);

      request.onsuccess =
        () => {

          database.close();

          resolve(
            request.result ||
            null
          );

        };

      request.onerror =
        () => {

          database.close();

          reject(
            request.error
          );

        };

    }
  );

}

async function deletePdfFile(
  ref
) {

  const database =
    await openPdfDatabase();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        database.transaction(
          PDF_STORE,
          'readwrite'
        );

      const store =
        transaction.objectStore(
          PDF_STORE
        );

      store.delete(ref);

      transaction.oncomplete =
        () => {

          database.close();

          resolve();

        };

      transaction.onerror =
        () => {

          database.close();

          reject(
            transaction.error
          );

        };

    }
  );

}

/* =========================================================
   PDF UPLOAD
========================================================= */

function setupPdfUpload() {

  const input =
    byId('documentFile');

  if (!input) {
    return;
  }

  input.addEventListener(
    'change',
    function () {

      const file =
        input.files?.[0];

      if (!file) {
        return;
      }

      if (
        file.type !==
        'application/pdf'
      ) {

        input.value = '';

        showToast(
          'Only PDF documents are allowed.',
          'error'
        );

        return;
      }

      const maxSize =
        10 * 1024 * 1024;

      if (
        file.size >
        maxSize
      ) {

        input.value = '';

        showToast(
          'The PDF must not exceed 10 MB.',
          'error'
        );

        return;
      }

      const selectedFile =
        byId('selectedFile');

      const selectedFileName =
        byId('selectedFileName');

      if (selectedFileName) {

        selectedFileName.textContent =
          `${file.name} (${formatFileSize(
            file.size
          )})`;

      }

      if (selectedFile) {

        selectedFile.style.display =
          'block';

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

          selectedFile.style.display =
            'none';

        }

        if (selectedFileName) {

          selectedFileName.textContent =
            '';

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

  function openRegistrationModal() {

    if (
      typeof modal.showModal ===
      'function'
    ) {

      modal.showModal();

    } else {

      modal.setAttribute(
        'open',
        ''
      );

    }

  }

  function closeRegistrationModal() {

    if (
      typeof modal.close ===
      'function'
    ) {

      modal.close();

    } else {

      modal.removeAttribute(
        'open'
      );

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

  form.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();

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
        byId('notes')?.value.trim() ||
        '';

      const fileInput =
        byId('documentFile');

      const file =
        fileInput?.files?.[0] ||
        null;

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

      const documents =
        loadDocuments();

      const duplicate =
        documents.some(
          document =>
            String(
              document.ref || ''
            ).toLowerCase() ===
            ref.toLowerCase()
        );

      if (duplicate) {

        showToast(
          'A document with this reference number already exists.',
          'error'
        );

        return;
      }

      if (file) {

        if (
          file.type !==
          'application/pdf'
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

      const now =
        new Date().toISOString();

      const documentRecord = {

        ref,

        title,

        subject:
          title,

        origin,

        originatingOffice:
          origin,

        destination,

        currentOffice:
          origin,

        action,

        requiredAction:
          action,

        notes,

        kind:
          'Internal',

        status:
          'Received',

        state:
          'active',

        hasAttachment:
          Boolean(file),

        attachmentName:
          file?.name || '',

        attachmentType:
          file?.type || '',

        attachmentSize:
          file?.size || 0,

        createdAt:
          now,

        registeredBy:
          currentUserName(),

        registeredAt:
          now,

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
                  note:
                    notes,

                  text:
                    notes,

                  user:
                    currentUserName(),

                  date:
                    now
                }
              ]
            : []

      };

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

      documents.unshift(
        documentRecord
      );

      saveDocuments(
        documents
      );

      addActivity(
        'Document registered',
        `${ref} — ${title}`,
        'document'
      );

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

      renderDashboard();

      closeRegistrationModal();

      showToast(
        'Document registered successfully.'
      );

    }
  );

}

/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

  const input =
    byId('documentSearch');

  if (!input) {
    return;
  }

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
   REVIEW
========================================================= */

function openDocumentReview(
  ref
) {

  const documents =
    loadDocuments();

  const document =
    documents.find(
      item =>
        item.ref === ref
    );

  if (!document) {

    showToast(
      'Document could not be found.',
      'error'
    );

    return;
  }

  window.location.href =
    `document-view.html?ref=${encodeURIComponent(
      ref
    )}`;

}

function setupReviewModal() {
  /*
   * Compatibility hook.
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
        document.status ===
        'In transit'
    ).length;

  const awaiting =
    documents.filter(
      document =>
        document.status ===
        'Awaiting action'
    ).length;

  const received =
    documents.filter(
      document =>
        document.status ===
        'Received'
    ).length;

  const approved =
    documents.filter(
      document =>
        document.status ===
        'Approved'
    ).length;

  const completed =
    documents.filter(
      document =>
        document.status ===
        'Completed'
    ).length;

  const rejected =
    documents.filter(
      document =>
        document.status ===
        'Not approved'
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

function saveSettings(
  settings
) {

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(
      settings
    )
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
    user?.name ||
    'User';

  const userRole =
    user?.role ||
    'Staff';

  const avatar =
    userName
      .trim()
      .charAt(0)
      .toUpperCase();

  if (byId('currentUserName')) {

    byId('currentUserName')
      .textContent =
      userName;

  }

  if (byId('currentUserRole')) {

    byId('currentUserRole')
      .textContent =
      userRole;

  }

  if (byId('userAvatar')) {

    byId('userAvatar')
      .textContent =
      avatar;

  }

  if (byId('userName')) {

    byId('userName')
      .textContent =
      userName;

  }

  if (byId('userRole')) {

    byId('userRole')
      .textContent =
      userRole;

  }

  if (byId('avatar')) {

    byId('avatar')
      .textContent =
      avatar;

  }

  if (byId('greetingName')) {

    byId('greetingName')
      .textContent =
      userName;

  }

  if (byId('institutionName')) {

    byId('institutionName')
      .textContent =
      settings.institution;

  }

  if (byId('appName')) {

    byId('appName')
      .textContent =
      settings.systemName;

  }

  if (byId('greeting')) {

    byId('greeting')
      .textContent =
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

  notificationButtons.forEach(
    button => {

      button.addEventListener(
        'click',
        function () {

          const modal =
            byId(
              'notificationModal'
            );

          renderNotifications();

          if (
            modal &&
            typeof modal.showModal ===
            'function'
          ) {

            modal.showModal();

          }

        }
      );

    }
  );

  const closeNotification =
    byId(
      'closeNotificationModal'
    );

  if (closeNotification) {

    closeNotification.addEventListener(
      'click',
      function () {

        const modal =
          byId(
            'notificationModal'
          );

        if (modal) {
          modal.close();
        }

      }
    );

  }

  /*
   * Mark all notifications read.
   *
   * This works even if the HTML does not
   * currently contain a dedicated button.
   */
  const notificationModal =
    byId(
      'notificationModal'
    );

  if (notificationModal) {

    const header =
      notificationModal.querySelector(
        'header, .modal-header, .dialog-header'
      );

    if (
      header &&
      !byId(
        'markAllNotificationsBtn'
      )
    ) {

      const button =
        document.createElement(
          'button'
        );

      button.id =
        'markAllNotificationsBtn';

      button.type =
        'button';

      button.textContent =
        'Mark all read';

      button.className =
        'notification-mark-all';

      button.addEventListener(
        'click',
        markAllNotificationsRead
      );

      header.appendChild(
        button
      );

    }

  }

  /* -------------------------------------------------------
     REPORTS
  ------------------------------------------------------- */

  const reportsButtons = [

    byId('reportsBtn'),

    byId('quickReportsBtn'),

    byId('reportsButton')

  ].filter(Boolean);

  reportsButtons.forEach(
    button => {

      button.addEventListener(
        'click',
        function () {

          showReports();

          const modal =
            byId(
              'reportsModal'
            );

          if (
            modal &&
            typeof modal.showModal ===
            'function'
          ) {

            modal.showModal();

          }

        }
      );

    }
  );

  const closeReports =
    byId(
      'closeReportsModal'
    );

  if (closeReports) {

    closeReports.addEventListener(
      'click',
      function () {

        const modal =
          byId(
            'reportsModal'
          );

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

  settingsButtons.forEach(
    button => {

      button.addEventListener(
        'click',
        function () {

          const settings =
            loadSettings();

          if (
            byId(
              'systemNameSetting'
            )
          ) {

            byId(
              'systemNameSetting'
            ).value =
              settings.systemName;

          }

          if (
            byId(
              'institutionSetting'
            )
          ) {

            byId(
              'institutionSetting'
            ).value =
              settings.institution;

          }

          const modal =
            byId(
              'customizerModal'
            );

          if (
            modal &&
            typeof modal.showModal ===
            'function'
          ) {

            modal.showModal();

          }

        }
      );

    }
  );

  const closeSettings =
    byId(
      'closeCustomizerModal'
    );

  if (closeSettings) {

    closeSettings.addEventListener(
      'click',
      function () {

        const modal =
          byId(
            'customizerModal'
          );

        if (modal) {
          modal.close();
        }

      }
    );

  }

  const cancelSettings =
    byId(
      'cancelSettingsBtn'
    );

  if (cancelSettings) {

    cancelSettings.addEventListener(
      'click',
      function () {

        const modal =
          byId(
            'customizerModal'
          );

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
            byId(
              'systemNameSetting'
            )?.value.trim() ||
            'KSUCflow',

          institution:
            byId(
              'institutionSetting'
            )?.value.trim() ||
            'Koitaleel Samoei University College'

        };

        saveSettings(
          settings
        );

        updateUserInterface();

        const modal =
          byId(
            'customizerModal'
          );

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
          typeof modal.showModal ===
          'function'
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
    byId(
      'closeAdminModal'
    );

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

        if (
          byId(
            'userModalName'
          )
        ) {

          byId(
            'userModalName'
          ).textContent =
            user?.name ||
            'User';

        }

        if (
          byId(
            'userModalRole'
          )
        ) {

          byId(
            'userModalRole'
          ).textContent =
            user?.role ||
            'Staff';

        }

        const modal =
          byId(
            'userModal'
          );

        if (
          modal &&
          typeof modal.showModal ===
          'function'
        ) {

          modal.showModal();

        }

      }
    );

  }

  const closeUser =
    byId(
      'closeUserModal'
    );

  if (closeUser) {

    closeUser.addEventListener(
      'click',
      function () {

        const modal =
          byId(
            'userModal'
          );

        if (modal) {
          modal.close();
        }

      }
    );

  }

  /* -------------------------------------------------------
     USER SETTINGS
  ------------------------------------------------------- */

  const userSettingsButton =
    byId(
      'userSettingsBtn'
    );

  if (userSettingsButton) {

    userSettingsButton.addEventListener(
      'click',
      function () {

        const userModal =
          byId(
            'userModal'
          );

        if (userModal) {
          userModal.close();
        }

        const settingsButton =
          byId(
            'settingsBtn'
          );

        if (settingsButton) {
          settingsButton.click();
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

  signOutButtons.forEach(
    button => {

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

    }
  );

}

/* =========================================================
   DASHBOARD QUICK FILTERS
========================================================= */

function setupWorkflowShortcuts() {

  const inboxButton =
    byId(
      'myInboxButton'
    );

  if (inboxButton) {

    inboxButton.addEventListener(
      'click',
      function () {

        const department =
          currentUserDepartment();

        localStorage.setItem(
          'ksucDocumentFilter',
          JSON.stringify({
            type:
              'office',
            value:
              department
          })
        );

        window.location.href =
          'documents.html';

      }
    );

  }

  const receiptButton =
    byId(
      'awaitingReceiptButton'
    );

  if (receiptButton) {

    receiptButton.addEventListener(
      'click',
      function () {

        localStorage.setItem(
          'ksucDocumentFilter',
          JSON.stringify({
            type:
              'status',
            value:
              'In transit'
          })
        );

        window.location.href =
          'documents.html';

      }
    );

  }

  const actionButton =
    byId(
      'myActionsButton'
    );

  if (actionButton) {

    actionButton.addEventListener(
      'click',
      function () {

        localStorage.setItem(
          'ksucDocumentFilter',
          JSON.stringify({
            type:
              'status',
            value:
              'Awaiting action'
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

  let changed =
    false;

  documents.forEach(
    document => {

      if (
        !Array.isArray(
          document.history
        )
      ) {

        document.history =
          [];

        changed =
          true;

      }

      if (
        !Array.isArray(
          document.notesList
        )
      ) {

        document.notesList =
          [];

        changed =
          true;

      }

      /*
       * Correct old In Transit records.
       *
       * The destination is NOT the current
       * office until the receiving office
       * actually receives the document.
       */
      if (
        document.status ===
          'In transit' &&
        Array.isArray(
          document.history
        ) &&
        document.history.length
      ) {

        const last =
          latestHistory(
            document
          );

        if (
          last?.action ===
            'Document forwarded' &&
          last.from
        ) {

          if (
            document.currentOffice !==
            last.from
          ) {

            document.currentOffice =
              last.from;

            changed =
              true;

          }

          if (
            document.destination !==
            last.to &&
            last.to
          ) {

            document.destination =
              last.to;

            changed =
              true;

          }

        }

      }

      if (
        !document.currentOffice
      ) {

        const last =
          latestHistory(
            document
          );

        document.currentOffice =
          last?.to ||
          document.destination ||
          document.origin ||
          '';

        changed =
          true;

      }

      if (
        document.status ===
          'For approval' ||
        document.status ===
          'For action' ||
        document.status ===
          'For review' ||
        document.status ===
          'For information'
      ) {

        document.status =
          'Awaiting action';

        changed =
          true;

      }

    }
  );

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

  /*
   * Scan workflow history and create
   * persistent notifications.
   */
  syncWorkflowNotifications();

  prepareModalLayering();

  updateUserInterface();

  renderDashboard();

  setupDocumentRegistration();

  setupPdfUpload();

  setupReviewModal();

  setupSearch();

  setupNavigation();

  setupWorkflowShortcuts();

  /*
   * Refresh when returning to the page.
   */
  document.addEventListener(
    'visibilitychange',
    function () {

      if (
        document.visibilityState ===
        'visible'
      ) {

        syncWorkflowNotifications();

        renderDashboard();

      }

    }
  );

  /*
   * Listen for localStorage changes from
   * another KSUCflow tab.
   */
  window.addEventListener(
    'storage',
    function (event) {

      if (
        event.key ===
          DOCUMENTS_KEY ||
        event.key ===
          NOTIFICATIONS_KEY
      ) {

        syncWorkflowNotifications();

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
