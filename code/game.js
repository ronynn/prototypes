// game.js - Core engine
const { h, render, useState, useEffect } = preact;
const html = htm.bind(h);
const { setup, tw } = twind;

// ---------- Twind setup ----------
setup({
  theme: {
    extend: {
      colors: {
        paper: '#f5f0e8',
        ink: '#2c2c2c',
        accent: '#b5485d',
      }
    }
  }
});

// ---------- Theme system ----------
const themes = {
  light: {
    '--bg': '#f5f0e8',
    '--text': '#2c2c2c',
    '--accent': '#b5485d',
    '--link': '#0645ad',
    '--border': '#d0c8b8',
  },
  dark: {
    '--bg': '#1a1a1a',
    '--text': '#e0e0e0',
    '--accent': '#ff7f50',
    '--link': '#7aa2f7',
    '--border': '#444',
  },
  sepia: {
    '--bg': '#f4ecd8',
    '--text': '#5b4636',
    '--accent': '#8b5a2b',
    '--link': '#704214',
    '--border': '#d6c3a5'
  }
};

let currentTheme = 'light';
function applyTheme(themeName) {
  if (!themes[themeName]) return;
  currentTheme = themeName;
  const root = document.documentElement;
  Object.entries(themes[themeName]).forEach(([key, val]) => root.style.setProperty(key, val));
  renderApp();
}

// ---------- Game state ----------
const state = {
  currentPassage: 'Start',
  variables: {},
  history: [],
  visited: new Set(['Start']),
};

// ---------- Save / Load ----------
const SAVE_SLOTS = 4;
const SAVE_PREFIX = 'if_save_';

function saveGame(slot) {
  if (slot < 1 || slot > SAVE_SLOTS) return;
  const data = {
    currentPassage: state.currentPassage,
    variables: state.variables,
    history: state.history,
    visited: [...state.visited],
    theme: currentTheme,
    timestamp: Date.now(),
  };
  localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(data));
}

function loadGame(slot) {
  if (slot < 1 || slot > SAVE_SLOTS) return false;
  const raw = localStorage.getItem(SAVE_PREFIX + slot);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    state.currentPassage = data.currentPassage;
    state.variables = data.variables;
    state.history = data.history;
    state.visited = new Set(data.visited || []);
    if (data.theme && themes[data.theme]) applyTheme(data.theme);
    renderApp();
    return true;
  } catch (e) {
    console.error('Load failed', e);
    return false;
  }
}

function getSaveSlotsInfo() {
  const slots = [];
  for (let i = 1; i <= SAVE_SLOTS; i++) {
    const raw = localStorage.getItem(SAVE_PREFIX + i);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        slots.push({ slot: i, passage: data.currentPassage, time: data.timestamp });
      } catch {
        slots.push({ slot: i, passage: 'corrupt', time: 0 });
      }
    } else {
      slots.push({ slot: i, passage: 'empty', time: 0 });
    }
  }
  return slots;
}

// ---------- Passage registry ----------
const passages = {};
function registerPassages(passageObj) {
  Object.assign(passages, passageObj);
}

// ---------- Helper components ----------
function Link({ to, children, className = '' }) {
  const handleClick = (e) => {
    e.preventDefault();
    state.history.push(state.currentPassage);
    state.currentPassage = to;
    state.visited.add(to);
    renderApp();
  };
  return html`<a href="#" onClick=${handleClick}
    class=${tw`text-(var(--link)) underline cursor-pointer hover:opacity-80 ${className}`}>
    ${children}
  </a>`;
}

function BackLink({ children = '← Back' }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (state.history.length > 0) {
      state.currentPassage = state.history.pop();
      renderApp();
    }
  };
  return html`<a href="#" onClick=${handleClick}
    class=${tw`text-(var(--link)) underline cursor-pointer`}>${children}</a>`;
}

function CyclingLink({ variable, choices, label = 'Change' }) {
  const [index, setIndex] = useState(0);
  const handleClick = (e) => {
    e.preventDefault();
    const next = (index + 1) % choices.length;
    setIndex(next);
    state.variables[variable] = choices[next];
    renderApp();
  };
  return html`
    <a href="#" onClick=${handleClick}
       class=${tw`text-(var(--link)) underline cursor-pointer`}>
      ${label}: ${choices[index]}
    </a>
  `;
}

function TextInput({ variable, placeholder = 'Enter text...' }) {
  const [value, setValue] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    state.variables[variable] = value.trim();
    renderApp();
  };
  return html`
    <form onSubmit=${handleSubmit} class=${tw`inline-block`}>
      <input type="text" value=${value} onInput=${(e) => setValue(e.target.value)}
             placeholder=${placeholder}
             class=${tw`px-2 py-1 border border-(var(--border)) rounded bg-transparent text-(var(--text))`} />
      <button type="submit" class=${tw`ml-2 px-3 py-1 bg-(var(--accent)) text-white rounded`}>OK</button>
    </form>
  `;
}

// Conditional wrapper
function If({ condition, children }) {
  return condition ? children : null;
}

// ---------- Main App ----------
function PassageRenderer() {
  const passage = passages[state.currentPassage];
  if (!passage) {
    return html`<div>Passage "${state.currentPassage}" not found.</div>`;
  }
  return passage.render ? passage.render() : passage;
}

function App() {
  const [saveSlots, setSaveSlots] = useState(getSaveSlotsInfo());
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const refreshSlots = () => setSaveSlots(getSaveSlotsInfo());

  const handleSave = (slot) => {
    saveGame(slot);
    refreshSlots();
  };
  const handleLoad = (slot) => {
    if (loadGame(slot)) refreshSlots();
  };

  return html`
    <div class=${tw`min-h-screen bg-(var(--bg)) text-(var(--text)) font-sans p-4`}>
      <!-- Top bar -->
      <div class=${tw`max-w-2xl mx-auto mb-4 flex justify-between items-center`}>
        <h1 class=${tw`text-2xl font-bold`}>📖 Interactive Fiction</h1>
        <div class=${tw`flex gap-2`}>
          <div class=${tw`relative`}>
            <button onClick=${() => setThemeMenuOpen(!themeMenuOpen)}
                    class=${tw`px-3 py-1 border border-(var(--border)) rounded`}>
              Theme: ${currentTheme}
            </button>
            ${themeMenuOpen && html`
              <div class=${tw`absolute right-0 mt-1 bg-(var(--bg)) border border-(var(--border)) rounded shadow-lg z-10`}>
                ${Object.keys(themes).map(t => html`
                  <button key=${t} onClick=${() => { applyTheme(t); setThemeMenuOpen(false); }}
                          class=${tw`block w-full text-left px-4 py-2 hover:bg-(var(--border))`}>
                    ${t}
                  </button>
                `)}
              </div>
            `}
          </div>
          <div class=${tw`relative`}>
            <button onClick=${() => setSaveMenuOpen(!saveMenuOpen)}
                    class=${tw`px-3 py-1 border border-(var(--border)) rounded`}>
              Saves
            </button>
            ${saveMenuOpen && html`
              <div class=${tw`absolute right-0 mt-1 bg-(var(--bg)) border border-(var(--border)) rounded shadow-lg z-10 p-2`}>
                ${saveSlots.map(slot => html`
                  <div key=${slot.slot} class=${tw`flex items-center gap-2 mb-1`}>
                    <span class=${tw`w-24 text-sm`}>Slot ${slot.slot}: ${slot.passage}</span>
                    <button onClick=${() => handleSave(slot.slot)} class=${tw`px-2 py-0.5 bg-(var(--accent)) text-white rounded text-xs`}>Save</button>
                    <button onClick=${() => handleLoad(slot.slot)} class=${tw`px-2 py-0.5 border border-(var(--border)) rounded text-xs`}>Load</button>
                  </div>
                `)}
              </div>
            `}
          </div>
        </div>
      </div>
      <!-- Passage content -->
      <div class=${tw`max-w-2xl mx-auto bg-(var(--bg)) border border-(var(--border)) rounded-lg p-6`}>
        <${PassageRenderer} />
      </div>
    </div>
  `;
}

let appRoot = null;
function renderApp() {
  if (!appRoot) {
    appRoot = document.getElementById('app');
  }
  render(html`<${App} />`, appRoot);
}

// ---------- Initialization ----------
function initGame() {
  applyTheme('light');
  renderApp();
}

// Expose for chapter files
window.registerPassages = registerPassages;
window.Link = Link;
window.BackLink = BackLink;
window.CyclingLink = CyclingLink;
window.TextInput = TextInput;
window.If = If;
window.state = state; // for advanced use