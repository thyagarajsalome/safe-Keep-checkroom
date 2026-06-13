/**
 * SafeKeep Checkroom — Convention Bag & Lunch Token System
 * Main Controller File
 * Local-First, Offline PWA, Vanilla JS
 */

// ==========================================
// STATE MANAGEMENT & DEFAULTS
// ==========================================

const DEFAULT_SETTINGS = {
  conventionName: "2026 'Declare the Good News!' Regional Convention",
  conventionSubtitle: "Checkroom Department — Assembly Hall",
  activeDay: "F",       // F = Friday, S = Saturday, U = Sunday
  activeSession: "1",   // 1 = Morning/Afternoon, 2 = Afternoon/Evening
  theme: "dark",
  tokenFormat: "sequential", // "sequential" = 004, "prefix" = F1-004
  securityEnabled: false,
  overseerName: "",
  overseerMobile: ""
};

const DEFAULT_COUNTERS = {
  "F1": 0, "F2": 0,
  "S1": 0, "S2": 0,
  "U1": 0, "U2": 0
};

// Global App State
let state = {
  settings: { ...DEFAULT_SETTINGS },
  counters: { ...DEFAULT_COUNTERS },
  items: []
};

// Security Session Lock state
let isSettingsUnlocked = false;

// Quick References to DOM Elements
const DOM = {
  // Navigation & Views
  navTabs: document.querySelectorAll('.nav-tab'),
  viewPanels: document.querySelectorAll('.view-panel'),
  themeToggle: document.getElementById('theme-toggle'),
  quickSessionBadge: document.getElementById('quick-session-badge'),
  quickSessionText: document.getElementById('quick-session-text'),
  
  // Dashboard Elements
  conventionTitle: document.getElementById('convention-title-display'),
  conventionSubtitle: document.getElementById('convention-subtitle-display'),
  statsHeld: document.getElementById('stats-held'),
  statsReturned: document.getElementById('stats-returned'),
  statsTotal: document.getElementById('stats-total'),
  statsBreakdownCount: document.getElementById('stats-breakdown-count'),
  breakdownValLunch: document.getElementById('breakdown-val-lunch'),
  breakdownValBag: document.getElementById('breakdown-val-bag'),
  breakdownValLuggage: document.getElementById('breakdown-val-luggage'),
  breakdownValOther: document.getElementById('breakdown-val-other'),
  breakdownBarLunch: document.getElementById('breakdown-bar-lunch'),
  breakdownBarBag: document.getElementById('breakdown-bar-bag'),
  breakdownBarLuggage: document.getElementById('breakdown-bar-luggage'),
  breakdownBarOther: document.getElementById('breakdown-bar-other'),
  dashRecentActivity: document.getElementById('dashboard-recent-activity'),
  dashViewAllLogs: document.getElementById('dash-view-all-logs'),
  dashBtnCheckin: document.getElementById('dash-btn-checkin'),
  dashBtnCheckout: document.getElementById('dash-btn-checkout'),
  
  // Check-In Form Elements
  checkinForm: document.getElementById('checkin-form'),
  checkinTokenPreview: document.getElementById('checkin-token-preview'),
  itemTypeOptions: document.querySelectorAll('.item-type-option'),
  ownerNameInput: document.getElementById('owner-name-input'),
  notesInput: document.getElementById('notes-input'),
  quickNotePills: document.querySelectorAll('.quick-note-pill'),
  checkinBtnReset: document.getElementById('checkin-btn-reset'),
  
  // Check-Out Form Elements
  checkoutSearch: document.getElementById('checkout-search'),
  checkoutClearSearchBtn: document.getElementById('checkout-clear-search-btn'),
  checkoutSearchStatus: document.getElementById('checkout-search-status'),
  checkoutResultArea: document.querySelector('.checkout-result-area'),
  activeListCount: document.getElementById('active-list-count'),
  activeListFilter: document.getElementById('active-list-filter'),
  checkoutActiveGrid: document.getElementById('checkout-active-grid'),
  
  // History View Elements
  historySearch: document.getElementById('history-search'),
  historyFilterStatus: document.getElementById('history-filter-status'),
  historyFilterType: document.getElementById('history-filter-type'),
  historyFilterSession: document.getElementById('history-filter-session'),
  historyResultsCount: document.getElementById('history-results-count'),
  historyTableBody: document.getElementById('history-table-body'),
  historyBtnExportCsv: document.getElementById('history-btn-export-csv'),
  historyBtnExportJson: document.getElementById('history-btn-export-json'),
  
  // Settings View Elements
  settingsSessionForm: document.getElementById('settings-session-form'),
  settingsActiveDay: document.getElementById('settings-active-day'),
  settingsActiveSession: document.getElementById('settings-active-session'),
  settingsConventionForm: document.getElementById('settings-convention-form'),
  settingsConventionName: document.getElementById('settings-convention-name'),
  settingsConventionSubtitle: document.getElementById('settings-convention-subtitle'),
  settingsImportFile: document.getElementById('settings-import-file'),
  settingsBtnExportJson: document.getElementById('settings-btn-export-json'),
  settingsBtnResetCounters: document.getElementById('settings-btn-reset-counters'),
  settingsBtnClearDb: document.getElementById('settings-btn-clear-db'),
  settingsTokenFormat: document.getElementById('settings-token-format'),
  settingsSecurityForm: document.getElementById('settings-security-form'),
  settingsSecurityEnable: document.getElementById('settings-security-enable'),
  settingsOverseerName: document.getElementById('settings-overseer-name'),
  settingsOverseerMobile: document.getElementById('settings-overseer-mobile'),
  settingsBtnPrintManual: document.getElementById('settings-btn-print-manual'),
  printManualContainer: document.getElementById('print-manual-container'),
  manualTicketTemplate: document.getElementById('manual-ticket-template'),
  
  securityUnlockModal: document.getElementById('security-unlock-modal'),
  securityUnlockForm: document.getElementById('security-unlock-form'),
  securityUnlockMobile: document.getElementById('security-unlock-mobile'),
  securityUnlockBtnCancel: document.getElementById('security-unlock-btn-cancel'),
  
  // Popups & Modal Overlays
  tokenModal: document.getElementById('token-modal'),
  modalTokenNumber: document.getElementById('modal-token-number'),
  modalItemType: document.getElementById('modal-item-type'),
  modalOwnerName: document.getElementById('modal-owner-name'),
  modalNotes: document.getElementById('modal-notes'),
  modalDatetime: document.getElementById('modal-datetime'),
  modalBtnPrint: document.getElementById('modal-btn-print'),
  modalBtnClose: document.getElementById('modal-btn-close'),
  
  sessionSwitchModal: document.getElementById('session-switch-modal'),
  quickSessionForm: document.getElementById('quick-session-form'),
  quickActiveDay: document.getElementById('quick-active-day'),
  quickActiveSession: document.getElementById('quick-active-session'),
  quickSessionBtnClose: document.getElementById('quick-session-btn-close'),
  
  editItemModal: document.getElementById('edit-item-modal'),
  editItemForm: document.getElementById('edit-item-form'),
  editItemId: document.getElementById('edit-item-id'),
  editItemType: document.getElementById('edit-item-type'),
  editOwnerName: document.getElementById('edit-owner-name'),
  editNotes: document.getElementById('edit-notes'),
  editBtnCancel: document.getElementById('edit-btn-cancel'),
  editModalTokenLabel: document.getElementById('edit-modal-token-label'),
  
  toastContainer: document.getElementById('toast-container'),
  
  // Print Template Elements
  printConventionName: document.getElementById('print-convention-name'),
  printConventionSub: document.getElementById('print-convention-sub'),
  printToken: document.getElementById('print-token'),
  printType: document.getElementById('print-type'),
  printOwner: document.getElementById('print-owner'),
  printDesc: document.getElementById('print-desc'),
  printTime: document.getElementById('print-time')
};

// Cache current selected type for checkin
let selectedCheckinType = "Lunch Box";

// ==========================================
// UTILITY FUNCTIONS & HELPERS
// ==========================================

// Generate unique identifier for records
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Display toast notifications
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'danger') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon ${type}">${iconSvg}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Close message">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  DOM.toastContainer.appendChild(toast);

  // Close toast event
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 200);
  });

  // Auto-remove toast
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 200);
    }
  }, duration);
}

// Convert day code to string representation
function getDayName(dayCode) {
  switch (dayCode) {
    case 'F': return 'Friday';
    case 'S': return 'Saturday';
    case 'U': return 'Sunday';
    default: return dayCode;
  }
}

// Format timestamp into readable text
function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true };
  return date.toLocaleString('en-US', options);
}

function formatTimeOnly(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  return date.toLocaleString('en-US', options);
}

// ==========================================
// BUSINESS LOGIC
// ==========================================

// Load initial database and configuration
function initDatabase() {
  try {
    const savedSettings = localStorage.getItem('safekeep_settings');
    const savedCounters = localStorage.getItem('safekeep_counters');
    const savedItems = localStorage.getItem('safekeep_items');
    
    if (savedSettings) state.settings = JSON.parse(savedSettings);
    if (savedCounters) state.counters = JSON.parse(savedCounters);
    if (savedItems) state.items = JSON.parse(savedItems);
    
    // Auto-detect convention day from current time (Fri/Sat/Sun)
    if (!savedSettings) {
      const today = new Date().getDay();
      if (today === 5) state.settings.activeDay = "F";      // Fri
      else if (today === 6) state.settings.activeDay = "S"; // Sat
      else if (today === 0) state.settings.activeDay = "U"; // Sun
    }
    
    // Apply styling and settings to DOM
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');
    applySettingsToDOM();
    updateCheckinPreview();
    renderAll();
  } catch (error) {
    console.error("Database initialization failed:", error);
    showToast("Error loading saved database. Reverting to default settings.", "danger");
  }
}

// Persist data models
function saveSettings() {
  localStorage.setItem('safekeep_settings', JSON.stringify(state.settings));
}

function saveCounters() {
  localStorage.setItem('safekeep_counters', JSON.stringify(state.counters));
}

function saveItems() {
  localStorage.setItem('safekeep_items', JSON.stringify(state.items));
}

// Sync current state config to text labels
function applySettingsToDOM() {
  DOM.conventionTitle.textContent = state.settings.conventionName;
  DOM.conventionSubtitle.textContent = state.settings.conventionSubtitle;
  
  const currentDayStr = getDayName(state.settings.activeDay);
  DOM.quickSessionText.textContent = `${currentDayStr} — Session ${state.settings.activeSession}`;
  
  // Update inputs in settings form
  DOM.settingsActiveDay.value = state.settings.activeDay;
  DOM.settingsActiveSession.value = state.settings.activeSession;
  DOM.settingsConventionName.value = state.settings.conventionName;
  DOM.settingsConventionSubtitle.value = state.settings.conventionSubtitle;
  
  DOM.settingsTokenFormat.value = state.settings.tokenFormat || 'sequential';
  DOM.settingsSecurityEnable.checked = state.settings.securityEnabled || false;
  DOM.settingsOverseerName.value = state.settings.overseerName || '';
  DOM.settingsOverseerMobile.value = state.settings.overseerMobile || '';
  
  // Update quick switch modal form inputs
  DOM.quickActiveDay.value = state.settings.activeDay;
  DOM.quickActiveSession.value = state.settings.activeSession;
}

// Compute the token code that would be assigned next
function getNextTokenDetails() {
  const day = state.settings.activeDay;
  const session = state.settings.activeSession;
  const key = `${day}${session}`;
  
  const currentCount = state.counters[key] || 0;
  const nextCount = currentCount + 1;
  const paddedSequence = String(nextCount).padStart(3, '0');
  
  const format = state.settings.tokenFormat || 'sequential';
  const tokenString = format === 'sequential' ? paddedSequence : `${key}-${paddedSequence}`;
  
  return {
    tokenString: tokenString,
    sequence: nextCount,
    key: key
  };
}

function updateCheckinPreview() {
  const tokenDetails = getNextTokenDetails();
  DOM.checkinTokenPreview.textContent = tokenDetails.tokenString;
}

// Perform Check In Operation
function checkInItem(type, ownerName, notes) {
  const tokenDetails = getNextTokenDetails();
  const nextToken = tokenDetails.tokenString;
  
  const newItem = {
    id: generateUUID(),
    token: nextToken,
    day: state.settings.activeDay,
    session: parseInt(state.settings.activeSession),
    type: type,
    ownerName: ownerName.trim(),
    notes: notes.trim(),
    checkedInAt: new Date().toISOString(),
    checkedOutAt: null,
    status: "held",
    reCheckins: [],
    previousToken: null
  };
  
  // Save record
  state.items.push(newItem);
  // Increment counter
  state.counters[tokenDetails.key] = tokenDetails.sequence;
  
  saveItems();
  saveCounters();
  
  // Update DOM & Preview
  updateCheckinPreview();
  renderAll();
  
  // Display Large Token modal
  showTokenModal(newItem);
  showToast(`Successfully registered item ${nextToken}!`, "success");
}

// Perform Check Out Operation
function checkOutItem(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) {
    showToast("Error: Item record not found.", "danger");
    return;
  }
  
  item.checkedOutAt = new Date().toISOString();
  item.status = "returned";
  
  saveItems();
  renderAll();
  
  // Refresh Checkout Search Detail Card
  showCheckoutItemDetail(item);
  showToast(`Item ${item.token} has been returned to owner.`, "success");
}

// Execute Re-check-in linking logic
function triggerReCheckin(oldItemId) {
  const oldItem = state.items.find(i => i.id === oldItemId);
  if (!oldItem) return;
  
  // Select Check In Tab
  switchTab('checkin');
  
  // Pre-fill form
  selectedCheckinType = oldItem.type;
  DOM.itemTypeOptions.forEach(opt => {
    if (opt.getAttribute('data-type') === selectedCheckinType) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });
  
  DOM.ownerNameInput.value = oldItem.ownerName || '';
  
  // Prefill notes with a link hint
  let prefilledNotes = oldItem.notes || '';
  const matchTokenLabel = `[Prev Token: ${oldItem.token}]`;
  if (!prefilledNotes.includes(matchTokenLabel)) {
    prefilledNotes = prefilledNotes ? `${prefilledNotes} (Prev Token: ${oldItem.token})` : `Prev Token: ${oldItem.token}`;
  }
  DOM.notesInput.value = prefilledNotes;
  
  // Focus notes
  DOM.notesInput.focus();
  
  // Setup link context inside check-in submit listener
  DOM.checkinForm.dataset.linkingFrom = oldItem.id;
  
  showToast(`Prefilled check-in details from previous token ${oldItem.token}.`, "info");
}

// ==========================================
// RENDER & DRAW FUNCTIONS
// ==========================================

function renderAll() {
  renderStats();
  renderRecentActivity();
  renderCheckoutActiveGrid();
  renderHistoryTable();
}

// Calculate and render stats counters + type breakdowns
function renderStats() {
  const currentDay = state.settings.activeDay;
  const currentSession = parseInt(state.settings.activeSession);
  
  // Filters for active context stats
  const contextItems = state.items.filter(i => i.day === currentDay && i.session === currentSession);
  
  const heldItems = contextItems.filter(i => i.status === 'held');
  const returnedItems = contextItems.filter(i => i.status === 'returned');
  
  DOM.statsHeld.textContent = heldItems.length;
  DOM.statsReturned.textContent = returnedItems.length;
  DOM.statsTotal.textContent = contextItems.length;
  
  DOM.statsBreakdownCount.textContent = `${contextItems.length} Total Today`;
  DOM.activeListCount.textContent = heldItems.length;
  
  // Type counts
  const types = { 'Lunch Box': 0, 'Bag': 0, 'Luggage': 0, 'Other': 0 };
  contextItems.forEach(i => {
    if (types[i.type] !== undefined) {
      types[i.type]++;
    } else {
      types['Other']++;
    }
  });
  
  DOM.breakdownValLunch.textContent = types['Lunch Box'];
  DOM.breakdownValBag.textContent = types['Bag'];
  DOM.breakdownValLuggage.textContent = types['Luggage'];
  DOM.breakdownValOther.textContent = types['Other'];
  
  // Calculate percentages for meters
  const total = contextItems.length || 1; // avoid divide by zero
  DOM.breakdownBarLunch.style.width = `${(types['Lunch Box'] / total) * 100}%`;
  DOM.breakdownBarBag.style.width = `${(types['Bag'] / total) * 100}%`;
  DOM.breakdownBarLuggage.style.width = `${(types['Luggage'] / total) * 100}%`;
  DOM.breakdownBarOther.style.width = `${(types['Other'] / total) * 100}%`;
}

// Render recent actions log on dashboard
function renderRecentActivity() {
  const currentDay = state.settings.activeDay;
  const currentSession = parseInt(state.settings.activeSession);
  
  // Filter context items, sort by check-in / check-out timestamps descending
  const contextItems = state.items.filter(i => i.day === currentDay && i.session === currentSession);
  
  // Map actions
  const actions = [];
  contextItems.forEach(item => {
    actions.push({
      item: item,
      type: 'check-in',
      time: item.checkedInAt,
      title: `Checked In: ${item.token}`,
      desc: `${item.type} ${item.ownerName ? `(${item.ownerName})` : ''} - ${item.notes || 'No description'}`
    });
    if (item.checkedOutAt) {
      actions.push({
        item: item,
        type: 'check-out',
        time: item.checkedOutAt,
        title: `Returned: ${item.token}`,
        desc: `Handed back to owner.`
      });
    }
  });
  
  // Sort actions by time descending
  actions.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  // Show top 4
  const recent = actions.slice(0, 4);
  
  if (recent.length === 0) {
    DOM.dashRecentActivity.innerHTML = `
      <p class="empty-search-state" style="padding: 1.5rem; border: none;">No activity recorded in this session yet.</p>
    `;
    return;
  }
  
  DOM.dashRecentActivity.innerHTML = recent.map(act => {
    const isCheckin = act.type === 'check-in';
    const avatarClass = isCheckin ? 'check-in' : 'check-out';
    const avatarIcon = isCheckin ? '📥' : '📤';
    
    return `
      <div class="activity-item">
        <div class="activity-avatar ${avatarClass}">${avatarIcon}</div>
        <div class="activity-details">
          <div class="activity-title">${act.title}</div>
          <div class="activity-desc">${act.desc}</div>
        </div>
        <div class="activity-time">${formatTimeOnly(act.time)}</div>
      </div>
    `;
  }).join('');
}

// Render active items selection grid in checkout view
function renderCheckoutActiveGrid() {
  const currentDay = state.settings.activeDay;
  const currentSession = parseInt(state.settings.activeSession);
  
  // Filter active held items in the session context
  let activeItems = state.items.filter(i => i.day === currentDay && i.session === currentSession && i.status === 'held');
  
  // Apply quick mini filter if present
  const query = DOM.activeListFilter.value.trim().toLowerCase();
  if (query) {
    activeItems = activeItems.filter(i => 
      i.token.toLowerCase().includes(query) ||
      (i.ownerName && i.ownerName.toLowerCase().includes(query)) ||
      (i.notes && i.notes.toLowerCase().includes(query))
    );
  }
  
  if (activeItems.length === 0) {
    DOM.checkoutActiveGrid.innerHTML = `
      <p class="empty-search-state" style="grid-column: 1/-1; padding: 2rem;">No matching active items found.</p>
    `;
    return;
  }
  
  DOM.checkoutActiveGrid.innerHTML = activeItems.map(item => {
    const notesText = item.notes ? item.notes : 'No description';
    const ownerText = item.ownerName ? item.ownerName : 'Anonymous';
    
    return `
      <div class="held-item-mini-card" data-token="${item.token}">
        <div class="held-item-mini-header">
          <span class="held-item-mini-token">${item.token}</span>
          <span class="held-item-mini-type">${item.type}</span>
        </div>
        <div class="held-item-mini-name">${ownerText}</div>
        <div class="held-item-mini-notes">${notesText}</div>
      </div>
    `;
  }).join('');
  
  // Add quick select click handler
  DOM.checkoutActiveGrid.querySelectorAll('.held-item-mini-card').forEach(card => {
    card.addEventListener('click', () => {
      const token = card.getAttribute('data-token');
      DOM.checkoutSearch.value = token;
      searchAndDisplayToken(token);
    });
  });
}

// Render history list table with advanced query filters
function renderHistoryTable() {
  let filteredItems = [...state.items];
  
  // 1. Status Filter
  const statusFilter = DOM.historyFilterStatus.value;
  if (statusFilter !== 'all') {
    filteredItems = filteredItems.filter(i => i.status === statusFilter);
  }
  
  // 2. Type Filter
  const typeFilter = DOM.historyFilterType.value;
  if (typeFilter !== 'all') {
    filteredItems = filteredItems.filter(i => i.type === typeFilter);
  }
  
  // 3. Session Context Filter
  const sessionFilter = DOM.historyFilterSession.value;
  if (sessionFilter === 'current') {
    const currentDay = state.settings.activeDay;
    const currentSession = parseInt(state.settings.activeSession);
    filteredItems = filteredItems.filter(i => i.day === currentDay && i.session === currentSession);
  }
  
  // 4. Search text (token, name, description)
  const searchQuery = DOM.historySearch.value.trim().toLowerCase();
  if (searchQuery) {
    filteredItems = filteredItems.filter(i => 
      i.token.toLowerCase().includes(searchQuery) ||
      (i.ownerName && i.ownerName.toLowerCase().includes(searchQuery)) ||
      (i.notes && i.notes.toLowerCase().includes(searchQuery))
    );
  }
  
  // Sort items: Active first, then by check-in time descending
  filteredItems.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'held' ? -1 : 1; // held comes first
    }
    return new Date(b.checkedInAt) - new Date(a.checkedInAt);
  });
  
  DOM.historyResultsCount.textContent = `Showing ${filteredItems.length} records`;
  
  if (filteredItems.length === 0) {
    DOM.historyTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-search-state" style="text-align: center; padding: 3rem;">No history matches found.</td>
      </tr>
    `;
    return;
  }
  
  DOM.historyTableBody.innerHTML = filteredItems.map(item => {
    const isHeld = item.status === 'held';
    const statusText = isHeld ? 'Held' : 'Returned';
    const statusBadgeClass = isHeld ? 'held' : 'returned';
    
    // Quick Actions buttons depending on item state
    const actionButtons = isHeld 
      ? `<button class="table-action-btn check-out-btn" data-id="${item.id}" title="Check Out / Hand back">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
         </button>`
      : `<button class="table-action-btn re-check-btn" data-id="${item.id}" title="Re-Check In (Repeat Cycle)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
         </button>`;
         
    return `
      <tr>
        <td style="font-weight: 800; color: var(--accent-primary); font-size: 1.05rem;">${item.token}</td>
        <td><span class="status-badge" style="background-color: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color);">${item.type}</span></td>
        <td style="font-weight: 600;">${item.ownerName || '<span style="color: var(--text-tertiary); font-style: italic;">Anonymous</span>'}</td>
        <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.notes || ''}">
          ${item.notes || '<span style="color: var(--text-tertiary); font-style: italic;">No description</span>'}
        </td>
        <td>${formatDateTime(item.checkedInAt)}</td>
        <td>${formatDateTime(item.checkedOutAt)}</td>
        <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
        <td>
          <div class="actions-cell">
            ${actionButtons}
            <button class="table-action-btn edit-btn" data-id="${item.id}" title="Edit details">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
            </button>
            <button class="table-action-btn delete-btn" data-id="${item.id}" title="Delete record" style="color: var(--danger);">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  // Bind events in history table
  DOM.historyTableBody.querySelectorAll('.check-out-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      checkOutItem(id);
    });
  });
  
  DOM.historyTableBody.querySelectorAll('.re-check-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      triggerReCheckin(id);
    });
  });
  
  DOM.historyTableBody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditModal(id);
    });
  });
  
  DOM.historyTableBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = state.items.find(i => i.id === id);
      if (confirm(`Are you sure you want to permanently DELETE the record for token ${item.token}?`)) {
        state.items = state.items.filter(i => i.id !== id);
        saveItems();
        renderAll();
        showToast(`Deleted record for token ${item.token}.`, "warning");
      }
    });
  });
}

// Search and Display Check-out Result
function searchAndDisplayToken(query) {
  let cleanQuery = query.trim().toUpperCase();
  if (!cleanQuery) {
    DOM.checkoutResultArea.innerHTML = `
      <div class="empty-search-state" id="checkout-search-status">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <h3>Ready for Token Search</h3>
        <p>Type a token number (e.g. <b>F1-001</b>) or select from the active items list below.</p>
      </div>
    `;
    return;
  }
  
  // If search is numeric and shorter than 3 digits, pad it (e.g. 4 -> 004) for quick checkouts
  if (/^\d+$/.test(cleanQuery)) {
    cleanQuery = cleanQuery.padStart(3, '0');
  }
  
  // Search items. Prioritize exact token matches first.
  let matches = state.items.filter(i => i.token.toUpperCase() === cleanQuery);
  
  if (matches.length === 0) {
    // Try loose search
    matches = state.items.filter(i => i.token.toUpperCase().includes(cleanQuery));
  }
  
  if (matches.length === 0) {
    DOM.checkoutResultArea.innerHTML = `
      <div class="empty-search-state" style="border-color: var(--danger);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--danger)">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>No Item Found</h3>
        <p>No token matches "<b>${query}</b>" in the system history. Check the spelling or search manually in the log.</p>
      </div>
    `;
    return;
  }
  
  if (matches.length === 1) {
    showCheckoutItemDetail(matches[0]);
  } else {
    // Multiple matches found (common with sequential numbers across sessions/days)
    // Sort matches: held items first, then by date descending
    matches.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'held' ? -1 : 1;
      }
      return new Date(b.checkedInAt) - new Date(a.checkedInAt);
    });
    
    DOM.checkoutResultArea.innerHTML = `
      <div class="empty-search-state" style="border-color: var(--accent-primary); text-align: left;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" style="margin: 0 auto 1rem auto; display: block; width: 3rem; height: 3rem;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 style="text-align: center; margin-bottom: 0.5rem; color: var(--text-primary);">Multiple Items Found (${matches.length})</h3>
        <p style="text-align: center; margin-bottom: 1.5rem; font-size: 0.85rem;">Select the correct item associated with token <b>${query}</b>:</p>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 280px; overflow-y: auto;">
          ${matches.map(item => {
            const isHeld = item.status === 'held';
            const statusLabel = isHeld ? 'Held (Active)' : 'Returned';
            const statusClass = isHeld ? 'held' : 'returned';
            const dayStr = getDayName(item.day);
            return `
              <div class="held-item-mini-card select-match-card" data-id="${item.id}" style="border-left: 4px solid ${isHeld ? 'var(--success)' : 'var(--text-tertiary)'}; margin-bottom: 2px;">
                <div class="held-item-mini-header">
                  <span class="held-item-mini-token" style="font-size: 1.15rem;">${item.token}</span>
                  <span class="status-badge ${statusClass}">${statusLabel} (${dayStr} S${item.session})</span>
                </div>
                <div class="held-item-mini-name">${item.ownerName || 'Anonymous'} — <span style="font-weight: normal; font-size: 0.8rem;">${item.type}</span></div>
                <div class="held-item-mini-notes" style="font-size: 0.75rem; color: var(--text-secondary);">${item.notes || 'No description notes'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    // Bind click events on the select match cards
    DOM.checkoutResultArea.querySelectorAll('.select-match-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = state.items.find(i => i.id === id);
        if (item) {
          showCheckoutItemDetail(item);
        }
      });
    });
  }
}

function showCheckoutItemDetail(item) {
  const isHeld = item.status === 'held';
  const statusBadgeText = isHeld ? 'Held (Active)' : 'Returned (Closed)';
  const statusClass = isHeld ? 'held' : 'returned';
  const cardBorderClass = isHeld ? '' : 'returned-state';
  
  let primaryActionBtn = '';
  if (isHeld) {
    primaryActionBtn = `
      <button class="btn btn-secondary" id="checkout-action-edit-btn" style="flex: 1; padding: 1rem; font-size: 1.05rem;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
        Edit details
      </button>
      <button class="btn btn-success" id="checkout-action-return-btn" style="flex: 2; padding: 1rem; font-size: 1.05rem;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Confirm Return
      </button>
    `;
  } else {
    primaryActionBtn = `
      <button class="btn btn-secondary" id="checkout-action-edit-btn" style="flex: 1; padding: 1rem; font-size: 1.05rem;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
        Edit details
      </button>
      <button class="btn btn-primary" id="checkout-action-recheck-btn" style="flex: 2; padding: 1rem; font-size: 1.05rem;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
        Re-Check In (New Token)
      </button>
    `;
  }
  
  DOM.checkoutResultArea.innerHTML = `
    <div class="item-detail-card ${cardBorderClass}">
      <div class="item-detail-header">
        <div class="item-detail-title">
          <span class="item-detail-token">${item.token}</span>
          <span class="status-badge ${statusClass}">${statusBadgeText}</span>
        </div>
        <button class="btn btn-secondary" id="checkout-action-print-btn" title="Print Token Slip" style="padding: 0.5rem 0.75rem;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print Slip
        </button>
      </div>
      
      <div class="item-detail-body">
        <div class="detail-info-block">
          <span class="detail-info-label">Item Category</span>
          <span class="detail-info-value">${item.type}</span>
        </div>
        <div class="detail-info-block">
          <span class="detail-info-label">Owner Name</span>
          <span class="detail-info-value ${item.ownerName ? '' : 'empty'}">${item.ownerName || 'Not recorded'}</span>
        </div>
        <div class="detail-info-block">
          <span class="detail-info-label">Check-In Time</span>
          <span class="detail-info-value">${formatDateTime(item.checkedInAt)}</span>
        </div>
        <div class="detail-info-block">
          <span class="detail-info-label">Check-Out Time</span>
          <span class="detail-info-value ${item.checkedOutAt ? '' : 'empty'}">${formatDateTime(item.checkedOutAt) || 'Not checked out yet'}</span>
        </div>
        <div class="detail-info-block" style="grid-column: 1/-1;">
          <span class="detail-info-label">Notes & Description</span>
          <span class="detail-info-value ${item.notes ? '' : 'empty'}">${item.notes || 'No description notes recorded'}</span>
        </div>
      </div>
      
      <div class="checkout-actions">
        ${primaryActionBtn}
      </div>
    </div>
  `;
  
  // Event listeners on details card actions
  const returnBtn = document.getElementById('checkout-action-return-btn');
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      checkOutItem(item.id);
    });
  }
  
  const recheckBtn = document.getElementById('checkout-action-recheck-btn');
  if (recheckBtn) {
    recheckBtn.addEventListener('click', () => {
      triggerReCheckin(item.id);
    });
  }
  
  const editBtn = document.getElementById('checkout-action-edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      openEditModal(item.id);
    });
  }
  
  const printBtn = document.getElementById('checkout-action-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      printTokenSlip(item);
    });
  }
}

// ==========================================
// POPUPS & PRINT SLIP TRIGGERS
// ==========================================

function showTokenModal(item) {
  DOM.modalTokenNumber.textContent = item.token;
  DOM.modalItemType.textContent = item.type;
  DOM.modalOwnerName.textContent = item.ownerName || '—';
  DOM.modalNotes.textContent = item.notes || '—';
  DOM.modalDatetime.textContent = formatDateTime(item.checkedInAt);
  
  // Set up print action for this item
  DOM.modalBtnPrint.onclick = () => {
    printTokenSlip(item);
  };
  
  DOM.tokenModal.style.display = 'flex';
}

function closeTokenModal() {
  DOM.tokenModal.style.display = 'none';
  // Return focus to owner input for fast workflow
  DOM.ownerNameInput.focus();
}

function printTokenSlip(item) {
  // Update print overlay contents
  DOM.printConventionName.textContent = state.settings.conventionName;
  DOM.printConventionSub.textContent = state.settings.conventionSubtitle;
  DOM.printToken.textContent = item.token;
  DOM.printType.textContent = item.type;
  DOM.printOwner.textContent = item.ownerName || '—';
  DOM.printDesc.textContent = item.notes || '—';
  DOM.printTime.textContent = formatDateTime(item.checkedInAt);
  
  // Trigger print dialog
  window.print();
}

// Edit Dialog Controller
function openEditModal(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  
  DOM.editItemId.value = item.id;
  DOM.editItemType.value = item.type;
  DOM.editOwnerName.value = item.ownerName || '';
  DOM.editNotes.value = item.notes || '';
  
  DOM.editModalTokenLabel.textContent = `Editing Token: ${item.token}`;
  DOM.editItemModal.style.display = 'flex';
}

function closeEditModal() {
  DOM.editItemModal.style.display = 'none';
}

// ==========================================
// TABS NAVIGATION CONTROLLER
// ==========================================

function switchTab(viewId) {
  // Check security restriction for Settings
  if (viewId === 'settings' && state.settings.securityEnabled && !isSettingsUnlocked) {
    // Show unlock modal instead
    DOM.securityUnlockMobile.value = '';
    DOM.securityUnlockModal.style.display = 'flex';
    DOM.securityUnlockMobile.focus();
    return; // Block navigation
  }

  // If navigating away from Settings, lock it again
  if (viewId !== 'settings') {
    isSettingsUnlocked = false;
  }

  DOM.navTabs.forEach(tab => {
    if (tab.getAttribute('data-view') === viewId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  DOM.viewPanels.forEach(panel => {
    if (panel.id === `${viewId}-view`) {
      panel.classList.add('active');
      
      // Auto-focus inputs on specific tabs for fast layout workflow
      if (viewId === 'checkout') {
        DOM.checkoutSearch.focus();
        // Clear result block if empty search
        searchAndDisplayToken(DOM.checkoutSearch.value);
      } else if (viewId === 'checkin') {
        DOM.ownerNameInput.focus();
      }
    } else {
      panel.classList.remove('active');
    }
  });
}

// ==========================================
// IMPORT & EXPORT EXCEL/JSON
// ==========================================

function exportCSV() {
  if (state.items.length === 0) {
    showToast("No records available to export.", "warning");
    return;
  }
  
  // CSV Headers
  let csvContent = "Token,Status,Type,Owner Name,Notes,Check In Time,Check Out Time,Day Code,Session\n";
  
  state.items.forEach(item => {
    const esc = (text) => {
      if (!text) return "";
      const cleaned = text.replace(/"/g, '""');
      return `"${cleaned}"`;
    };
    
    const token = esc(item.token);
    const status = esc(item.status);
    const type = esc(item.type);
    const name = esc(item.ownerName);
    const notes = esc(item.notes);
    const checkin = esc(item.checkedInAt);
    const checkout = esc(item.checkedOutAt);
    const day = esc(item.day);
    const session = esc(String(item.session));
    
    csvContent += `${token},${status},${type},${name},${notes},${checkin},${checkout},${day},${session}\n`;
  });
  
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  
  // Format filename with convention name and timestamp
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanTitle = state.settings.conventionName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute("download", `safekeep_log_${cleanTitle}_${dateStr}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("CSV Log exported successfully!", "success");
}

function exportJSONBackup() {
  const dataStr = JSON.stringify({
    version: "1.0",
    source: "SafeKeep Checkroom",
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    counters: state.counters,
    items: state.items
  }, null, 2);
  
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanTitle = state.settings.conventionName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute("download", `safekeep_backup_${cleanTitle}_${dateStr}.json`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("JSON Database backup exported successfully!", "success");
}

function importJSONBackup(fileEvent) {
  const file = fileEvent.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Simple verification
      if (!importedData.items || !importedData.counters) {
        showToast("Invalid backup file. Missing items or counters keys.", "danger");
        return;
      }
      
      if (confirm("Importing backup will merge or overwrite current records. Proceed?")) {
        // Merge or Overwrite - let's replace but keep current themes if not defined
        state.items = importedData.items || [];
        state.counters = { ...DEFAULT_COUNTERS, ...(importedData.counters || {}) };
        if (importedData.settings) {
          state.settings = { ...state.settings, ...importedData.settings };
        }
        
        saveItems();
        saveCounters();
        saveSettings();
        
        applySettingsToDOM();
        updateCheckinPreview();
        renderAll();
        
        showToast("Database successfully restored from backup!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Error reading file. Make sure it is a valid JSON backup.", "danger");
    }
    // Reset file input value to allow re-triggering same file
    DOM.settingsImportFile.value = '';
  };
  reader.readAsText(file);
}

// ==========================================
// EVENT LISTENERS & SETUP
// ==========================================

function setupEventListeners() {
  
  // Tab selector links
  DOM.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewId = tab.getAttribute('data-view');
      switchTab(viewId);
    });
  });
  
  // Dashboard Action buttons
  DOM.dashBtnCheckin.addEventListener('click', () => switchTab('checkin'));
  DOM.dashBtnCheckout.addEventListener('click', () => switchTab('checkout'));
  DOM.dashViewAllLogs.addEventListener('click', () => {
    // Switch to logs and reset search criteria to see all
    DOM.historyFilterStatus.value = 'all';
    DOM.historyFilterSession.value = 'all';
    switchTab('history');
    renderHistoryTable();
  });
  
  // Theme Toggle Button
  DOM.themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    state.settings.theme = newTheme;
    saveSettings();
    showToast(`Switched to ${newTheme} mode.`, "info", 1500);
  });
  
  // Session Quick Badge Modal Trigger
  DOM.quickSessionBadge.addEventListener('click', () => {
    DOM.quickSessionModal();
  });
  
  DOM.quickSessionModal = function() {
    DOM.quickActiveDay.value = state.settings.activeDay;
    DOM.quickActiveSession.value = state.settings.activeSession;
    DOM.sessionSwitchModal.style.display = 'flex';
  };
  
  DOM.quickSessionBtnClose.addEventListener('click', () => {
    DOM.sessionSwitchModal.style.display = 'none';
  });
  
  DOM.quickSessionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings.activeDay = DOM.quickActiveDay.value;
    state.settings.activeSession = DOM.quickActiveSession.value;
    saveSettings();
    applySettingsToDOM();
    updateCheckinPreview();
    renderAll();
    DOM.sessionSwitchModal.style.display = 'none';
    showToast("Session context updated.", "success");
  });
  
  // Check-In Form Selected Categories Choices
  DOM.itemTypeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      DOM.itemTypeOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedCheckinType = opt.getAttribute('data-type');
    });
  });
  
  // Check-In Quick Pills Fillers
  DOM.quickNotePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const textToAppend = pill.getAttribute('data-text');
      const currentVal = DOM.notesInput.value.trim();
      
      if (currentVal) {
        // Append with comma if not already there
        if (!currentVal.toLowerCase().includes(textToAppend.toLowerCase())) {
          DOM.notesInput.value = `${currentVal}, ${textToAppend}`;
        }
      } else {
        DOM.notesInput.value = textToAppend;
      }
      
      DOM.notesInput.focus();
    });
  });
  
  // Reset Form Check In
  DOM.checkinBtnReset.addEventListener('click', () => {
    DOM.checkinForm.reset();
    DOM.checkinForm.dataset.linkingFrom = '';
    // reset selection to default
    DOM.itemTypeOptions.forEach(o => o.classList.remove('selected'));
    DOM.itemTypeOptions[0].classList.add('selected');
    selectedCheckinType = "Lunch Box";
    updateCheckinPreview();
  });
  
  // Check-In Submission handler
  DOM.checkinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const ownerName = DOM.ownerNameInput.value;
    const notes = DOM.notesInput.value;
    
    // Perform registration
    checkInItem(selectedCheckinType, ownerName, notes);
    
    // If we were linking from another item, store back link
    const linkingFromId = DOM.checkinForm.dataset.linkingFrom;
    if (linkingFromId) {
      const parentItem = state.items.find(i => i.id === linkingFromId);
      const newlyCreatedItem = state.items[state.items.length - 1];
      
      if (parentItem && newlyCreatedItem) {
        // Link them (with array safety check for older records)
        if (!parentItem.reCheckins) parentItem.reCheckins = [];
        parentItem.reCheckins.push(newlyCreatedItem.token);
        newlyCreatedItem.previousToken = parentItem.token;
        saveItems();
        renderAll();
      }
      DOM.checkinForm.dataset.linkingFrom = '';
    }
    
    // Reset Form fields
    DOM.ownerNameInput.value = '';
    DOM.notesInput.value = '';
  });
  
  // Modal Dialogue close
  DOM.modalBtnClose.addEventListener('click', () => {
    closeTokenModal();
  });
  
  // Check-Out live query listener
  DOM.checkoutSearch.addEventListener('input', (e) => {
    searchAndDisplayToken(e.target.value);
  });
  
  DOM.checkoutClearSearchBtn.addEventListener('click', () => {
    DOM.checkoutSearch.value = '';
    searchAndDisplayToken('');
    DOM.checkoutSearch.focus();
  });
  
  // Check-Out Active Filter input
  DOM.activeListFilter.addEventListener('input', () => {
    renderCheckoutActiveGrid();
  });
  
  // History View Filter actions
  DOM.historySearch.addEventListener('input', () => renderHistoryTable());
  DOM.historyFilterStatus.addEventListener('change', () => renderHistoryTable());
  DOM.historyFilterType.addEventListener('change', () => renderHistoryTable());
  DOM.historyFilterSession.addEventListener('change', () => renderHistoryTable());
  
  // Export Click Events
  DOM.historyBtnExportCsv.addEventListener('click', () => exportCSV());
  DOM.historyBtnExportJson.addEventListener('click', () => exportJSONBackup());
  DOM.settingsBtnExportJson.addEventListener('click', () => exportJSONBackup());
  
  // Settings Session submit
  DOM.settingsSessionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings.activeDay = DOM.settingsActiveDay.value;
    state.settings.activeSession = DOM.settingsActiveSession.value;
    state.settings.tokenFormat = DOM.settingsTokenFormat.value;
    saveSettings();
    applySettingsToDOM();
    updateCheckinPreview();
    renderAll();
    showToast("Active session and token format settings saved.", "success");
  });
  
  // Settings Branding update
  DOM.settingsConventionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings.conventionName = DOM.settingsConventionName.value.trim();
    state.settings.conventionSubtitle = DOM.settingsConventionSubtitle.value.trim();
    saveSettings();
    applySettingsToDOM();
    showToast("Convention branding details updated.", "success");
  });
  
  // Settings Database actions
  DOM.settingsImportFile.addEventListener('change', (e) => importJSONBackup(e));
  
  DOM.settingsBtnResetCounters.addEventListener('click', () => {
    if (confirm("WARNING: This will reset token sequence numbers for all days/sessions to 0. Historical item records WILL NOT be deleted. Proceed?")) {
      state.counters = { ...DEFAULT_COUNTERS };
      saveCounters();
      updateCheckinPreview();
      showToast("Token counters successfully reset to 0.", "warning");
    }
  });
  
  DOM.settingsBtnClearDb.addEventListener('click', () => {
    const confirmationWord = "RESET";
    const userPrompt = prompt(`DANGER: This will permanently wipe ALL settings, counters, and history records from local storage. Type "${confirmationWord}" below to confirm full factory reset:`);
    
    if (userPrompt === confirmationWord) {
      localStorage.removeItem('safekeep_settings');
      localStorage.removeItem('safekeep_counters');
      localStorage.removeItem('safekeep_items');
      
      state.settings = { ...DEFAULT_SETTINGS };
      state.counters = { ...DEFAULT_COUNTERS };
      state.items = [];
      
      document.documentElement.setAttribute('data-theme', 'dark');
      applySettingsToDOM();
      updateCheckinPreview();
      renderAll();
      
      showToast("Database successfully wiped. Application reset to defaults.", "danger");
    } else if (userPrompt !== null) {
      showToast("Incorrect confirmation phrase. Reset canceled.", "info");
    }
  });
  
  // Edit form cancel and submit listeners
  DOM.editBtnCancel.addEventListener('click', () => closeEditModal());
  DOM.editItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = DOM.editItemId.value;
    const item = state.items.find(i => i.id === id);
    
    if (item) {
      item.type = DOM.editItemType.value;
      item.ownerName = DOM.editOwnerName.value.trim();
      item.notes = DOM.editNotes.value.trim();
      
      saveItems();
      renderAll();
      
      // If the edited item is currently loaded in checkout view search, update details card
      if (DOM.checkoutSearch.value.toUpperCase() === item.token.toUpperCase()) {
        showCheckoutItemDetail(item);
      }
      
      closeEditModal();
      showToast(`Successfully updated details for ${item.token}.`, "success");
    }
  });
  
  // Settings Security form submit
  DOM.settingsSecurityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enable = DOM.settingsSecurityEnable.checked;
    const name = DOM.settingsOverseerName.value.trim();
    const mobile = DOM.settingsOverseerMobile.value.trim();
    
    if (enable && (!name || !mobile)) {
      showToast("To enable gatekeeper security, Overseer Name and Mobile Number are required.", "warning");
      return;
    }
    
    state.settings.securityEnabled = enable;
    state.settings.overseerName = name;
    state.settings.overseerMobile = mobile;
    saveSettings();
    applySettingsToDOM();
    showToast("Overseer Security settings saved.", "success");
  });
  
  // Security Unlock Form submit
  DOM.securityUnlockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredCode = DOM.securityUnlockMobile.value.trim();
    const storedCode = state.settings.overseerMobile || '';
    
    if (enteredCode === storedCode) {
      isSettingsUnlocked = true;
      DOM.securityUnlockModal.style.display = 'none';
      showToast("Access granted. Welcome, Overseer!", "success");
      switchTab('settings'); // Navigate to settings now that it is unlocked
    } else {
      showToast("Verification failed. Incorrect Overseer mobile number.", "danger");
      DOM.securityUnlockMobile.value = '';
      DOM.securityUnlockMobile.focus();
    }
  });
  
  // Security Unlock cancel
  DOM.securityUnlockBtnCancel.addEventListener('click', () => {
    DOM.securityUnlockModal.style.display = 'none';
    showToast("Access denied. Returning to dashboard.", "info");
    switchTab('dashboard');
  });
  
  // Emergency Manual Tickets printing trigger
  DOM.settingsBtnPrintManual.addEventListener('click', () => {
    // Enable print manual mode on body
    document.body.classList.add('print-manual-mode');
    
    // Clear and build the print manual page
    const pageWrapper = DOM.printManualContainer.querySelector('.manual-tickets-page');
    pageWrapper.innerHTML = '';
    
    // Create 4 tickets using the template
    for (let i = 0; i < 4; i++) {
      const clone = DOM.manualTicketTemplate.content.cloneNode(true);
      pageWrapper.appendChild(clone);
    }
    
    // Trigger print dialog
    window.print();
  });

  // Handle cleaning up print manual mode classes after printing
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-manual-mode');
  });
}

// ==========================================
// BOOTSTRAP INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  setupEventListeners();
  showToast("SafeKeep ready for offline operations.", "info", 2000);
  
  // Register Service Worker for offline PWA capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered successfully:', reg.scope))
        .catch(err => console.error('Service Worker registration failed:', err));
    });
  }
});
