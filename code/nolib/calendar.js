// calendar.js
document.addEventListener('DOMContentLoaded', function () {
  // ---------- Inject component-scoped CSS ----------
  const calendarStyles = `
    .calendar-container { width: 100%; }
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      width: 100%;
    }
    .calendar-header .nav-arrow {
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      line-height: 1;
      flex-shrink: 0;
      min-width: auto;
      width: auto;
      height: auto;
    }
    .calendar-header .month-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0.25rem 0;
      min-width: 0;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
    }
    .calendar-weekday {
      text-align: center;
      font-weight: bold;
      color: var(--gray);
      font-size: 0.75rem;
    }
    .calendar-day {
      text-align: center;
      height: 3.5rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border: 1px solid transparent;
      background: var(--surface);
      color: var(--text);
      font-size: 0.875rem;
      box-sizing: border-box;
      position: relative;
    }
    .calendar-day:hover { border-color: var(--border); }
    .calendar-day.other-month { opacity: 0.3; }
    .calendar-day.today { border-color: var(--accent); color: var(--accent); }
    .calendar-day.selected { background: var(--accent); color: var(--accent-txt); }
    .event-dots {
      display: flex;
      justify-content: center;
      gap: 0.15rem;
      margin-top: 0.2rem;
      min-height: 0.6rem;
    }
    .event-dot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: var(--accent);
    }
    .event-count {
      font-size: 0.6rem;
      line-height: 1;
      color: var(--accent);
      margin-top: 0.2rem;
    }
    .monthly-events {
      margin-top: 1.5rem;
      border-top: 1px dashed var(--border);
      padding-top: 1rem;
    }
    .monthly-events h4 {
      font-size: 0.875rem;
      color: var(--gray);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }
    .monthly-event-item {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      padding: 0.375rem 0;
      border-bottom: 1px dashed rgba(255,255,255,0.1);
    }
    .monthly-event-date {
      font-weight: bold;
      color: var(--accent);
      white-space: nowrap;
      font-size: 0.75rem;
    }
    .monthly-event-text {
      flex: 1;
      font-size: 0.875rem;
    }
    .calendar-modal {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .calendar-modal.active { display: flex; }
    .calendar-modal-content {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 1rem;
      width: 90%;
      max-width: 400px;
      max-height: 80%;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .calendar-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .calendar-modal-header h3 { font-size: 1rem; margin: 0; }
    .calendar-modal-close {
      cursor: pointer;
      font-size: 1.5rem;
      line-height: 1;
      padding: 0 0.5rem;
      background: none;
      border: none;
      color: var(--text);
      width: auto;
    }
    .calendar-event-list {
      list-style: none;
      margin: 0 0 1rem 0;
      padding: 0;
    }
    .calendar-event-list li {
      padding: 0.5rem 0;
      border-bottom: 1px dashed var(--border);
    }
    .calendar-event-list li:last-child { border-bottom: none; }
    .calendar-add-btn {
      width: 100%;
      padding: 0.5rem;
      background: var(--accent);
      color: var(--accent-txt);
      border: none;
      font-weight: bold;
      cursor: pointer;
      box-sizing: border-box;
    }
    .calendar-add-form textarea {
      width: 100%;
      min-height: 3rem;
      resize: vertical;
      max-height: 12rem;
      padding: 0.5rem;
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      font-size: 0.875rem;
      box-sizing: border-box;
    }
    .calendar-add-form-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .calendar-add-form-actions button {
      flex: 1;
      padding: 0.5rem;
      background: var(--accent);
      color: var(--accent-txt);
      border: none;
      font-weight: bold;
      cursor: pointer;
      box-sizing: border-box;
    }
    .calendar-add-form-actions button:last-child {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'calendar-component-styles';
  styleEl.textContent = calendarStyles;
  document.head.appendChild(styleEl);

  // ---------- Container ----------
  const container = document.getElementById('calendar-container');
  if (!container) return;

  // ---------- State ----------
  let currentDate = new Date();
  let selectedDateStr = null;
  const events = JSON.parse(localStorage.getItem('dashEvents') || '{}');

  // ---------- Helpers ----------
  function toDateString(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function saveEvents() {
    localStorage.setItem('dashEvents', JSON.stringify(events));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Modal ----------
  function createModal() {
    if (document.getElementById('calendar-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'calendar-modal';
    modal.id = 'calendar-modal';
    modal.innerHTML = `
      <div class="calendar-modal-content">
        <div class="calendar-modal-header">
          <h3 id="modal-date-title">Events</h3>
          <button class="calendar-modal-close" id="modal-close">×</button>
        </div>
        <div id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function openModal(dateStr) {
    createModal();
    const modal = document.getElementById('calendar-modal');
    const title = document.getElementById('modal-date-title');
    const body = document.getElementById('modal-body');

    title.textContent = `Events for ${dateStr}`;
    showEventList(dateStr, body);
    modal.classList.add('active');
    selectedDateStr = dateStr;
  }

  function closeModal() {
    const modal = document.getElementById('calendar-modal');
    if (modal) modal.classList.remove('active');
    selectedDateStr = null;
    renderCalendar();
  }

  function showEventList(dateStr, body) {
    const dayEvents = events[dateStr] || [];
    body.innerHTML = `
      <ul class="calendar-event-list">
        ${dayEvents.map(ev => `<li>${escapeHtml(ev)}</li>`).join('') || '<li>No events yet</li>'}
      </ul>
      <button class="calendar-add-btn" id="add-event-btn">+</button>
    `;
    document.getElementById('add-event-btn').addEventListener('click', () => {
      showAddEventForm(dateStr, body);
    });
  }

  function showAddEventForm(dateStr, body) {
    body.innerHTML = `
      <div class="calendar-add-form">
        <textarea id="event-text" rows="4" placeholder="Enter event details..."></textarea>
        <div class="calendar-add-form-actions">
          <button id="save-event">Save</button>
          <button id="cancel-event">Cancel</button>
        </div>
      </div>
    `;
    document.getElementById('save-event').addEventListener('click', () => {
      const text = document.getElementById('event-text').value.trim();
      if (text) {
        if (!events[dateStr]) events[dateStr] = [];
        events[dateStr].push(text);
        saveEvents();
        closeModal();
      }
    });
    document.getElementById('cancel-event').addEventListener('click', () => {
      showEventList(dateStr, body);
    });
  }

  // ---------- Calendar rendering ----------
  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    const eventsCount = {};
    const monthlyEvents = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateString(year, month, d);
      const dayEvents = events[dateStr] || [];
      eventsCount[dateStr] = dayEvents.length;
      if (dayEvents.length > 0) {
        dayEvents.forEach(ev => {
          monthlyEvents.push({ date: dateStr, text: ev });
        });
      }
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const headerHtml = `
      <div class="calendar-header">
        <button class="nav-arrow cal-prev" aria-label="Previous month">←</button>
        <button class="month-btn" id="month-btn">${monthNames[month]} ${year}</button>
        <button class="nav-arrow cal-next" aria-label="Next month">→</button>
      </div>
    `;

    // Hidden native month input
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'month';
    hiddenInput.id = 'hidden-month-input';
    hiddenInput.style.cssText = 'position:absolute; left:-9999px; opacity:0; width:1px; height:1px;';
    hiddenInput.value = `${year}-${String(month + 1).padStart(2, '0')}`;

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdaysHtml = weekDays.map(w => `<div class="calendar-weekday">${w}</div>`).join('');

    let dayCells = '';
    for (let i = 0; i < startWeekday; i++) {
      dayCells += `<div class="calendar-day other-month"></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateString(year, month, d);
      const todayStr = new Date().toISOString().slice(0, 10);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDateStr;
      const eventCount = eventsCount[dateStr] || 0;
      
      let dotsHtml = '';
      if (eventCount > 0) {
        if (eventCount <= 3) {
          for (let i = 0; i < eventCount; i++) {
            dotsHtml += `<span class="event-dot"></span>`;
          }
        } else {
          dotsHtml = `<span class="event-count">3+</span>`;
        }
      }

      dayCells += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
          <span>${d}</span>
          ${dotsHtml ? `<div class="event-dots">${dotsHtml}</div>` : ''}
        </div>
      `;
    }
    const totalCells = startWeekday + daysInMonth;
    const remainder = totalCells % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        dayCells += `<div class="calendar-day other-month"></div>`;
      }
    }

    const monthlyEventsHtml = monthlyEvents.length > 0
      ? monthlyEvents.map(ev => `
          <div class="monthly-event-item">
            <span class="monthly-event-date">${ev.date}</span>
            <span class="monthly-event-text">${escapeHtml(ev.text)}</span>
          </div>
        `).join('')
      : '<div class="monthly-event-item"><span class="monthly-event-text">No events this month</span></div>';

    container.innerHTML = headerHtml + `<div class="calendar-grid">${weekdaysHtml}${dayCells}</div>` +
      `<div class="monthly-events"><h4>Events this month</h4>${monthlyEventsHtml}</div>`;
    container.appendChild(hiddenInput);

    // Event listeners
    container.querySelector('.cal-prev').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
    container.querySelector('.cal-next').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    container.querySelector('#month-btn').addEventListener('click', () => {
      const input = container.querySelector('#hidden-month-input');
      if (input) {
        if (typeof input.showPicker === 'function') {
          input.showPicker();
        } else {
          input.click();
        }
      }
    });

    container.querySelector('#hidden-month-input').addEventListener('change', (e) => {
      const value = e.target.value;
      if (value) {
        const [y, m] = value.split('-').map(Number);
        currentDate = new Date(y, m - 1, 1);
        renderCalendar();
      }
    });

    container.querySelectorAll('.calendar-day[data-date]').forEach(day => {
      day.addEventListener('click', (e) => {
        selectedDateStr = e.currentTarget.dataset.date;
        openModal(selectedDateStr);
      });
    });
  }

  // ---------- Initial render ----------
  renderCalendar();

  // Make box title clickable to reset to today
  const calendarTitle = document.getElementById('calendar-title');
  if (calendarTitle) {
    calendarTitle.addEventListener('click', () => {
      currentDate = new Date();
      selectedDateStr = null;
      renderCalendar();
    });
  }
});