/* ============================================================
   PERSONAL DASHBOARD — app.js
   Features  : Greeting · Focus Timer · To-Do List · Quick Links
   Challenges : Light/Dark Mode · Custom Name · Prevent Duplicates
   Storage    : localStorage only (no backend)
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   1. CONSTANTS & DOM REFERENCES
────────────────────────────────────────── */
const LS = {
  THEME:    'dashboard_theme',
  NAME:     'dashboard_name',
  TODOS:    'dashboard_todos',
  LINKS:    'dashboard_links',
  DURATION: 'dashboard_timer_duration',
};

const $ = (id) => document.getElementById(id);

const DOM = {
  html:          document.documentElement,
  datetime:      $('datetime'),
  greeting:      $('greeting'),
  footerName:    $('footerName'),
  themeToggle:   $('themeToggle'),
  themeIcon:     $('themeIcon'),

  // Name modal
  nameModal:     $('nameModal'),
  nameInput:     $('nameInput'),
  nameSaveBtn:   $('nameSaveBtn'),

  // Timer
  timerDisplay:  $('timerDisplay'),
  timerStart:    $('timerStart'),
  timerStop:     $('timerStop'),
  timerReset:    $('timerReset'),
  editTimerBtn:  $('editTimerBtn'),
  timerEditPanel:$('timerEditPanel'),
  customMinutes: $('customMinutes'),
  applyTimerBtn: $('applyTimerBtn'),

  // Todo
  todoInput:     $('todoInput'),
  todoAddBtn:    $('todoAddBtn'),
  todoList:      $('todoList'),
  todoError:     $('todoError'),
  sortSelect:    $('sortSelect'),

  // Links
  linkLabel:     $('linkLabel'),
  linkUrl:       $('linkUrl'),
  linkAddBtn:    $('linkAddBtn'),
  linksList:     $('linksList'),
  linkError:     $('linkError'),
};

/* ──────────────────────────────────────────
   2. THEME  (Challenge: Light / Dark Mode)
────────────────────────────────────────── */
const Theme = (() => {
  const ICONS = { light: '🌙', dark: '☀️' };

  function apply(theme) {
    DOM.html.setAttribute('data-theme', theme);
    DOM.themeIcon.textContent = ICONS[theme];
    localStorage.setItem(LS.THEME, theme);
  }

  function toggle() {
    const current = DOM.html.getAttribute('data-theme');
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    const saved = localStorage.getItem(LS.THEME) || 'light';
    apply(saved);
    DOM.themeToggle.addEventListener('click', toggle);
  }

  return { init };
})();

/* ──────────────────────────────────────────
   3. GREETING & CLOCK
   (Challenge: Custom Name in Greeting)
────────────────────────────────────────── */
const Greeting = (() => {
  let _name = '';

  const PERIODS = [
    { range: [5,  11],  msg: 'Good morning'   },
    { range: [12, 16],  msg: 'Good afternoon' },
    { range: [17, 20],  msg: 'Good evening'   },
    { range: [21, 23],  msg: 'Good night'     },
    { range: [0,  4],   msg: 'Good night'     },
  ];

  function getGreetingText(hour) {
    for (const p of PERIODS) {
      const [lo, hi] = p.range;
      if (hour >= lo && hour <= hi) return p.msg;
    }
    return 'Hello';
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const hour = now.getHours();

    // Clock & date line
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const h   = pad(hour % 12 || 12);
    const min = pad(now.getMinutes());
    const sec = pad(now.getSeconds());
    const ampm = hour < 12 ? 'AM' : 'PM';
    const day  = days[now.getDay()];
    const date = now.getDate();
    const mon  = months[now.getMonth()];
    const year = now.getFullYear();

    DOM.datetime.textContent = `${day}, ${mon} ${date} ${year}  ·  ${h}:${min}:${sec} ${ampm}`;

    // Greeting
    const base = getGreetingText(hour);
    DOM.greeting.textContent = _name ? `${base}, ${_name} 👋` : `${base} 👋`;
  }

  function setName(name) {
    _name = name.trim();
    localStorage.setItem(LS.NAME, _name);
    DOM.footerName.textContent = _name ? `Hi ${_name}!` : '';
    tick();
  }

  function init() {
    _name = localStorage.getItem(LS.NAME) || '';

    // Show name modal if no saved name
    if (!_name) {
      DOM.nameModal.classList.remove('hidden');
    }

    // Save name on button click
    DOM.nameSaveBtn.addEventListener('click', () => {
      const val = DOM.nameInput.value.trim();
      if (!val) { DOM.nameInput.focus(); return; }
      setName(val);
      DOM.nameModal.classList.add('hidden');
    });

    // Also save on Enter key
    DOM.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') DOM.nameSaveBtn.click();
    });

    DOM.footerName.textContent = _name ? `Hi ${_name}!` : '';
    tick();
    setInterval(tick, 1000);
  }

  return { init };
})();

/* ──────────────────────────────────────────
   4. FOCUS TIMER
   (Challenge: Change Pomodoro Time)
────────────────────────────────────────── */
const Timer = (() => {
  const DEFAULT_MINUTES = 25;

  let totalSeconds = 0;
  let remaining    = 0;
  let intervalId   = null;
  let running      = false;

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function render() {
    DOM.timerDisplay.textContent = formatTime(remaining);
  }

  function setDuration(minutes) {
    stop();
    totalSeconds = minutes * 60;
    remaining    = totalSeconds;
    localStorage.setItem(LS.DURATION, minutes);
    DOM.customMinutes.value = minutes;
    render();
  }

  function start() {
    if (running) return;
    if (remaining === 0) remaining = totalSeconds;
    running = true;

    intervalId = setInterval(() => {
      if (remaining <= 0) {
        stop();
        DOM.timerDisplay.textContent = '00:00';
        return;
      }
      remaining--;
      render();
    }, 1000);
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    running    = false;
  }

  function reset() {
    stop();
    remaining = totalSeconds;
    render();
  }

  function init() {
    const saved   = parseInt(localStorage.getItem(LS.DURATION), 10);
    const minutes = (saved && saved > 0) ? saved : DEFAULT_MINUTES;
    setDuration(minutes);

    DOM.timerStart.addEventListener('click', start);
    DOM.timerStop.addEventListener('click',  stop);
    DOM.timerReset.addEventListener('click', reset);

    // Edit panel toggle
    DOM.editTimerBtn.addEventListener('click', () => {
      DOM.timerEditPanel.classList.toggle('hidden');
    });

    DOM.applyTimerBtn.addEventListener('click', () => {
      const val = parseInt(DOM.customMinutes.value, 10);
      if (!val || val < 1 || val > 120) {
        DOM.customMinutes.focus();
        return;
      }
      setDuration(val);
      DOM.timerEditPanel.classList.add('hidden');
    });

    DOM.customMinutes.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') DOM.applyTimerBtn.click();
    });
  }

  return { init };
})();

/* ──────────────────────────────────────────
   5. TO-DO LIST
   (Challenge: Prevent Duplicate Tasks)
   (Challenge: Sort Tasks — bonus included)
────────────────────────────────────────── */
const Todos = (() => {
  let tasks = [];

  /* ---- Persistence ---- */
  function load() {
    try { tasks = JSON.parse(localStorage.getItem(LS.TODOS)) || []; }
    catch { tasks = []; }
  }

  function save() { localStorage.setItem(LS.TODOS, JSON.stringify(tasks)); }

  /* ---- Helpers ---- */
  function generateId() { return `t_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

  function normalize(str) { return str.trim().toLowerCase(); }

  function isDuplicate(text) {
    return tasks.some(t => normalize(t.text) === normalize(text));
  }

  function showError(msg) {
    DOM.todoError.textContent = msg;
    DOM.todoError.classList.remove('hidden');
    clearTimeout(DOM.todoError._timer);
    DOM.todoError._timer = setTimeout(() => DOM.todoError.classList.add('hidden'), 3000);
  }

  /* ---- Sort ---- */
  function getSorted() {
    const mode = DOM.sortSelect.value;
    const copy = [...tasks];
    if (mode === 'az')   return copy.sort((a,b) => a.text.localeCompare(b.text));
    if (mode === 'za')   return copy.sort((a,b) => b.text.localeCompare(a.text));
    if (mode === 'done') return copy.sort((a,b) => Number(a.done) - Number(b.done));
    return copy; // default: insertion order
  }

  /* ---- Render ---- */
  function render() {
    DOM.todoList.innerHTML = '';
    const sorted = getSorted();

    if (!sorted.length) {
      const empty = document.createElement('li');
      empty.textContent = 'No tasks yet. Add one above!';
      empty.style.cssText = 'color:var(--clr-text-muted);font-size:.88rem;padding:.5rem .25rem;';
      DOM.todoList.appendChild(empty);
      return;
    }

    sorted.forEach((task) => {
      const li = document.createElement('li');
      li.className = `todo-item${task.done ? ' todo-item--done' : ''}`;
      li.dataset.id = task.id;

      // Checkbox
      const cb = document.createElement('input');
      cb.type    = 'checkbox';
      cb.checked = task.done;
      cb.className = 'todo-item__check';
      cb.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'undone' : 'done'}`);
      cb.addEventListener('change', () => toggleDone(task.id));

      // Text span
      const span = document.createElement('span');
      span.className   = 'todo-item__text';
      span.textContent = task.text;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'todo-item__actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn--ghost btn--sm';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
      editBtn.addEventListener('click', () => startEdit(task.id, li, span));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn--danger btn--sm';
      delBtn.textContent = '🗑';
      delBtn.setAttribute('aria-label', `Delete "${task.text}"`);
      delBtn.addEventListener('click', () => deleteTask(task.id));

      actions.append(editBtn, delBtn);
      li.append(cb, span, actions);
      DOM.todoList.appendChild(li);
    });
  }

  /* ---- CRUD ---- */
  function addTask(text) {
    text = text.trim();
    if (!text) return;

    // Challenge: Prevent duplicates
    if (isDuplicate(text)) {
      showError(`"${text}" is already in your list!`);
      return;
    }

    tasks.push({ id: generateId(), text, done: false });
    save();
    render();
    DOM.todoInput.value = '';
    DOM.todoInput.focus();
  }

  function toggleDone(id) {
    const task = tasks.find(t => t.id === id);
    if (task) { task.done = !task.done; save(); render(); }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }

  function startEdit(id, li, span) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Replace text span with input
    const input = document.createElement('input');
    input.type      = 'text';
    input.value     = task.text;
    input.className = 'todo-item__edit';
    input.maxLength = 100;
    li.replaceChild(input, span);
    input.focus();
    input.select();

    // Replace edit button with save button
    const saveBtn = li.querySelector('.btn--ghost');
    saveBtn.textContent = '💾';
    saveBtn.setAttribute('aria-label', 'Save edit');

    const commit = () => {
      const newText = input.value.trim();
      if (!newText) { input.focus(); return; }

      // Duplicate check (allow keeping same text)
      if (normalize(newText) !== normalize(task.text) && isDuplicate(newText)) {
        input.style.borderColor = 'var(--clr-danger)';
        input.title = 'Duplicate task!';
        input.focus();
        return;
      }

      task.text = newText;
      save();
      render();
    };

    saveBtn.replaceEventListener = true;
    saveBtn.onclick = commit;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  commit();
      if (e.key === 'Escape') render(); // cancel
    });
    input.addEventListener('blur', () => {
      // Small delay so save-button click fires first
      setTimeout(commit, 150);
    });
  }

  /* ---- Init ---- */
  function init() {
    load();
    render();

    DOM.todoAddBtn.addEventListener('click', () => addTask(DOM.todoInput.value));
    DOM.todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTask(DOM.todoInput.value);
    });
    DOM.sortSelect.addEventListener('change', render);
  }

  return { init };
})();

/* ──────────────────────────────────────────
   6. QUICK LINKS
────────────────────────────────────────── */
const Links = (() => {
  let links = [];

  /* ---- Persistence ---- */
  function load() {
    try { links = JSON.parse(localStorage.getItem(LS.LINKS)) || []; }
    catch { links = []; }
  }

  function save() { localStorage.setItem(LS.LINKS, JSON.stringify(links)); }

  /* ---- Helpers ---- */
  function generateId() { return `l_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

  function normalizeUrl(url) {
    url = url.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    return url;
  }

  function showError(msg) {
    DOM.linkError.textContent = msg;
    DOM.linkError.classList.remove('hidden');
    clearTimeout(DOM.linkError._timer);
    DOM.linkError._timer = setTimeout(() => DOM.linkError.classList.add('hidden'), 3000);
  }

  /* ---- Render ---- */
  function render() {
    DOM.linksList.innerHTML = '';

    if (!links.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No quick links yet.';
      empty.style.cssText = 'color:var(--clr-text-muted);font-size:.88rem;';
      DOM.linksList.appendChild(empty);
      return;
    }

    links.forEach((link) => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'inline-flex';
      wrapper.style.alignItems = 'center';

      const a = document.createElement('a');
      a.href        = link.url;
      a.textContent = link.label;
      a.className   = 'link-item';
      a.target      = '_blank';
      a.rel         = 'noopener noreferrer';

      const removeBtn = document.createElement('button');
      removeBtn.className = 'link-remove';
      removeBtn.textContent = '✕';
      removeBtn.setAttribute('aria-label', `Remove ${link.label}`);
      removeBtn.addEventListener('click', () => removeLink(link.id));

      a.appendChild(removeBtn);
      wrapper.appendChild(a);
      DOM.linksList.appendChild(wrapper);
    });
  }

  /* ---- Add / Remove ---- */
  function addLink(label, url) {
    label = label.trim();
    url   = normalizeUrl(url);

    if (!label) { showError('Please enter a label.'); DOM.linkLabel.focus(); return; }
    if (!url)   { showError('Please enter a URL.');   DOM.linkUrl.focus();   return; }

    // Basic URL validation
    try { new URL(url); } catch {
      showError('That doesn\'t look like a valid URL.');
      DOM.linkUrl.focus();
      return;
    }

    links.push({ id: generateId(), label, url });
    save();
    render();
    DOM.linkLabel.value = '';
    DOM.linkUrl.value   = '';
    DOM.linkLabel.focus();
  }

  function removeLink(id) {
    links = links.filter(l => l.id !== id);
    save();
    render();
  }

  /* ---- Init ---- */
  function init() {
    load();
    render();

    DOM.linkAddBtn.addEventListener('click', () => {
      addLink(DOM.linkLabel.value, DOM.linkUrl.value);
    });

    [DOM.linkLabel, DOM.linkUrl].forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addLink(DOM.linkLabel.value, DOM.linkUrl.value);
      });
    });
  }

  return { init };
})();

/* ──────────────────────────────────────────
   7. BOOTSTRAP
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Greeting.init();
  Timer.init();
  Todos.init();
  Links.init();
});
