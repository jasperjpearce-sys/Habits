
// --------- Configuration (your list) ---------
const TASKS = [
  // Blue (Hygiene / Tracking style)
  { label: 'Teeth', amount: 0.25, type: 'Once', color: 'Blue' },
  { label: 'Supplements', amount: 0.25, type: 'Once', color: 'Blue' },
  { label: 'Weight', amount: 0.25, type: 'Once', color: 'Blue' },
  { label: 'Bed', amount: 0.25, type: 'Once', color: 'Blue' },

  // Purple (Fitness)
  { label: 'Exercise 30', amount: 3, type: 'Multiple', color: 'Purple' },
  { label: 'Test', amount: 1, type: 'Once', color: 'Purple' },
  { label: 'Stretch', amount: 1, type: 'Once', color: 'Purple' },
 { label: 'Steps', amount: 1, type: 'Once', color: 'Purple' },

  // White (Work / practice)

  { label: 'Work 60', amount: 4, type: 'Multiple', color: 'White' },
  { label: 'Article', amount: 1, type: 'Once', color: 'White' },
  { label: 'Learning', amount: 1, type: 'Once', color: 'White' },
  { label: 'Task Hour', amount: 4, type: 'Once', color: 'White' },
 
  // Orange (Hobbies)
  { label: 'Puzzles', amount: 1, type: 'Once', color: 'Orange' },
  { label: 'Skills', amount: 1, type: 'Once', color: 'Orange' },
  { label: 'Music', amount: 1, type: 'Once', color: 'Orange' },
  { label: 'Duolingo', amount: 1, type: 'Once', color: 'Orange' },
  { label: 'Reading', amount: 1, type: 'Once', color: 'Orange' },

    // Chores (Grey)
{ label: 'Room', amount: 0.2, type: 'Once', color: 'Grey' },
  { label: 'Laundry', amount: 0.2, type: 'Once', color: 'Grey' },
  { label: 'Clean', amount: 0.2, type: 'Once', color: 'Grey' },
  { label: 'Pack', amount: 0.2, type: 'Once', color: 'Grey' },
  { label: 'Food', amount: 0.2, type: 'Once', color: 'Grey' },
  
  // Red (Vices) — Multiple (negative)
  { label: 'Misc', amount: 1, type: 'Multiple', color: 'White' },
  { label: 'Cigs', amount: -2, type: 'Multiple', color: 'Red' },
  { label: 'Alcohol', amount: -1, type: 'Multiple', color: 'Red' },
  { label: 'Spending', amount: -1, type: 'Multiple', color: 'Red' },
  { label: 'Lies', amount: -5, type: 'Multiple', color: 'Red' },
  { label: 'Mean', amount: -5, type: 'Multiple', color: 'Red' },
   { label: 'Naps', amount: -2, type: 'Multiple', color: 'Red' },
  { label: '100 cals', amount: -1, type: 'Multiple', color: 'Red' },
  // SFW replacement for your original fifth Multiple item:
  { label: 'Impulse', amount: -1, type: 'Multiple', color: 'Red' },
];

// Color map
const COLORS = {
  Blue:   '#1E90FF',
  Green:  '#2ECC71',
  Purple: '#8E44AD',
  Yellow: '#F1C40F',
  Orange: '#E67E22',
  White:  '#FFFFFF', // The dot has a border so White is visible
  Grey:   '#95A5A6',
  Red:    '#E74C3C',
};

// ---- Storage helpers ----
const STORAGE_KEYS = {
  TOTAL: 'runningTotal',
  DATE: 'lastDate',
  COMPLETED_PREFIX: 'completedOnce_', // + YYYY-MM-DD
};

function formatLocalDateYYYYMMDD(date = new Date()) {
  // Local (not UTC) date parts to ensure midnight is your local midnight
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getRunningTotal() {
  return Number(localStorage.getItem(STORAGE_KEYS.TOTAL) || '0');
}
function setRunningTotal(v) {
  localStorage.setItem(STORAGE_KEYS.TOTAL, String(v));
  document.getElementById('running-total').textContent = v;
}

function getCompletedForDate(dateStr) {
  const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_PREFIX + dateStr);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function setCompletedForDate(dateStr, arr) {
  localStorage.setItem(STORAGE_KEYS.COMPLETED_PREFIX + dateStr, JSON.stringify(arr));
}

// ---- Renderers ----
function makeTaskElement(task, onClick) {
  const btn = document.createElement('button');
  btn.className = 'task';
  btn.setAttribute('aria-label', `${task.label} ${task.amount > 0 ? '+' : ''}${task.amount}`);
  btn.style.cursor = 'pointer';

  const dot = document.createElement('span');
  dot.className = 'dot';
  dot.style.background = COLORS[task.color] || '#000';

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = task.label;

  const amount = document.createElement('span');
  amount.className = 'amount';
  amount.textContent = (task.amount > 0 ? '+' : '') + task.amount;

  btn.appendChild(dot);
  btn.appendChild(label);
  btn.appendChild(amount);

  btn.addEventListener('click', onClick);
  return btn;
}

function render() {
  const today = formatLocalDateYYYYMMDD();
  const completed = new Set(getCompletedForDate(today));

  const onceContainer = document.getElementById('once-container');
  const multiContainer = document.getElementById('multiple-container');
  onceContainer.innerHTML = '';
  multiContainer.innerHTML = '';

  const onceTasks = TASKS.filter(t => t.type.toLowerCase() === 'once');
  const multipleTasks = TASKS.filter(t => t.type.toLowerCase() === 'multiple');

  // Only render once tasks that are NOT completed today
  for (const t of onceTasks) {
    if (!completed.has(t.label)) {
      const el = makeTaskElement(t, () => {
        setRunningTotal(getRunningTotal() + t.amount);
        // mark done for today and remove element for tight layout
        completed.add(t.label);
        setCompletedForDate(today, Array.from(completed));
        el.remove();
      });
      onceContainer.appendChild(el);
    }
  }

  // Render multiples (always visible)
  for (const t of multipleTasks) {
    const el = makeTaskElement(t, () => {
      setRunningTotal(getRunningTotal() + t.amount);
      // simple visual feedback
      el.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], {
        duration: 120, easing: 'ease-out'
      });
    });
    multiContainer.appendChild(el);
  }
}

function tickMidnightWatcher() {
  let lastDate = localStorage.getItem(STORAGE_KEYS.DATE) || formatLocalDateYYYYMMDD();
  const check = () => {
    const nowDate = formatLocalDateYYYYMMDD();
    if (nowDate !== lastDate) {
      lastDate = nowDate;
      localStorage.setItem(STORAGE_KEYS.DATE, nowDate);
      // New day: reset only the “once” completion set by *having a new key*.
      // Re-render will show all once tasks again.
      render();
    }
  };
  // Check every 15s (lightweight)
  setInterval(check, 15000);
  // Also set on load
  localStorage.setItem(STORAGE_KEYS.DATE, lastDate);
}

function init() {
  // Initialize displayed total
  setRunningTotal(getRunningTotal());
  render();
  tickMidnightWatcher();
}

document.addEventListener('DOMContentLoaded', init);
