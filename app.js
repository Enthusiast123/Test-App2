/**
 * GuestPulse: RSVP & Guest-List Tracker
 * Pure Vanilla JavaScript with LocalStorage Persistence
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    GUESTS: 'guestpulse_guests_v1',
    EVENT: 'guestpulse_event_v1'
  };

  // Default Event Details
  const DEFAULT_EVENT = {
    name: 'Annual Gala & Celebration',
    date: 'Saturday, Dec 12, 2026',
    time: '6:30 PM - 11:30 PM',
    venue: 'The Grand Ballroom, 450 Lexington Ave',
    capacity: 150,
    type: 'Official Event'
  };

  // Sample Demo Guests
  const SAMPLE_GUESTS = [
    {
      id: 'demo-1',
      name: 'Eleanor Vance',
      email: 'eleanor.v@example.com',
      phone: '+1 (555) 234-5678',
      group: 'VIP',
      status: 'attending',
      plusOnes: 1,
      plusOneNames: 'Marcus Vance',
      table: 'Table 1 (VIP)',
      dietary: ['Vegetarian', 'Gluten-Free'],
      notes: 'Close to the stage preferred. Celebrating 10th anniversary.',
      checkedIn: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'demo-2',
      name: 'Julian Sterling',
      email: 'jsterling@firm.org',
      phone: '+1 (555) 876-5432',
      group: 'Colleagues',
      status: 'attending',
      plusOnes: 0,
      plusOneNames: '',
      table: 'Table 3',
      dietary: ['Halal'],
      notes: 'Will arrive around 7:15 PM.',
      checkedIn: true,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'demo-3',
      name: 'Sophia Martinez',
      email: 'sophia.m@studio.com',
      phone: '+1 (555) 432-1098',
      group: 'Wedding Party',
      status: 'attending',
      plusOnes: 2,
      plusOneNames: 'Mateo & Lucas Martinez',
      table: 'Table 2',
      dietary: ['Nut Allergy'],
      notes: 'Severe peanut allergy alert for child Lucas.',
      checkedIn: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'demo-4',
      name: 'Dr. Arthur Pendelton',
      email: 'pendelton.a@hospital.org',
      phone: '+1 (555) 765-4321',
      group: 'Family',
      status: 'pending',
      plusOnes: 1,
      plusOneNames: '',
      table: 'Table 4',
      dietary: [],
      notes: 'Checking hospital on-call schedule before final confirmation.',
      checkedIn: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'demo-5',
      name: 'Clara Oswald',
      email: 'clara.o@traveler.co',
      phone: '+1 (555) 345-6789',
      group: 'Friends',
      status: 'attending',
      plusOnes: 0,
      plusOneNames: '',
      table: 'Table 2',
      dietary: ['Vegan', 'Dairy-Free'],
      notes: 'Looking forward to the dessert bar!',
      checkedIn: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'demo-6',
      name: 'Benjamin Hayes',
      email: 'ben.hayes@ventures.io',
      phone: '+1 (555) 987-6543',
      group: 'Colleagues',
      status: 'declined',
      plusOnes: 0,
      plusOneNames: '',
      table: '',
      dietary: [],
      notes: 'Out of the country on business trip. Warmest congratulations!',
      checkedIn: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'demo-7',
      name: 'Beatrice Montgomery',
      email: 'beatrice@heritage.net',
      phone: '+1 (555) 543-2109',
      group: 'Family',
      status: 'attending',
      plusOnes: 1,
      plusOneNames: 'Harrison Montgomery',
      table: 'Table 1 (VIP)',
      dietary: ['Shellfish Allergy'],
      notes: 'Needs wheelchair accessible entryway.',
      checkedIn: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'demo-8',
      name: 'Lucas Dupont',
      email: 'lucas@techlabs.fr',
      phone: '+1 (555) 654-9870',
      group: 'Friends',
      status: 'pending',
      plusOnes: 0,
      plusOneNames: '',
      table: 'Table 3',
      dietary: [],
      notes: '',
      checkedIn: false,
      createdAt: new Date().toISOString()
    }
  ];

  // App State
  let eventData = { ...DEFAULT_EVENT };
  let guests = [];
  let selectedGuestIds = new Set();
  let currentEditingGuestId = null;

  // DOM Elements Cache
  const DOM = {
    // Event Banner
    displayEventName: document.getElementById('display-event-name'),
    displayEventDate: document.getElementById('display-event-date'),
    displayEventTime: document.getElementById('display-event-time'),
    displayEventVenue: document.getElementById('display-event-venue'),
    eventTypeBadge: document.getElementById('event-type-badge'),
    btnEditEvent: document.getElementById('btn-edit-event'),

    // Capacity Gauge
    displayConfirmedHeadcount: document.getElementById('display-confirmed-headcount'),
    displayVenueCapacity: document.getElementById('display-venue-capacity'),
    capacityProgressFill: document.getElementById('capacity-progress-fill'),
    capacityPercentText: document.getElementById('capacity-percent-text'),
    capacityRemainingText: document.getElementById('capacity-remaining-text'),

    // Stats
    statTotalInvited: document.getElementById('stat-total-invited'),
    statTotalHeadcount: document.getElementById('stat-total-headcount'),
    statAttendingCount: document.getElementById('stat-attending-count'),
    statAttendingHeadcount: document.getElementById('stat-attending-headcount'),
    statPendingCount: document.getElementById('stat-pending-count'),
    statPendingRate: document.getElementById('stat-pending-rate'),
    statDeclinedCount: document.getElementById('stat-declined-count'),
    statCheckedInCount: document.getElementById('stat-checked-in-count'),
    statCheckedInRate: document.getElementById('stat-checked-in-rate'),

    // Tabs
    tabBtnGuestlist: document.getElementById('tab-btn-guestlist'),
    tabBtnSeating: document.getElementById('tab-btn-seating'),
    tabBtnDietary: document.getElementById('tab-btn-dietary'),
    tabContentGuestlist: document.getElementById('tab-content-guestlist'),
    tabContentSeating: document.getElementById('tab-content-seating'),
    tabContentDietary: document.getElementById('tab-content-dietary'),
    tabCountGuests: document.getElementById('tab-count-guests'),
    tabCountDietary: document.getElementById('tab-count-dietary'),

    // Quick Actions
    btnLoadDemo: document.getElementById('btn-load-demo'),
    btnPrintList: document.getElementById('btn-print-list'),
    btnClearAll: document.getElementById('btn-clear-all'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    csvFileInput: document.getElementById('csv-file-input'),
    btnAddGuestModal: document.getElementById('btn-add-guest-modal'),
    btnOpenRsvpPortal: document.getElementById('btn-open-rsvp-portal'),

    // Filters
    filterSearch: document.getElementById('filter-search'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    filterStatus: document.getElementById('filter-status'),
    filterGroup: document.getElementById('filter-group'),
    filterCheckin: document.getElementById('filter-checkin'),
    filterDietary: document.getElementById('filter-dietary'),
    filterSort: document.getElementById('filter-sort'),

    // Table & Selection
    selectAllCheckbox: document.getElementById('select-all-checkbox'),
    bulkActionsBanner: document.getElementById('bulk-actions-banner'),
    selectedGuestsCount: document.getElementById('selected-guests-count'),
    btnBulkAttending: document.getElementById('btn-bulk-attending'),
    btnBulkDeclined: document.getElementById('btn-bulk-declined'),
    btnBulkCheckin: document.getElementById('btn-bulk-checkin'),
    btnBulkDelete: document.getElementById('btn-bulk-delete'),
    btnBulkCancel: document.getElementById('btn-bulk-cancel'),
    guestsTableBody: document.getElementById('guests-table-body'),
    emptyState: document.getElementById('empty-state'),
    emptyTitle: document.getElementById('empty-title'),
    emptyMessage: document.getElementById('empty-message'),
    btnEmptyAddGuest: document.getElementById('btn-empty-add-guest'),
    btnEmptyLoadDemo: document.getElementById('btn-empty-load-demo'),
    footerShowingText: document.getElementById('footer-showing-text'),

    // Seating & Dietary View
    seatingGrid: document.getElementById('seating-grid'),
    dietaryStatsCards: document.getElementById('dietary-stats-cards'),
    dietaryTableBody: document.getElementById('dietary-table-body'),
    btnPrintCatering: document.getElementById('btn-print-catering'),

    // Guest Modal
    modalGuestForm: document.getElementById('modal-guest-form'),
    guestModalTitle: document.getElementById('guest-modal-title'),
    btnCloseGuestModal: document.getElementById('btn-close-guest-modal'),
    btnCancelGuestForm: document.getElementById('btn-cancel-guest-form'),
    guestForm: document.getElementById('guest-form'),
    guestId: document.getElementById('guest-id'),
    formName: document.getElementById('form-name'),
    formGroupSelect: document.getElementById('form-group-select'),
    formEmail: document.getElementById('form-email'),
    formPhone: document.getElementById('form-phone'),
    formRsvpStatus: document.getElementById('form-rsvp-status'),
    formPlusOnes: document.getElementById('form-plus-ones'),
    formTable: document.getElementById('form-table'),
    plusOnesNamesContainer: document.getElementById('plus-ones-names-container'),
    formPlusOneNames: document.getElementById('form-plus-one-names'),
    formNotes: document.getElementById('form-notes'),
    formCheckedIn: document.getElementById('form-checked-in'),
    errorName: document.getElementById('error-name'),

    // Event Modal
    modalEventDetails: document.getElementById('modal-event-details'),
    btnCloseEventModal: document.getElementById('btn-close-event-modal'),
    btnCancelEventModal: document.getElementById('btn-cancel-event-modal'),
    eventForm: document.getElementById('event-form'),
    eventInputName: document.getElementById('event-input-name'),
    eventInputDate: document.getElementById('event-input-date'),
    eventInputTime: document.getElementById('event-input-time'),
    eventInputVenue: document.getElementById('event-input-venue'),
    eventInputCapacity: document.getElementById('event-input-capacity'),
    eventInputType: document.getElementById('event-input-type'),

    // RSVP Portal Modal
    modalRsvpPortal: document.getElementById('modal-rsvp-portal'),
    btnClosePortalModal: document.getElementById('btn-close-portal-modal'),
    portalEventName: document.getElementById('portal-event-name'),
    portalEventMeta: document.getElementById('portal-event-meta'),
    portalGuestSelect: document.getElementById('portal-guest-select'),
    portalRsvpForm: document.getElementById('portal-rsvp-form'),
    portalActiveGuestName: document.getElementById('portal-active-guest-name'),
    portalAttendingDetails: document.getElementById('portal-attending-details'),
    portalPlusOnes: document.getElementById('portal-plus-ones'),
    portalDietary: document.getElementById('portal-dietary'),
    portalNote: document.getElementById('portal-note'),
    portalSuccessCard: document.getElementById('portal-success-card'),
    portalSuccessText: document.getElementById('portal-success-text'),
    btnPortalAnother: document.getElementById('btn-portal-another'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // ==========================================================================
  // Storage & Initialization
  // ==========================================================================

  function loadData() {
    try {
      const storedEvent = localStorage.getItem(STORAGE_KEYS.EVENT);
      if (storedEvent) {
        eventData = Object.assign({}, DEFAULT_EVENT, JSON.parse(storedEvent));
      }

      const storedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
      if (storedGuests) {
        guests = JSON.parse(storedGuests);
      } else {
        // First time load: provide sample demo guests so user sees rich experience
        guests = JSON.parse(JSON.stringify(SAMPLE_GUESTS));
        saveGuests();
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      guests = JSON.parse(JSON.stringify(SAMPLE_GUESTS));
    }
  }

  function saveGuests() {
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
    } catch (e) {
      console.error('Failed to save guests to localStorage', e);
      showToast('Could not save data: LocalStorage quota exceeded', 'danger');
    }
  }

  function saveEvent() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENT, JSON.stringify(eventData));
    } catch (e) {
      console.error('Failed to save event to localStorage', e);
    }
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3200);
  }

  // ==========================================================================
  // Render & Calculation Engine
  // ==========================================================================

  function renderAll() {
    renderEventHeader();
    renderStats();
    renderGuestDirectory();
    renderSeatingView();
    renderDietaryView();
    populatePortalGuestList();
  }

  function renderEventHeader() {
    DOM.displayEventName.textContent = eventData.name || 'Untitled Event';
    DOM.displayEventDate.textContent = eventData.date || 'TBD';
    DOM.displayEventTime.textContent = eventData.time || 'TBD';
    DOM.displayEventVenue.textContent = eventData.venue || 'TBD';
    DOM.eventTypeBadge.textContent = eventData.type || 'Official Event';
    DOM.displayVenueCapacity.textContent = eventData.capacity || 100;
  }

  function renderStats() {
    const totalInvitations = guests.length;
    let totalHeadcount = 0;
    let attendingInvitations = 0;
    let attendingHeadcount = 0;
    let pendingInvitations = 0;
    let declinedInvitations = 0;
    let checkedInInvitations = 0;
    let dietaryCount = 0;

    guests.forEach(g => {
      const partySize = 1 + (Number(g.plusOnes) || 0);
      totalHeadcount += partySize;

      if (g.status === 'attending') {
        attendingInvitations++;
        attendingHeadcount += partySize;
        if (g.checkedIn) checkedInInvitations++;
      } else if (g.status === 'declined') {
        declinedInvitations++;
      } else {
        pendingInvitations++;
      }

      if (g.dietary && g.dietary.length > 0) {
        dietaryCount++;
      }
    });

    // Update Counter texts
    DOM.statTotalInvited.textContent = totalInvitations;
    DOM.statTotalHeadcount.textContent = `(${totalHeadcount} total seats)`;
    DOM.statAttendingCount.textContent = attendingInvitations;
    DOM.statAttendingHeadcount.textContent = `(${attendingHeadcount} guests)`;
    DOM.statPendingCount.textContent = pendingInvitations;
    const pendingRate = totalInvitations > 0 ? Math.round((pendingInvitations / totalInvitations) * 100) : 0;
    DOM.statPendingRate.textContent = `${pendingRate}% pending`;
    DOM.statDeclinedCount.textContent = declinedInvitations;

    DOM.statCheckedInCount.textContent = checkedInInvitations;
    const checkedInRate = attendingInvitations > 0 ? Math.round((checkedInInvitations / attendingInvitations) * 100) : 0;
    DOM.statCheckedInRate.textContent = `${checkedInRate}% of attending`;

    // Capacity progress fill
    const maxCapacity = Number(eventData.capacity) || 100;
    DOM.displayConfirmedHeadcount.textContent = attendingHeadcount;
    const pct = Math.min(100, Math.round((attendingHeadcount / maxCapacity) * 100));
    DOM.capacityProgressFill.style.width = `${pct}%`;
    DOM.capacityPercentText.textContent = `${pct}% capacity filled`;

    const seatsLeft = maxCapacity - attendingHeadcount;
    if (seatsLeft >= 0) {
      DOM.capacityRemainingText.textContent = `${seatsLeft} seats remaining`;
    } else {
      DOM.capacityRemainingText.textContent = `${Math.abs(seatsLeft)} over capacity!`;
    }

    // Tab counters
    DOM.tabCountGuests.textContent = totalInvitations;
    DOM.tabCountDietary.textContent = dietaryCount;
  }

  // Filter & Sort Logic
  function getFilteredAndSortedGuests() {
    const search = DOM.filterSearch.value.trim().toLowerCase();
    const status = DOM.filterStatus.value;
    const group = DOM.filterGroup.value;
    const checkin = DOM.filterCheckin.value;
    const dietary = DOM.filterDietary.value;
    const sort = DOM.filterSort.value;

    return guests.filter(guest => {
      // Search
      if (search) {
        const matchesName = (guest.name || '').toLowerCase().includes(search);
        const matchesEmail = (guest.email || '').toLowerCase().includes(search);
        const matchesPhone = (guest.phone || '').toLowerCase().includes(search);
        const matchesTable = (guest.table || '').toLowerCase().includes(search);
        const matchesNotes = (guest.notes || '').toLowerCase().includes(search);
        const matchesPlus = (guest.plusOneNames || '').toLowerCase().includes(search);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesTable && !matchesNotes && !matchesPlus) {
          return false;
        }
      }

      // Status
      if (status !== 'ALL' && guest.status !== status) {
        return false;
      }

      // Group
      if (group !== 'ALL' && guest.group !== group) {
        return false;
      }

      // Checkin
      if (checkin === 'checked-in' && !guest.checkedIn) return false;
      if (checkin === 'not-checked-in' && guest.checkedIn) return false;

      // Dietary
      if (dietary === 'HAS_DIETARY' && (!guest.dietary || guest.dietary.length === 0)) {
        return false;
      }
      if (dietary !== 'ALL' && dietary !== 'HAS_DIETARY') {
        if (!guest.dietary || !guest.dietary.includes(dietary)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sort === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sort === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      } else if (sort === 'status-attending') {
        const order = { attending: 1, pending: 2, declined: 3 };
        return (order[a.status] || 9) - (order[b.status] || 9);
      } else if (sort === 'status-pending') {
        const order = { pending: 1, attending: 2, declined: 3 };
        return (order[a.status] || 9) - (order[b.status] || 9);
      } else if (sort === 'plus-desc') {
        return (Number(b.plusOnes) || 0) - (Number(a.plusOnes) || 0);
      } else if (sort === 'table-asc') {
        return (a.table || 'ZZZ').localeCompare(b.table || 'ZZZ');
      } else {
        // newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }

  function renderGuestDirectory() {
    const filteredGuests = getFilteredAndSortedGuests();
    DOM.guestsTableBody.innerHTML = '';

    // Show/Hide search clear button
    DOM.btnClearSearch.style.display = DOM.filterSearch.value.trim() ? 'block' : 'none';

    // Update Showing text
    DOM.footerShowingText.textContent = `Showing ${filteredGuests.length} of ${guests.length} guests`;

    if (filteredGuests.length === 0) {
      DOM.emptyState.style.display = 'block';
      if (guests.length === 0) {
        DOM.emptyTitle.textContent = 'Guest list is empty';
        DOM.emptyMessage.textContent = 'Add your first guest or load sample demo data to get started.';
        DOM.btnEmptyLoadDemo.style.display = 'inline-flex';
      } else {
        DOM.emptyTitle.textContent = 'No matching guests';
        DOM.emptyMessage.textContent = 'No guests match the current search filters or keywords.';
        DOM.btnEmptyLoadDemo.style.display = 'none';
      }
      DOM.selectAllCheckbox.checked = false;
      DOM.selectAllCheckbox.indeterminate = false;
      updateBulkActionBar();
      return;
    }

    DOM.emptyState.style.display = 'none';

    // Render table rows
    filteredGuests.forEach(guest => {
      const tr = document.createElement('tr');
      if (guest.checkedIn) tr.classList.add('row-checked-in');

      const isSelected = selectedGuestIds.has(guest.id);

      // Avatar Initial
      const initials = getInitials(guest.name);
      const avatarBg = getAvatarColor(guest.name);

      // RSVP Badge
      let statusBadge = '';
      if (guest.status === 'attending') {
        statusBadge = `<span class="badge badge-attending" title="Click to cycle status" data-cycle-id="${guest.id}" style="cursor: pointer;">✓ Attending</span>`;
      } else if (guest.status === 'declined') {
        statusBadge = `<span class="badge badge-declined" title="Click to cycle status" data-cycle-id="${guest.id}" style="cursor: pointer;">✕ Declined</span>`;
      } else {
        statusBadge = `<span class="badge badge-pending" title="Click to cycle status" data-cycle-id="${guest.id}" style="cursor: pointer;">⏳ Pending</span>`;
      }

      // Party badge
      const plusCount = Number(guest.plusOnes) || 0;
      let partyHtml = `<span class="badge badge-party">${plusCount > 0 ? `Party of ${1 + plusCount}` : '1 Guest'}</span>`;
      if (guest.plusOneNames) {
        partyHtml += `<div class="field-hint" style="font-size: 11px;">+ ${escapeHtml(guest.plusOneNames)}</div>`;
      }

      // Dietary tags
      let dietaryHtml = '<span style="color: #94a3b8; font-size: 12px;">None</span>';
      if (guest.dietary && guest.dietary.length > 0) {
        dietaryHtml = '<div class="dietary-tag-list">';
        guest.dietary.forEach(diet => {
          dietaryHtml += `<span class="dietary-tag">${escapeHtml(diet)}</span>`;
        });
        dietaryHtml += '</div>';
      }
      if (guest.notes) {
        dietaryHtml += `<div class="guest-note-excerpt" title="${escapeHtml(guest.notes)}">"${escapeHtml(guest.notes)}"</div>`;
      }

      // Check-in toggle
      const checkinClass = guest.checkedIn ? 'checkin-btn is-checked-in' : 'checkin-btn';
      const checkinText = guest.checkedIn ? '✓ In' : 'Check In';

      tr.innerHTML = `
        <td style="text-align: center;">
          <input type="checkbox" class="guest-checkbox" data-id="${guest.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td>
          <div class="guest-cell-profile">
            <div class="guest-avatar" style="background-color: ${avatarBg.bg}; color: ${avatarBg.text};">
              ${initials}
            </div>
            <div>
              <div class="guest-name-text">${escapeHtml(guest.name)}</div>
              <div class="guest-contact-text">
                ${guest.email ? `<span>✉ ${escapeHtml(guest.email)}</span>` : ''}
                ${guest.phone ? `<span>☎ ${escapeHtml(guest.phone)}</span>` : ''}
              </div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-group">${escapeHtml(guest.group || 'Other')}</span>
        </td>
        <td>
          ${statusBadge}
        </td>
        <td>
          ${partyHtml}
        </td>
        <td>
          <strong>${guest.table ? escapeHtml(guest.table) : '<span style="color: #94a3b8; font-weight: normal;">Unassigned</span>'}</strong>
        </td>
        <td>
          ${dietaryHtml}
        </td>
        <td>
          <button class="${checkinClass}" data-checkin-id="${guest.id}" title="Toggle check-in status">
            ${checkinText}
          </button>
        </td>
        <td class="actions-cell">
          <button class="action-menu-btn" data-edit-id="${guest.id}" title="Edit guest details">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="action-menu-btn" data-delete-id="${guest.id}" title="Delete guest" style="color: #dc2626; margin-left: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </td>
      `;

      DOM.guestsTableBody.appendChild(tr);
    });

    // Update select-all checkbox state
    const visibleCheckboxes = DOM.guestsTableBody.querySelectorAll('.guest-checkbox');
    const checkedCount = Array.from(visibleCheckboxes).filter(cb => cb.checked).length;
    if (checkedCount === 0) {
      DOM.selectAllCheckbox.checked = false;
      DOM.selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === visibleCheckboxes.length) {
      DOM.selectAllCheckbox.checked = true;
      DOM.selectAllCheckbox.indeterminate = false;
    } else {
      DOM.selectAllCheckbox.checked = false;
      DOM.selectAllCheckbox.indeterminate = true;
    }

    updateBulkActionBar();
  }

  function updateBulkActionBar() {
    if (selectedGuestIds.size > 0) {
      DOM.bulkActionsBanner.style.display = 'flex';
      DOM.selectedGuestsCount.textContent = selectedGuestIds.size;
    } else {
      DOM.bulkActionsBanner.style.display = 'none';
    }
  }

  // ==========================================================================
  // Tab 2: Seating Chart View
  // ==========================================================================
  function renderSeatingView() {
    DOM.seatingGrid.innerHTML = '';

    // Group guests by table
    const tableMap = new Map();

    guests.forEach(g => {
      const tableName = (g.table && g.table.trim()) ? g.table.trim() : 'Unassigned';
      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, []);
      }
      tableMap.get(tableName).push(g);
    });

    if (tableMap.size === 0) {
      DOM.seatingGrid.innerHTML = '<div style="color: #64748b; padding: 20px;">No tables have been assigned yet. Edit guests to assign tables.</div>';
      return;
    }

    // Sort table names
    const sortedTables = Array.from(tableMap.keys()).sort((a, b) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    });

    sortedTables.forEach(tableName => {
      const tableGuests = tableMap.get(tableName);
      let totalHeadsAtTable = 0;
      tableGuests.forEach(g => {
        totalHeadsAtTable += 1 + (Number(g.plusOnes) || 0);
      });

      const card = document.createElement('div');
      card.className = 'table-card-item';

      let guestListHtml = '';
      tableGuests.forEach(g => {
        const statusDot = g.status === 'attending' ? '#10b981' : (g.status === 'pending' ? '#f59e0b' : '#ef4444');
        const plusCount = Number(g.plusOnes) || 0;
        guestListHtml += `
          <li class="table-guest-item">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusDot}; flex-shrink: 0;"></span>
              <strong>${escapeHtml(g.name)}</strong>
              ${plusCount > 0 ? `<small style="color: #64748b;">(+${plusCount})</small>` : ''}
            </span>
            <span style="font-size: 11px; color: #64748b;">${g.checkedIn ? '<span style="color: #059669; font-weight: 700;">✓ In</span>' : escapeHtml(g.status)}</span>
          </li>
        `;
      });

      card.innerHTML = `
        <div class="table-card-header">
          <div class="table-card-title">${escapeHtml(tableName)}</div>
          <span class="table-guest-count">${totalHeadsAtTable} Seats</span>
        </div>
        <ul class="table-guest-list">
          ${guestListHtml}
        </ul>
      `;

      DOM.seatingGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // Tab 3: Catering & Dietary View
  // ==========================================================================
  function renderDietaryView() {
    DOM.dietaryStatsCards.innerHTML = '';
    DOM.dietaryTableBody.innerHTML = '';

    const dietaryCounts = {
      'Vegetarian': 0,
      'Vegan': 0,
      'Gluten-Free': 0,
      'Halal': 0,
      'Kosher': 0,
      'Nut Allergy': 0,
      'Dairy-Free': 0,
      'Shellfish Allergy': 0
    };

    const specialGuests = [];

    guests.forEach(g => {
      const hasRestrictions = g.dietary && g.dietary.length > 0;
      const hasNotes = Boolean(g.notes && g.notes.trim());

      if (hasRestrictions) {
        g.dietary.forEach(diet => {
          if (dietaryCounts[diet] !== undefined) {
            dietaryCounts[diet]++;
          } else {
            dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
          }
        });
      }

      if (hasRestrictions || hasNotes) {
        specialGuests.push(g);
      }
    });

    // Render count stat cards for active dietary needs
    Object.keys(dietaryCounts).forEach(diet => {
      const count = dietaryCounts[diet];
      if (count > 0) {
        const card = document.createElement('div');
        card.className = 'catering-stat-card';
        card.innerHTML = `
          <div class="catering-stat-number">${count}</div>
          <div class="catering-stat-label">${escapeHtml(diet)}</div>
        `;
        DOM.dietaryStatsCards.appendChild(card);
      }
    });

    if (DOM.dietaryStatsCards.children.length === 0) {
      DOM.dietaryStatsCards.innerHTML = '<div style="grid-column: 1 / -1; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; color: #64748b; text-align: center;">No specific dietary allergies recorded yet.</div>';
    }

    // Render table of guests with dietary or special instructions
    if (specialGuests.length === 0) {
      DOM.dietaryTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">No guests with dietary restrictions or special requests.</td></tr>';
      return;
    }

    specialGuests.forEach(g => {
      const tr = document.createElement('tr');
      let dietTags = '';
      if (g.dietary && g.dietary.length > 0) {
        dietTags = g.dietary.map(d => `<span class="dietary-tag">${escapeHtml(d)}</span>`).join(' ');
      } else {
        dietTags = '<span style="color: #94a3b8;">None</span>';
      }

      tr.innerHTML = `
        <td><strong>${escapeHtml(g.name)}</strong></td>
        <td><span class="badge badge-${escapeHtml(g.status)}">${escapeHtml(g.status)}</span></td>
        <td>${g.table ? escapeHtml(g.table) : '<span style="color: #94a3b8;">Unassigned</span>'}</td>
        <td>${dietTags}</td>
        <td>${g.notes ? `<em>${escapeHtml(g.notes)}</em>` : '<span style="color: #94a3b8;">—</span>'}</td>
      `;
      DOM.dietaryTableBody.appendChild(tr);
    });
  }

  // ==========================================================================
  // Public RSVP Simulator Modal Logic
  // ==========================================================================
  function populatePortalGuestList() {
    DOM.portalEventName.textContent = eventData.name;
    DOM.portalEventMeta.textContent = `${eventData.date} • ${eventData.venue}`;

    const currentSelected = DOM.portalGuestSelect.value;
    DOM.portalGuestSelect.innerHTML = '<option value="">-- Choose your name from invitation list --</option>';

    guests.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = `${g.name} (${g.status.toUpperCase()})`;
      DOM.portalGuestSelect.appendChild(opt);
    });

    if (currentSelected && guests.some(g => g.id === currentSelected)) {
      DOM.portalGuestSelect.value = currentSelected;
    }
  }

  function handlePortalGuestChange() {
    const selectedId = DOM.portalGuestSelect.value;
    if (!selectedId) {
      DOM.portalRsvpForm.style.display = 'none';
      DOM.portalSuccessCard.style.display = 'none';
      return;
    }

    const guest = guests.find(g => g.id === selectedId);
    if (!guest) return;

    DOM.portalSuccessCard.style.display = 'none';
    DOM.portalRsvpForm.style.display = 'block';
    DOM.portalActiveGuestName.textContent = `Welcome, ${guest.name}!`;

    // Populate current values
    const statusRadio = DOM.portalRsvpForm.querySelector(`input[name="portal_status"][value="${guest.status === 'declined' ? 'declined' : 'attending'}"]`);
    if (statusRadio) statusRadio.checked = true;

    DOM.portalPlusOnes.value = String(Math.min(2, Number(guest.plusOnes) || 0));
    DOM.portalDietary.value = (guest.dietary || []).join(', ');
    DOM.portalNote.value = guest.notes || '';

    updatePortalRadioStyle();
  }

  function updatePortalRadioStyle() {
    const selected = DOM.portalRsvpForm.querySelector('input[name="portal_status"]:checked');
    if (!selected) return;

    if (selected.value === 'declined') {
      DOM.portalAttendingDetails.style.display = 'none';
    } else {
      DOM.portalAttendingDetails.style.display = 'block';
    }
  }

  // ==========================================================================
  // Guest Add / Edit Modal Logic
  // ==========================================================================
  function openGuestModal(guestId = null) {
    currentEditingGuestId = guestId;
    DOM.guestForm.reset();
    DOM.errorName.textContent = '';

    // Clear checkboxes
    const dietaryBoxes = DOM.guestForm.querySelectorAll('input[name="dietary"]');
    dietaryBoxes.forEach(b => b.checked = false);

    if (guestId) {
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return;

      DOM.guestModalTitle.textContent = 'Edit Guest Details';
      DOM.guestId.value = guest.id;
      DOM.formName.value = guest.name || '';
      DOM.formGroupSelect.value = guest.group || 'Friends';
      DOM.formEmail.value = guest.email || '';
      DOM.formPhone.value = guest.phone || '';
      DOM.formRsvpStatus.value = guest.status || 'pending';
      DOM.formPlusOnes.value = String(guest.plusOnes || 0);
      DOM.formPlusOneNames.value = guest.plusOneNames || '';
      DOM.formTable.value = guest.table || '';
      DOM.formNotes.value = guest.notes || '';
      DOM.formCheckedIn.checked = Boolean(guest.checkedIn);

      // Checkboxes
      if (guest.dietary && Array.isArray(guest.dietary)) {
        dietaryBoxes.forEach(box => {
          if (guest.dietary.includes(box.value)) {
            box.checked = true;
          }
        });
      }

      handlePlusOnesChange();
    } else {
      DOM.guestModalTitle.textContent = 'Add New Guest';
      DOM.guestId.value = '';
      DOM.formRsvpStatus.value = 'pending';
      DOM.formPlusOnes.value = '0';
      DOM.plusOnesNamesContainer.style.display = 'none';
      DOM.formCheckedIn.checked = false;
    }

    DOM.modalGuestForm.style.display = 'flex';
    DOM.formName.focus();
  }

  function closeGuestModal() {
    DOM.modalGuestForm.style.display = 'none';
    currentEditingGuestId = null;
  }

  function handlePlusOnesChange() {
    const val = Number(DOM.formPlusOnes.value);
    if (val > 0) {
      DOM.plusOnesNamesContainer.style.display = 'block';
    } else {
      DOM.plusOnesNamesContainer.style.display = 'none';
    }
  }

  function handleSaveGuest(e) {
    e.preventDefault();

    const name = DOM.formName.value.trim();
    if (!name) {
      DOM.errorName.textContent = 'Guest name is required.';
      DOM.formName.focus();
      return;
    }
    DOM.errorName.textContent = '';

    // Collect dietary checkboxes
    const checkedBoxes = DOM.guestForm.querySelectorAll('input[name="dietary"]:checked');
    const dietaryList = Array.from(checkedBoxes).map(cb => cb.value);

    const guestPayload = {
      name: name,
      group: DOM.formGroupSelect.value,
      email: DOM.formEmail.value.trim(),
      phone: DOM.formPhone.value.trim(),
      status: DOM.formRsvpStatus.value,
      plusOnes: Number(DOM.formPlusOnes.value) || 0,
      plusOneNames: DOM.formPlusOneNames.value.trim(),
      table: DOM.formTable.value.trim(),
      dietary: dietaryList,
      notes: DOM.formNotes.value.trim(),
      checkedIn: DOM.formCheckedIn.checked
    };

    if (currentEditingGuestId) {
      // Update
      const index = guests.findIndex(g => g.id === currentEditingGuestId);
      if (index !== -1) {
        guests[index] = Object.assign({}, guests[index], guestPayload);
        showToast(`Updated details for "${name}"`, 'success');
      }
    } else {
      // Create
      const newGuest = Object.assign({
        id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString()
      }, guestPayload);
      guests.unshift(newGuest);
      showToast(`Added "${name}" to guest list`, 'success');
    }

    saveGuests();
    renderAll();
    closeGuestModal();
  }

  function deleteGuest(guestId) {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    if (confirm(`Are you sure you want to remove "${guest.name}" from the guest list?`)) {
      guests = guests.filter(g => g.id !== guestId);
      selectedGuestIds.delete(guestId);
      saveGuests();
      renderAll();
      showToast(`Removed "${guest.name}"`, 'info');
    }
  }

  function cycleGuestStatus(guestId) {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const sequence = {
      pending: 'attending',
      attending: 'declined',
      declined: 'pending'
    };

    guest.status = sequence[guest.status] || 'pending';
    if (guest.status === 'declined') {
      guest.checkedIn = false;
    }

    saveGuests();
    renderAll();
    showToast(`${guest.name} RSVP updated to ${guest.status.toUpperCase()}`, 'info');
  }

  function toggleCheckIn(guestId) {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    guest.checkedIn = !guest.checkedIn;
    // If checking in, automatically set status to attending
    if (guest.checkedIn && guest.status !== 'attending') {
      guest.status = 'attending';
    }

    saveGuests();
    renderAll();
    showToast(guest.checkedIn ? `${guest.name} checked in!` : `${guest.name} check-in reversed`, 'success');
  }

  // ==========================================================================
  // Event Configuration Modal Logic
  // ==========================================================================
  function openEventModal() {
    DOM.eventInputName.value = eventData.name || '';
    DOM.eventInputDate.value = eventData.date || '';
    DOM.eventInputTime.value = eventData.time || '';
    DOM.eventInputVenue.value = eventData.venue || '';
    DOM.eventInputCapacity.value = eventData.capacity || 100;
    DOM.eventInputType.value = eventData.type || 'Official Event';

    DOM.modalEventDetails.style.display = 'flex';
    DOM.eventInputName.focus();
  }

  function closeEventModal() {
    DOM.modalEventDetails.style.display = 'none';
  }

  function handleSaveEvent(e) {
    e.preventDefault();
    const name = DOM.eventInputName.value.trim();
    if (!name) {
      alert('Event name cannot be empty.');
      return;
    }

    eventData.name = name;
    eventData.date = DOM.eventInputDate.value.trim();
    eventData.time = DOM.eventInputTime.value.trim();
    eventData.venue = DOM.eventInputVenue.value.trim();
    eventData.capacity = Number(DOM.eventInputCapacity.value) || 100;
    eventData.type = DOM.eventInputType.value.trim() || 'Official Event';

    saveEvent();
    renderAll();
    closeEventModal();
    showToast('Event details updated successfully', 'success');
  }

  // ==========================================================================
  // Bulk Actions
  // ==========================================================================
  function handleSelectAllVisible(e) {
    const isChecked = e.target.checked;
    const filtered = getFilteredAndSortedGuests();

    filtered.forEach(g => {
      if (isChecked) {
        selectedGuestIds.add(g.id);
      } else {
        selectedGuestIds.delete(g.id);
      }
    });

    renderGuestDirectory();
  }

  function handleSingleCheckboxChange(id, isChecked) {
    if (isChecked) {
      selectedGuestIds.add(id);
    } else {
      selectedGuestIds.delete(id);
    }
    renderGuestDirectory();
  }

  function bulkSetStatus(status) {
    if (selectedGuestIds.size === 0) return;

    let updatedCount = 0;
    guests.forEach(g => {
      if (selectedGuestIds.has(g.id)) {
        g.status = status;
        if (status === 'declined') g.checkedIn = false;
        updatedCount++;
      }
    });

    saveGuests();
    renderAll();
    showToast(`Updated ${updatedCount} guests to "${status}"`, 'success');
  }

  function bulkCheckIn() {
    if (selectedGuestIds.size === 0) return;

    let count = 0;
    guests.forEach(g => {
      if (selectedGuestIds.has(g.id)) {
        g.checkedIn = true;
        g.status = 'attending';
        count++;
      }
    });

    saveGuests();
    renderAll();
    showToast(`Checked in ${count} guests!`, 'success');
  }

  function bulkDelete() {
    const count = selectedGuestIds.size;
    if (count === 0) return;

    if (confirm(`Are you sure you want to delete ${count} selected guests?`)) {
      guests = guests.filter(g => !selectedGuestIds.has(g.id));
      selectedGuestIds.clear();
      saveGuests();
      renderAll();
      showToast(`Deleted ${count} guests`, 'info');
    }
  }

  // ==========================================================================
  // Import & Export CSV
  // ==========================================================================
  function exportToCsv() {
    if (guests.length === 0) {
      showToast('No guests to export', 'danger');
      return;
    }

    const headers = ['Name', 'Group', 'Email', 'Phone', 'RSVP Status', 'Plus Ones', 'Plus One Names', 'Table', 'Dietary Restrictions', 'Special Notes', 'Checked In'];

    const rows = guests.map(g => [
      formatCsvField(g.name),
      formatCsvField(g.group),
      formatCsvField(g.email),
      formatCsvField(g.phone),
      formatCsvField(g.status),
      g.plusOnes || 0,
      formatCsvField(g.plusOneNames || ''),
      formatCsvField(g.table || ''),
      formatCsvField((g.dietary || []).join('; ')),
      formatCsvField(g.notes || ''),
      g.checkedIn ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = (eventData.name || 'guests').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${sanitizedTitle}_guest_list_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Exported guest list to CSV file', 'success');
  }

  function formatCsvField(text) {
    if (!text) return '""';
    const str = String(text).replace(/"/g, '""');
    return `"${str}"`;
  }

  function handleCsvImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const text = evt.target.result;
        const imported = parseCsv(text);
        if (imported.length === 0) {
          showToast('No valid guests found in the CSV file', 'danger');
          return;
        }

        guests = guests.concat(imported);
        saveGuests();
        renderAll();
        showToast(`Successfully imported ${imported.length} guests from CSV!`, 'success');
      } catch (err) {
        console.error('CSV Import Error', err);
        showToast('Error parsing CSV file. Please check file format.', 'danger');
      }
      DOM.csvFileInput.value = '';
    };
    reader.readAsText(file);
  }

  function parseCsv(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const parsedGuests = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (!row || row.length < 1 || !row[0].trim()) continue;

      const name = row[0].trim();
      const group = (row[1] && row[1].trim()) || 'Other';
      const email = (row[2] && row[2].trim()) || '';
      const phone = (row[3] && row[3].trim()) || '';
      let status = (row[4] && row[4].trim().toLowerCase()) || 'pending';
      if (!['attending', 'declined', 'pending'].includes(status)) status = 'pending';
      const plusOnes = parseInt(row[5], 10) || 0;
      const plusOneNames = (row[6] && row[6].trim()) || '';
      const table = (row[7] && row[7].trim()) || '';
      const dietaryRaw = (row[8] && row[8].trim()) || '';
      const dietary = dietaryRaw ? dietaryRaw.split(';').map(d => d.trim()).filter(Boolean) : [];
      const notes = (row[9] && row[9].trim()) || '';
      const checkedIn = (row[10] && row[10].trim().toLowerCase() === 'yes');

      parsedGuests.push({
        id: 'csv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: name,
        group: group,
        email: email,
        phone: phone,
        status: status,
        plusOnes: plusOnes,
        plusOneNames: plusOneNames,
        table: table,
        dietary: dietary,
        notes: notes,
        checkedIn: checkedIn,
        createdAt: new Date().toISOString()
      });
    }

    return parsedGuests;
  }

  function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  // ==========================================================================
  // Helper Utilities
  // ==========================================================================
  function getInitials(name) {
    if (!name) return 'G';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getAvatarColor(name) {
    const colors = [
      { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
      { bg: '#ecfdf5', text: '#065f46' }, // Emerald
      { bg: '#fef3c7', text: '#92400e' }, // Amber
      { bg: '#fce7f3', text: '#9d174d' }, // Pink
      { bg: '#ede9fe', text: '#5b21b6' }, // Purple
      { bg: '#cffafe', text: '#155e75' }  // Cyan
    ];

    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  function escapeHtml(string) {
    if (string === null || string === undefined) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==========================================================================
  // Tab Switcher
  // ==========================================================================
  function switchTab(tabId) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const activePanel = document.getElementById(tabId);

    if (activeBtn) activeBtn.classList.add('active');
    if (activePanel) activePanel.classList.add('active');
  }

  // ==========================================================================
  // Event Listeners Binding
  // ==========================================================================
  function bindEvents() {
    // Tab switching
    DOM.tabBtnGuestlist.addEventListener('click', () => switchTab('tab-content-guestlist'));
    DOM.tabBtnSeating.addEventListener('click', () => switchTab('tab-content-seating'));
    DOM.tabBtnDietary.addEventListener('click', () => switchTab('tab-content-dietary'));

    // Guest Modal Triggers
    DOM.btnAddGuestModal.addEventListener('click', () => openGuestModal(null));
    DOM.btnEmptyAddGuest.addEventListener('click', () => openGuestModal(null));
    DOM.btnCloseGuestModal.addEventListener('click', closeGuestModal);
    DOM.btnCancelGuestForm.addEventListener('click', closeGuestModal);
    DOM.guestForm.addEventListener('submit', handleSaveGuest);
    DOM.formPlusOnes.addEventListener('change', handlePlusOnesChange);

    // Event Config Modal Triggers
    DOM.btnEditEvent.addEventListener('click', openEventModal);
    DOM.btnCloseEventModal.addEventListener('click', closeEventModal);
    DOM.btnCancelEventModal.addEventListener('click', closeEventModal);
    DOM.eventForm.addEventListener('submit', handleSaveEvent);

    // Public RSVP Simulator Modal Triggers
    DOM.btnOpenRsvpPortal.addEventListener('click', () => {
      populatePortalGuestList();
      DOM.modalRsvpPortal.style.display = 'flex';
      DOM.portalGuestSelect.focus();
    });
    DOM.btnClosePortalModal.addEventListener('click', () => {
      DOM.modalRsvpPortal.style.display = 'none';
    });
    DOM.portalGuestSelect.addEventListener('change', handlePortalGuestChange);

    DOM.portalRsvpForm.querySelectorAll('input[name="portal_status"]').forEach(r => {
      r.addEventListener('change', updatePortalRadioStyle);
    });

    DOM.portalRsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedId = DOM.portalGuestSelect.value;
      const guest = guests.find(g => g.id === selectedId);
      if (!guest) return;

      const chosenStatus = DOM.portalRsvpForm.querySelector('input[name="portal_status"]:checked').value;
      guest.status = chosenStatus;

      if (chosenStatus === 'attending') {
        guest.plusOnes = Number(DOM.portalPlusOnes.value) || 0;
        const dietText = DOM.portalDietary.value.trim();
        if (dietText) {
          guest.dietary = dietText.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else {
        guest.checkedIn = false;
      }

      const noteText = DOM.portalNote.value.trim();
      if (noteText) {
        guest.notes = guest.notes ? `${guest.notes} | RSVP Note: ${noteText}` : noteText;
      }

      saveGuests();
      renderAll();

      DOM.portalRsvpForm.style.display = 'none';
      DOM.portalSuccessCard.style.display = 'block';
      DOM.portalSuccessText.textContent = `Thank you, ${guest.name}! Your status has been marked as ${chosenStatus.toUpperCase()}.`;
      showToast(`RSVP received for ${guest.name}!`, 'success');
    });

    DOM.btnPortalAnother.addEventListener('click', () => {
      DOM.portalSuccessCard.style.display = 'none';
      DOM.portalGuestSelect.value = '';
      DOM.portalRsvpForm.style.display = 'none';
    });

    // Close modals on clicking overlay backdrop
    window.addEventListener('click', (e) => {
      if (e.target === DOM.modalGuestForm) closeGuestModal();
      if (e.target === DOM.modalEventDetails) closeEventModal();
      if (e.target === DOM.modalRsvpPortal) DOM.modalRsvpPortal.style.display = 'none';
    });

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeGuestModal();
        closeEventModal();
        DOM.modalRsvpPortal.style.display = 'none';
      }
    });

    // Filters & Search
    DOM.filterSearch.addEventListener('input', renderGuestDirectory);
    DOM.btnClearSearch.addEventListener('click', () => {
      DOM.filterSearch.value = '';
      renderGuestDirectory();
      DOM.filterSearch.focus();
    });
    DOM.filterStatus.addEventListener('change', renderGuestDirectory);
    DOM.filterGroup.addEventListener('change', renderGuestDirectory);
    DOM.filterCheckin.addEventListener('change', renderGuestDirectory);
    DOM.filterDietary.addEventListener('change', renderGuestDirectory);
    DOM.filterSort.addEventListener('change', renderGuestDirectory);

    // Table delegated actions (Click row edit, delete, checkin, cycle, checkbox)
    DOM.guestsTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-id]');
      if (editBtn) {
        openGuestModal(editBtn.getAttribute('data-edit-id'));
        return;
      }

      const deleteBtn = e.target.closest('[data-delete-id]');
      if (deleteBtn) {
        deleteGuest(deleteBtn.getAttribute('data-delete-id'));
        return;
      }

      const checkinBtn = e.target.closest('[data-checkin-id]');
      if (checkinBtn) {
        toggleCheckIn(checkinBtn.getAttribute('data-checkin-id'));
        return;
      }

      const cycleBtn = e.target.closest('[data-cycle-id]');
      if (cycleBtn) {
        cycleGuestStatus(cycleBtn.getAttribute('data-cycle-id'));
        return;
      }

      const checkbox = e.target.closest('.guest-checkbox');
      if (checkbox) {
        handleSingleCheckboxChange(checkbox.getAttribute('data-id'), checkbox.checked);
        return;
      }
    });

    // Bulk selection banner
    DOM.selectAllCheckbox.addEventListener('change', handleSelectAllVisible);
    DOM.btnBulkAttending.addEventListener('click', () => bulkSetStatus('attending'));
    DOM.btnBulkDeclined.addEventListener('click', () => bulkSetStatus('declined'));
    DOM.btnBulkCheckin.addEventListener('click', bulkCheckIn);
    DOM.btnBulkDelete.addEventListener('click', bulkDelete);
    DOM.btnBulkCancel.addEventListener('click', () => {
      selectedGuestIds.clear();
      DOM.selectAllCheckbox.checked = false;
      DOM.selectAllCheckbox.indeterminate = false;
      renderGuestDirectory();
    });

    // Load Demo data button
    const loadDemo = () => {
      if (guests.length > 0) {
        if (!confirm('This will append sample guests to your current list. Proceed?')) {
          return;
        }
      }
      guests = guests.concat(JSON.parse(JSON.stringify(SAMPLE_GUESTS)));
      saveGuests();
      renderAll();
      showToast('Loaded sample guest records!', 'success');
    };
    DOM.btnLoadDemo.addEventListener('click', loadDemo);
    DOM.btnEmptyLoadDemo.addEventListener('click', loadDemo);

    // Clear All data button
    DOM.btnClearAll.addEventListener('click', () => {
      if (guests.length === 0) {
        showToast('Guest list is already empty', 'info');
        return;
      }
      if (confirm('Are you sure you want to delete ALL guests? This cannot be undone.')) {
        guests = [];
        selectedGuestIds.clear();
        saveGuests();
        renderAll();
        showToast('Cleared all guest records', 'info');
      }
    });

    // Print Buttons
    DOM.btnPrintList.addEventListener('click', () => window.print());
    DOM.btnPrintCatering.addEventListener('click', () => window.print());

    // Export CSV
    DOM.btnExportCsv.addEventListener('click', exportToCsv);

    // Import CSV
    DOM.csvFileInput.addEventListener('change', handleCsvImport);
  }

  // ==========================================================================
  // Initialize App
  // ==========================================================================
  function init() {
    loadData();
    renderAll();
    bindEvents();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

