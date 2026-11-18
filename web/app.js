import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut as fbSignOut,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCCcvAtapET3ZJRrUVx5LhwqmOqly_AaNE',
  authDomain: 'gen-lang-client-0825946280.firebaseapp.com',
  projectId: 'gen-lang-client-0825946280',
  storageBucket: 'gen-lang-client-0825946280.firebasestorage.app',
  messagingSenderId: '991096920015',
};
const FIRESTORE_DB_ID = 'ai-studio-android-luminaai-b56decd0-dfb6-4290-89e6-09abe46bcdbe';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const CURATED_MODELS = [
  { id: 'gemini-4-hydrogen', displayName: 'Gemini 4 Hydrogen', badge: 'Flagship • 5 RPM • 20 RPD', description: 'Next-gen Gemini 4 reasoning for Combined Maths, Physics & Chemistry.', supportsThinking: true, supportsSearch: false },
  { id: 'gemini-3.8-flash', displayName: 'Gemini 3.8 Flash', badge: 'Flash • 5 RPM • 20 RPD', description: 'High-precision multimodal Gemini 3.8 Flash with deep thinking.', supportsThinking: true, supportsSearch: false },
  { id: 'gemini-3.6-flash', displayName: 'Gemini 3.6 Flash', badge: 'Flash • 5 RPM • 20 RPD', description: 'Fast STEM problem solving, derivations, and diagram generation.', supportsThinking: true, supportsSearch: false },
  { id: 'gemini-3.5-flash-lite', displayName: 'Gemini 3.5 Flash-Lite', badge: 'High Quota • 15 RPM • 500 RPD', description: '500 daily requests at 15 RPM — ideal for long study sessions.', supportsThinking: false, supportsSearch: false },
  { id: 'gemini-3.1-flash-lite-preview', displayName: 'Gemini 3.1 Flash-Lite', badge: 'High Quota • 15 RPM • 500 RPD', description: '500 daily requests with fast multimodal responsiveness.', supportsThinking: false, supportsSearch: false },
  { id: 'gemini-3-flash-preview', displayName: 'Gemini 3 Flash', badge: 'Flash • 5 RPM • 20 RPD', description: 'Balanced Gemini 3 Flash for reasoning, code, and explanations.', supportsThinking: true, supportsSearch: false },
  { id: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', badge: 'Search 1.5K RPD • 5 RPM • 20 RPD', description: 'Supports 1,500/day Google Search grounding, thinking traces, and vision.', supportsThinking: true, supportsSearch: true },
  { id: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash-Lite', badge: 'Search 1.5K RPD • 10 RPM • 20 RPD', description: 'Lightweight 2.5 model with 10 RPM and Search grounding support.', supportsThinking: false, supportsSearch: true },
  { id: 'gemma-4-31b-it', displayName: 'Gemma 4 31B', badge: 'Ultra Quota • 30 RPM • 14.4K RPD', description: '14,400 daily requests — open-weights powerhouse for STEM practice.', supportsThinking: false, supportsSearch: false },
  { id: 'gemma-4-26b-it', displayName: 'Gemma 4 26B', badge: 'Ultra Quota • 30 RPM • 14.4K RPD', description: '14,400 daily requests at 30 RPM for fast iterative problem solving.', supportsThinking: false, supportsSearch: false },
  { id: 'gemini-robotics-er-2-preview', displayName: 'Gemini Robotics ER 2', badge: 'Spatial • 5 RPM • 20 RPD', description: 'Embodied spatial & mechanics reasoning for geometry & physics scenes.', supportsThinking: true, supportsSearch: false },
];

const ZERO_QUOTA_KEYWORDS = [
  'argon', 'carbon', 'ultra', 'pro', '2.0-flash', 'gemini-2.0', 'omni',
  'imagen', 'veo', 'lyria', 'nano-banana', '-image', 'image-generation',
  'embedding', 'aqa', 'tts', 'transcribe', 'native-audio', 'live',
  'computer-use', 'deep-research', 'decision', 'exp-1114', 'exp-1121', 'exp-1206', '-001'
];

const STARTER_PROMPTS = [
  'Draw an inclined plane free-body diagram (θ = 30°) & solve for acceleration',
  'සිංහලෙන් පහදන්න: සරල අනුවර්තී චලිතයේ ශක්ති සමීකරණ LaTeX මගින් ලියන්න',
  'Plot y = x³ - 3x with turning points in SVG & find stationary values',
  "Explain Le Chatelier's Principle & draw an exothermic energy profile SVG",
];

// Storage keys
const LS_API_KEY = 'nexora_gemini_api_key';
const LS_MODEL = 'nexora_selected_model';
const LS_THEME = 'nexora_theme';
const LS_THINKING = 'nexora_thinking';
const LS_SEARCH = 'nexora_search';
const LS_SYSTEM = 'nexora_system_instruction';
const LS_ONBOARDED = 'nexora_onboarding_done';
const LS_LOCAL_MODE = 'nexora_local_mode';
const LS_LOCAL_CONVS = 'nexora_local_conversations';
const LS_LOCAL_MSGS = 'nexora_local_messages';

// App State
const state = {
  user: null,
  localMode: localStorage.getItem(LS_LOCAL_MODE) === '1',
  apiKey: localStorage.getItem(LS_API_KEY) || '',
  onboardingDone: localStorage.getItem(LS_ONBOARDED) === '1' || !!(localStorage.getItem(LS_API_KEY)),
  revisitSetup: false,
  selectedModel: localStorage.getItem(LS_MODEL) || 'gemini-4-hydrogen',
  models: [...CURATED_MODELS],
  theme: localStorage.getItem(LS_THEME) || 'system',
  thinking: localStorage.getItem(LS_THINKING) !== '0',
  search: localStorage.getItem(LS_SEARCH) !== '0',
  systemInstruction: localStorage.getItem(LS_SYSTEM) || '',
  conversations: [],
  activeConvId: null,
  messages: [],
  pendingAttachments: [],
  streaming: false,
  abortController: null,
  unsubConvs: null,
  unsubMsgs: null,
  svgZoom: 1,
};

// Firebase initialization
let auth = null;
let db = null;
try {
  const fbApp = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(fbApp);
  db = getFirestore(fbApp, FIRESTORE_DB_ID);
  getRedirectResult(auth).catch(() => {});
} catch (err) {
  console.warn('Firebase init note:', err);
}

// DOM Helpers
const $ = (id) => document.getElementById(id);

function showToast(message, duration = 3000) {
  let toast = $('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function applyTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveDark = state.theme === 'dark' || (state.theme === 'system' && prefersDark);
  document.documentElement.setAttribute('data-theme', effectiveDark ? 'dark' : 'light');
  const labelMap = { system: 'Adaptive', light: 'Light Glass', dark: 'Obsidian' };
  const pill = $('pill-theme');
  if (pill) pill.textContent = `✨ Theme: ${labelMap[state.theme] || 'Adaptive'}`;
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

function switchView(viewId) {
  ['view-auth', 'view-setup', 'view-chat'].forEach((v) => {
    $(v).classList.toggle('hidden', v !== viewId);
  });
}

function renderRouting() {
  if (!state.user && !state.localMode) {
    switchView('view-auth');
    return;
  }
  if (!state.onboardingDone || state.revisitSetup) {
    $('btn-setup-back').classList.toggle('hidden', !state.revisitSetup);
    $('btn-setup-signout').classList.toggle('hidden', state.revisitSetup);
    $('setup-user-subtitle').textContent = state.user?.email
      ? `Signed in as ${state.user.email}`
      : 'Device-only mode — free tier requires no credit card';
    $('input-setup-key').value = state.apiKey;
    switchView('view-setup');
    return;
  }
  switchView('view-chat');
  $('missing-key-banner').classList.toggle('hidden', !!state.apiKey.trim());
  updateActiveModelLabel();
  renderCapabilities();
  renderConversations();
  renderMessages();
}

function updateActiveModelLabel() {
  const model = state.models.find((m) => m.id === state.selectedModel) || CURATED_MODELS[0];
  $('active-model-label').textContent = model.displayName;
}

function renderCapabilities() {
  $('pill-thinking').classList.toggle('active', state.thinking);
  $('pill-search').classList.toggle('active', state.search);
}

// iOS Safari Standalone Detection
function setupIosInstallHint() {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  if (isIos && !isStandalone && !localStorage.getItem('nexora_hide_ios_banner')) {
    $('ios-install-banner').classList.remove('hidden');
  }
  $('btn-dismiss-ios-banner').onclick = () => {
    localStorage.setItem('nexora_hide_ios_banner', '1');
    $('ios-install-banner').classList.add('hidden');
  };
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// Auth Actions
$('btn-google-signin').onclick = async () => {
  if (!auth) {
    showAuthError('Firebase Auth unavailable here — use Device-Only Mode below.');
    return;
  }
  $('auth-error').classList.add('hidden');
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirErr) {
        showAuthError(redirErr.message);
      }
    } else if (err.code === 'auth/unauthorized-domain') {
      showAuthError('Domain not yet authorized in Firebase Console. Use Device-Only Mode below or deploy to Firebase Hosting.');
    } else {
      showAuthError(err.message || 'Sign-in cancelled.');
    }
  }
};

$('btn-local-mode').onclick = () => {
  state.localMode = true;
  localStorage.setItem(LS_LOCAL_MODE, '1');
  loadLocalConversations();
  renderRouting();
  showToast('📱 Device-Only Mode • Built by Era_editz');
};

function showAuthError(msg) {
  const el = $('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

async function handleSignOut() {
  cleanupFirestoreListeners();
  state.localMode = false;
  localStorage.removeItem(LS_LOCAL_MODE);
  state.activeConvId = null;
  state.conversations = [];
  state.messages = [];
  state.revisitSetup = false;
  if (auth && state.user) {
    await fbSignOut(auth).catch(() => {});
  }
  state.user = null;
  renderRouting();
}

if (auth) {
  onAuthStateChanged(auth, (user) => {
    state.user = user;
    cleanupFirestoreListeners();
    if (user) {
      state.localMode = false;
      localStorage.removeItem(LS_LOCAL_MODE);
      subscribeConversations(user.uid);
      if (state.apiKey) verifyAndRefreshModels(state.apiKey, true);
      showToast('✨ Signed in • Built by Era_editz');
    } else if (state.localMode) {
      loadLocalConversations();
    }
    renderRouting();
  });
}

// API Key Verification & Model Discovery
async function verifyAndRefreshModels(apiKey, silent = false) {
  const trimmed = apiKey.trim();
  if (!trimmed) throw new Error('API key is required.');
  const res = await fetch(`${GEMINI_BASE_URL}/models?pageSize=200`, {
    headers: { 'x-goog-api-key': trimmed },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }
  const discovered = [];
  for (const m of data.models || []) {
    const id = (m.name || '').replace(/^models\//, '');
    const methods = m.supportedGenerationMethods || [];
    if (!methods.includes('generateContent')) continue;
    const lower = id.toLowerCase();
    if (!lower.startsWith('gemini-') && !lower.startsWith('gemma-')) continue;
    if (ZERO_QUOTA_KEYWORDS.some((kw) => lower.includes(kw))) continue;
    const curated = CURATED_MODELS.find((c) => normalizeFamily(c.id) === normalizeFamily(id));
    discovered.push({
      id,
      displayName: m.displayName || curated?.displayName || id,
      badge: curated?.badge || 'Free Tier',
      description: curated?.description || m.description || 'Discovered via your Gemini API key.',
      supportsThinking: curated ? curated.supportsThinking : !lower.includes('lite') && !lower.includes('gemma'),
      supportsSearch: lower.includes('2.5') || lower.includes('gemini-2'),
    });
  }
  if (discovered.length > 0) {
    const families = new Set(discovered.map((d) => normalizeFamily(d.id)));
    const missing = CURATED_MODELS.filter((c) => !families.has(normalizeFamily(c.id)));
    state.models = [...discovered, ...missing];
    if (!state.models.some((m) => m.id === state.selectedModel)) {
      const match = state.models.find((m) => normalizeFamily(m.id) === normalizeFamily(state.selectedModel)) || state.models[0];
      state.selectedModel = match.id;
      localStorage.setItem(LS_MODEL, match.id);
    }
  }
  if (!silent) updateActiveModelLabel();
  return state.models.length;
}

function normalizeFamily(id) {
  return id.toLowerCase().replace(/^models\//, '').replace(/-preview$/, '').replace(/-latest$/, '');
}

// Setup Screen Actions
$('btn-paste-key').onclick = async () => {
  try {
    const text = (await navigator.clipboard.readText()).trim();
    if (text) $('input-setup-key').value = text;
  } catch {
    $('input-setup-key').focus();
  }
};

$('btn-toggle-key-vis').onclick = () => {
  const inp = $('input-setup-key');
  inp.type = inp.type === 'password' ? 'text' : 'password';
};

$('btn-verify-continue').onclick = async () => {
  const key = $('input-setup-key').value.trim();
  const statusEl = $('setup-status');
  statusEl.classList.remove('hidden');
  if (!key) {
    statusEl.style.color = 'var(--danger)';
    statusEl.textContent = 'Please paste your Google AI Studio API key first.';
    return;
  }
  $('btn-verify-continue').disabled = true;
  statusEl.style.color = 'var(--text-secondary)';
  statusEl.textContent = 'Verifying key with Google AI Studio...';
  try {
    const count = await verifyAndRefreshModels(key);
    state.apiKey = key;
    state.onboardingDone = true;
    state.revisitSetup = false;
    localStorage.setItem(LS_API_KEY, key);
    localStorage.setItem(LS_ONBOARDED, '1');
    statusEl.style.color = 'var(--success)';
    statusEl.textContent = `Verified! ${count} free-tier models unlocked.`;
    setTimeout(renderRouting, 450);
  } catch (err) {
    statusEl.style.color = 'var(--danger)';
    statusEl.textContent = err.message || 'Invalid API key.';
  } finally {
    $('btn-verify-continue').disabled = false;
  }
};

$('btn-skip-setup').onclick = () => {
  state.onboardingDone = true;
  state.revisitSetup = false;
  localStorage.setItem(LS_ONBOARDED, '1');
  renderRouting();
};

$('btn-setup-back').onclick = () => {
  state.revisitSetup = false;
  renderRouting();
};

$('btn-setup-signout').onclick = handleSignOut;

// Interactive Tutorial Video Player
const TUTORIAL_SCENES = [
  {
    time: '0:00 – 0:06',
    url: 'aistudio.google.com/apikey',
    caption: 'Visit aistudio.google.com/apikey in Safari and sign in with Google',
    html: '<div style="font-weight:700; font-size:1.05rem;">Google AI Studio</div><div style="padding:8px 16px; border-radius:999px; border:1px solid #38bdf8; background:rgba(56,189,248,0.2);">Sign in with Google Account</div>',
  },
  {
    time: '0:06 – 0:12',
    url: 'aistudio.google.com/apikey',
    caption: 'Tap "+ Create API key" → "Create API key in new project"',
    html: '<div style="padding:10px 18px; border-radius:14px; background:#2563eb; font-weight:700; box-shadow:0 0 0 3px rgba(147,197,253,0.5);">+ Create API key 👆</div>',
  },
  {
    time: '0:12 – 0:18',
    url: 'aistudio.google.com/apikey',
    caption: 'Tap Copy next to your generated AIza... key',
    html: '<div style="display:flex; gap:12px; align-items:center; background:rgba(255,255,255,0.1); padding:10px 14px; border-radius:12px;"><span class="mono">AIzaSyD9x•••7KpQ</span><span style="color:#34d399; font-weight:700;">📋 Copy</span></div>',
  },
  {
    time: '0:18 – 0:24',
    url: 'NEXORA • Setup',
    caption: 'Paste into NEXORA to unlock Gemini 4 Hydrogen, 3.8 Flash & Gemma 4',
    html: '<div style="color:#34d399; font-weight:700; font-size:1.02rem;">✓ 11 Free-Tier Models Connected!</div><div style="font-size:0.78rem; color:#cbd5e1;">Gemini 4 Hydrogen • 3.8 Flash • Gemma 4</div>',
  },
];

let tutStep = 0;
let tutPct = 0;
let tutPlaying = true;

function renderTutorialFrame() {
  const s = TUTORIAL_SCENES[tutStep];
  $('tutorial-time-label').textContent = s.time;
  $('tutorial-url').textContent = s.url;
  $('tutorial-caption').textContent = s.caption;
  $('tutorial-stage').innerHTML = s.html;
  const overall = ((tutStep + tutPct / 100) / TUTORIAL_SCENES.length) * 100;
  $('tutorial-progress').style.width = `${overall}%`;
  const dots = $('tutorial-step-dots');
  dots.innerHTML = '';
  TUTORIAL_SCENES.forEach((_, idx) => {
    const b = document.createElement('button');
    b.className = idx === tutStep ? 'cap-pill active' : 'cap-pill';
    b.textContent = String(idx + 1);
    b.onclick = () => {
      tutStep = idx;
      tutPct = 0;
      renderTutorialFrame();
    };
    dots.appendChild(b);
  });
}

setInterval(() => {
  if (!tutPlaying || $('view-setup').classList.contains('hidden')) return;
  tutPct += 2.5;
  if (tutPct >= 100) {
    tutPct = 0;
    tutStep = (tutStep + 1) % TUTORIAL_SCENES.length;
  }
  renderTutorialFrame();
}, 150);

$('btn-tutorial-play').onclick = () => {
  tutPlaying = !tutPlaying;
  $('btn-tutorial-play').textContent = tutPlaying ? 'Pause' : 'Play';
};
$('btn-tutorial-replay').onclick = () => {
  tutStep = 0;
  tutPct = 0;
  tutPlaying = true;
  $('btn-tutorial-play').textContent = 'Pause';
  renderTutorialFrame();
};
renderTutorialFrame();

// Firestore & Local Persistence
function cleanupFirestoreListeners() {
  if (state.unsubConvs) { state.unsubConvs(); state.unsubConvs = null; }
  if (state.unsubMsgs) { state.unsubMsgs(); state.unsubMsgs = null; }
}

function subscribeConversations(uid) {
  if (!db) return;
  const convRef = collection(db, 'users', uid, 'conversations');
  state.unsubConvs = onSnapshot(convRef, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => {
      if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
      const ta = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
      const tb = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    state.conversations = list;
    renderConversations();
  });
}

function subscribeMessages(uid, convId) {
  if (state.unsubMsgs) { state.unsubMsgs(); state.unsubMsgs = null; }
  if (!db || !convId) {
    state.messages = [];
    renderMessages();
    return;
  }
  const q = query(collection(db, 'users', uid, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc'));
  state.unsubMsgs = onSnapshot(q, (snap) => {
    state.messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderMessages();
  });
}

function loadLocalConversations() {
  state.conversations = JSON.parse(localStorage.getItem(LS_LOCAL_CONVS) || '[]');
  const allMsgs = JSON.parse(localStorage.getItem(LS_LOCAL_MSGS) || '{}');
  state.messages = state.activeConvId ? (allMsgs[state.activeConvId] || []) : [];
}

function saveLocalState() {
  localStorage.setItem(LS_LOCAL_CONVS, JSON.stringify(state.conversations));
}

async function createConversation(title, modelId, preview) {
  const convId = `conv_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  if (state.user && db) {
    const uid = state.user.uid;
    await setDoc(doc(db, 'users', uid, 'conversations', convId), {
      userId: uid,
      title: title.slice(0, 120) || 'New Chat',
      modelId,
      isPinned: false,
      lastMessagePreview: preview.slice(0, 300),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    subscribeMessages(uid, convId);
  } else {
    state.conversations.unshift({
      id: convId,
      title: title.slice(0, 120) || 'New Chat',
      modelId,
      isPinned: false,
      lastMessagePreview: preview.slice(0, 300),
      updatedAtMs: Date.now(),
    });
    saveLocalState();
    renderConversations();
  }
  state.activeConvId = convId;
  return convId;
}

async function addMessage(convId, role, text, thoughtSummary, modelId, citations = [], attachmentNames = []) {
  const msgId = `msg_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  if (state.user && db) {
    const uid = state.user.uid;
    const batch = writeBatch(db);
    const payload = {
      userId: uid,
      role,
      text: text.slice(0, 100000),
      modelId,
      createdAt: serverTimestamp(),
    };
    if (thoughtSummary) payload.thoughtSummary = thoughtSummary.slice(0, 100000);
    if (citations.length) payload.citations = citations.slice(0, 25);
    if (attachmentNames.length) payload.attachmentNames = attachmentNames.slice(0, 10);
    batch.set(doc(db, 'users', uid, 'conversations', convId, 'messages', msgId), payload);
    batch.update(doc(db, 'users', uid, 'conversations', convId), {
      lastMessagePreview: text.replace(/\n/g, ' ').slice(0, 300),
      modelId,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } else {
    const allMsgs = JSON.parse(localStorage.getItem(LS_LOCAL_MSGS) || '{}');
    const arr = allMsgs[convId] || [];
    arr.push({ id: msgId, role, text, thoughtSummary, modelId, citations, attachmentNames });
    allMsgs[convId] = arr;
    localStorage.setItem(LS_LOCAL_MSGS, JSON.stringify(allMsgs));
    state.messages = arr;
    const c = state.conversations.find((x) => x.id === convId);
    if (c) {
      c.lastMessagePreview = text.replace(/\n/g, ' ').slice(0, 300);
      saveLocalState();
    }
    renderMessages();
    renderConversations();
  }
}

async function deleteConversation(convId) {
  if (state.activeConvId === convId) {
    state.activeConvId = null;
    state.messages = [];
  }
  if (state.user && db) {
    const uid = state.user.uid;
    const snap = await getDocs(collection(db, 'users', uid, 'conversations', convId, 'messages'));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, 'users', uid, 'conversations', convId));
    await batch.commit();
  } else {
    state.conversations = state.conversations.filter((c) => c.id !== convId);
    const allMsgs = JSON.parse(localStorage.getItem(LS_LOCAL_MSGS) || '{}');
    delete allMsgs[convId];
    localStorage.setItem(LS_LOCAL_MSGS, JSON.stringify(allMsgs));
    saveLocalState();
    renderConversations();
    renderMessages();
  }
}

// Sidebar & Drawer
function setDrawerOpen(open) {
  $('sidebar').classList.toggle('open', open);
  $('drawer-backdrop').classList.toggle('hidden', !open);
}

$('btn-open-drawer').onclick = () => setDrawerOpen(true);
$('drawer-backdrop').onclick = () => setDrawerOpen(false);
$('input-history-search').oninput = renderConversations;

function startNewChat() {
  state.activeConvId = null;
  state.messages = [];
  if (state.unsubMsgs) { state.unsubMsgs(); state.unsubMsgs = null; }
  setDrawerOpen(false);
  renderConversations();
  renderMessages();
}

$('btn-new-chat').onclick = startNewChat;
$('btn-top-new').onclick = startNewChat;

function renderConversations() {
  const q = ($('input-history-search').value || '').toLowerCase();
  const list = state.conversations.filter((c) =>
    !q || (c.title || '').toLowerCase().includes(q) || (c.lastMessagePreview || '').toLowerCase().includes(q)
  );
  const el = $('conv-list');
  el.innerHTML = '';
  if (!list.length) {
    el.innerHTML = '<div class="muted-copy" style="text-align:center; padding:24px 8px;">No conversations yet</div>';
    return;
  }
  list.forEach((c) => {
    const row = document.createElement('div');
    row.className = `conv-item${c.id === state.activeConvId ? ' active' : ''}`;
    const info = document.createElement('div');
    info.style.minWidth = '0';
    info.style.flex = '1';
    info.innerHTML = `<div style="font-weight:700; font-size:0.88rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(c.title || 'New Chat')}</div>
      <div class="muted-copy" style="font-size:0.75rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(c.lastMessagePreview || '')}</div>`;
    const del = document.createElement('button');
    del.className = 'btn-text';
    del.style.color = 'var(--danger)';
    del.textContent = '🗑';
    del.onclick = (e) => {
      e.stopPropagation();
      deleteConversation(c.id);
    };
    row.onclick = () => {
      state.activeConvId = c.id;
      if (c.modelId) {
        state.selectedModel = c.modelId;
        localStorage.setItem(LS_MODEL, c.modelId);
        updateActiveModelLabel();
      }
      if (state.user && db) {
        subscribeMessages(state.user.uid, c.id);
      } else {
        const allMsgs = JSON.parse(localStorage.getItem(LS_LOCAL_MSGS) || '{}');
        state.messages = allMsgs[c.id] || [];
        renderMessages();
      }
      setDrawerOpen(false);
      renderConversations();
    };
    row.appendChild(info);
    row.appendChild(del);
    el.appendChild(row);
  });
}

// LaTeX + Sinhala + Markdown + SVG Renderer
function normalizeMathAndSinhala(raw) {
  const mathBlockRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\s)[^$\n]*?(?<!\s)\$)/g;
  return raw.replace(mathBlockRegex, (seg) => {
    const tok = /(\\(?:text|textrm|textbf|mathrm|operatorname)\{[^{}]*\}|[\u0D80-\u0DFF][\u0D80-\u0DFF\u200D\u200C0-9\s.,:/\-()]*)/g;
    return seg.replace(tok, (v) => {
      if (v.startsWith('\\')) return v;
      if (!/[\u0D80-\u0DFF]/.test(v)) return v;
      const lead = v.match(/^\s*/)[0];
      const trail = v.match(/\s*$/)[0];
      const core = v.trim();
      return `${lead}\\text{${core}}${trail}`;
    });
  });
}

function sanitizeSvg(rawSvg) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return null;
  svg.querySelectorAll('script,foreignObject').forEach((n) => n.remove());
  svg.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (attr.name.toLowerCase().startsWith('on') || attr.value.toLowerCase().includes('javascript:')) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return svg.outerHTML;
}

function renderRichMarkdownInto(container, markdownText) {
  container.innerHTML = '';
  const blocks = splitCodeAndMathBlocks(markdownText);

  blocks.forEach((b) => {
    if (b.type === 'svg') {
      const cleanSvg = sanitizeSvg(b.content);
      if (cleanSvg) {
        const card = document.createElement('div');
        card.className = 'glass svg-card';
        card.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.82rem; color:var(--accent);">🔬 Interactive STEM Diagram</strong>
            <div style="display:flex; gap:6px;">
              <button class="btn-text svg-expand-btn" style="padding:4px 8px;">⛶ Expand</button>
              <button class="btn-text svg-src-btn" style="padding:4px 8px;">&lt;/&gt; SVG</button>
            </div>
          </div>
          <div class="svg-canvas-box">${cleanSvg}</div>
          <div class="code-card hidden"><pre>${escapeHtml(b.content)}</pre></div>`;
        const box = card.querySelector('.svg-canvas-box');
        const srcBox = card.querySelector('.code-card');
        card.querySelector('.svg-expand-btn').onclick = () => openFullscreenSvg(cleanSvg);
        box.onclick = () => openFullscreenSvg(cleanSvg);
        card.querySelector('.svg-src-btn').onclick = (e) => {
          const showingSrc = !srcBox.classList.contains('hidden');
          srcBox.classList.toggle('hidden', showingSrc);
          box.classList.toggle('hidden', !showingSrc);
          e.target.textContent = showingSrc ? '</> SVG' : 'Diagram';
        };
        container.appendChild(card);
        return;
      }
    }

    if (b.type === 'code') {
      const card = document.createElement('div');
      card.className = 'code-card';
      card.innerHTML = `<div class="code-card-head"><span>${escapeHtml(b.lang || 'code')}</span><button class="btn-text copy-code-btn" style="padding:2px 6px;">Copy</button></div><pre>${escapeHtml(b.content)}</pre>`;
      card.querySelector('.copy-code-btn').onclick = (e) => {
        navigator.clipboard?.writeText(b.content);
        e.target.textContent = 'Copied';
      };
      container.appendChild(card);
      return;
    }

    // Text / Math segment
    const div = document.createElement('div');
    const normalized = normalizeMathAndSinhala(b.content);
    div.innerHTML = formatMarkdownWithProtectedMath(normalized);
    if (window.renderMathInElement) {
      window.renderMathInElement(div, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
        ],
        throwOnError: false,
        strict: false,
        trust: true,
      });
    }
    container.appendChild(div);
  });
}

function splitCodeAndMathBlocks(input) {
  const lines = input.split('\n');
  const out = [];
  let buf = [];
  let inCode = false;
  let lang = '';

  const flushText = () => {
    const t = buf.join('\n').trim();
    if (t) out.push({ type: 'text', content: t });
    buf = [];
  };

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```')) {
      if (!inCode) {
        flushText();
        inCode = true;
        lang = trimmed.slice(3).trim().toLowerCase();
      } else {
        const content = buf.join('\n');
        const isSvg = lang === 'svg' || content.trimStart().toLowerCase().startsWith('<svg');
        out.push({ type: isSvg ? 'svg' : 'code', lang, content });
        buf = [];
        inCode = false;
        lang = '';
      }
    } else {
      buf.push(line);
    }
  }
  if (buf.length) {
    if (inCode) {
      const content = buf.join('\n');
      const isSvg = lang === 'svg' || content.trimStart().toLowerCase().startsWith('<svg');
      out.push({ type: isSvg ? 'svg' : 'code', lang, content });
    } else {
      flushText();
    }
  }
  return out;
}

function formatMarkdownWithProtectedMath(raw) {
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\s)[^$\n]*?(?<!\s)\$)/g;
  const protectedBlocks = [];
  const placeholderText = raw.replace(mathRegex, (m) => {
    const key = `@@NEXORAMATH${protectedBlocks.length}@@`;
    protectedBlocks.push(escapeHtml(m));
    return key;
  });

  const htmlLines = placeholderText.split('\n').map((line) => {
    let l = escapeHtml(line);
    if (l.startsWith('### ')) return `<h3>${inlineMd(l.slice(4))}</h3>`;
    if (l.startsWith('## ')) return `<h2>${inlineMd(l.slice(3))}</h2>`;
    if (l.startsWith('# ')) return `<h1>${inlineMd(l.slice(2))}</h1>`;
    if (l.startsWith('- ') || l.startsWith('* ')) return `<div>• ${inlineMd(l.slice(2))}</div>`;
    return l.trim() === '' ? '<div style="height:8px"></div>' : `<div>${inlineMd(l)}</div>`;
  }).join('');

  return htmlLines.replace(/@@NEXORAMATH(\d+)@@/g, (_, idx) => protectedBlocks[Number(idx)]);
}

function inlineMd(s) {
  return s
    .replace(/`([^`]+)`/g, '<code class="mono" style="background:rgba(128,148,180,0.18); padding:1px 5px; border-radius:6px; font-size:0.86em;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">$1</a>');
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function openFullscreenSvg(svgMarkup) {
  state.svgZoom = 1;
  const stage = $('svg-fullscreen-stage');
  stage.innerHTML = svgMarkup;
  const svg = stage.querySelector('svg');
  if (svg) {
    svg.style.width = '100%';
    svg.style.maxWidth = '820px';
    svg.style.transformOrigin = 'center center';
  }
  $('modal-svg').classList.remove('hidden');
}

$('btn-svg-zoom-in').onclick = () => {
  state.svgZoom = Math.min(4, state.svgZoom + 0.35);
  const svg = $('svg-fullscreen-stage').querySelector('svg');
  if (svg) svg.style.transform = `scale(${state.svgZoom})`;
};
$('btn-svg-zoom-out').onclick = () => {
  state.svgZoom = Math.max(0.6, state.svgZoom - 0.35);
  const svg = $('svg-fullscreen-stage').querySelector('svg');
  if (svg) svg.style.transform = `scale(${state.svgZoom})`;
};
$('btn-svg-reset').onclick = () => {
  state.svgZoom = 1;
  const svg = $('svg-fullscreen-stage').querySelector('svg');
  if (svg) svg.style.transform = 'scale(1)';
};
$('btn-svg-close').onclick = () => $('modal-svg').classList.add('hidden');

// Render Messages
function renderMessages(streamingTurn = null) {
  const container = $('messages-inner');
  container.innerHTML = '';
  const all = [...state.messages];
  if (streamingTurn) all.push(streamingTurn);

  if (!all.length) {
    const model = state.models.find((m) => m.id === state.selectedModel) || CURATED_MODELS[0];
    const welcome = document.createElement('div');
    welcome.className = 'empty-welcome';
    welcome.innerHTML = `<img src="./assets/icon-512.png" alt="NEXORA" class="emblem" style="width:84px; height:84px;" />
      <h2 class="brand-title" style="font-size:1.85rem;">NEXORA</h2>
      <div class="brand-tagline">THINK. SOLVE. MASTER.</div>
      <div class="brand-subjects">COMBINED MATHEMATICS • PHYSICS • CHEMISTRY.</div>
      <p class="muted-copy" style="font-size:0.82rem; margin-top:8px;">Powered by ${escapeHtml(model.displayName)} • Free-Tier Active</p>
      <div class="starter-grid"></div>`;
    const grid = welcome.querySelector('.starter-grid');
    STARTER_PROMPTS.forEach((p) => {
      const chip = document.createElement('button');
      chip.className = 'glass starter-chip';
      chip.textContent = p;
      chip.onclick = () => {
        $('composer-input').value = p;
        $('composer-input').focus();
      };
      grid.appendChild(chip);
    });
    container.appendChild(welcome);
    return;
  }

  all.forEach((m) => {
    if (m.role === 'user') {
      const wrap = document.createElement('div');
      wrap.className = 'msg-user-wrap';
      const bubble = document.createElement('div');
      bubble.className = 'msg-user';
      bubble.textContent = m.text;
      wrap.appendChild(bubble);
      container.appendChild(wrap);
    } else {
      const bubble = document.createElement('div');
      bubble.className = 'glass msg-model';
      const modelName = (state.models.find((x) => x.id === m.modelId) || CURATED_MODELS[0]).displayName;
      const head = document.createElement('div');
      head.className = 'msg-header';
      head.textContent = `✦ ${modelName}${m.isStreaming ? ' • Streaming' : ''}`;
      bubble.appendChild(head);

      if (m.thoughtSummary) {
        const th = document.createElement('details');
        th.className = 'thought-box';
        if (m.isStreaming && !m.text) th.open = true;
        th.innerHTML = `<summary style="cursor:pointer; font-weight:700; color:var(--accent-2);">🧠 Thought Process</summary><div style="margin-top:6px; white-space:pre-wrap;">${escapeHtml(m.thoughtSummary)}</div>`;
        bubble.appendChild(th);
      }

      const body = document.createElement('div');
      body.className = 'msg-body';
      if (m.text) {
        renderRichMarkdownInto(body, m.text);
      } else if (m.isStreaming) {
        body.innerHTML = '<span class="muted-copy">Synthesizing response...</span>';
      }
      bubble.appendChild(body);

      if (m.citations && m.citations.length) {
        const cites = document.createElement('div');
        cites.style.display = 'flex';
        cites.style.flexWrap = 'wrap';
        cites.style.gap = '6px';
        m.citations.forEach((c) => {
          const a = document.createElement('a');
          a.href = c.uri;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'glass-pill';
          a.style.padding = '5px 10px';
          a.style.fontSize = '0.75rem';
          a.style.textDecoration = 'none';
          a.style.color = 'var(--text-primary)';
          a.textContent = `🌐 ${(c.title || c.uri).slice(0, 34)}`;
          cites.appendChild(a);
        });
        bubble.appendChild(cites);
      }

      if (!m.isStreaming && m.text) {
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-text';
        copyBtn.textContent = '📋 Copy';
        copyBtn.onclick = () => {
          navigator.clipboard?.writeText(m.text);
          copyBtn.textContent = '✓ Copied';
        };
        const speakBtn = document.createElement('button');
        speakBtn.className = 'btn-text';
        speakBtn.textContent = '🔊 Read';
        speakBtn.onclick = () => {
          if (!('speechSynthesis' in window)) return;
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(m.text.replace(/```[\s\S]*?```/g, 'Diagram omitted.'));
          window.speechSynthesis.speak(u);
        };
        actions.appendChild(copyBtn);
        actions.appendChild(speakBtn);
        bubble.appendChild(actions);
      }
      container.appendChild(bubble);
    }
  });

  const sc = $('messages-scroll');
  sc.scrollTop = sc.scrollHeight;
}

// Attachments
$('file-input').onchange = async (e) => {
  const files = [...(e.target.files || [])].slice(0, 5 - state.pendingAttachments.length);
  for (const file of files) {
    const base64 = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.readAsDataURL(file);
    });
    state.pendingAttachments.push({
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      base64Data: base64,
    });
  }
  e.target.value = '';
  renderAttachmentStrip();
};

function renderAttachmentStrip() {
  const strip = $('attachment-strip');
  strip.innerHTML = '';
  strip.classList.toggle('hidden', state.pendingAttachments.length === 0);
  state.pendingAttachments.forEach((att) => {
    const pill = document.createElement('span');
    pill.className = 'glass-pill';
    pill.style.padding = '4px 10px';
    pill.style.fontSize = '0.76rem';
    pill.style.display = 'inline-flex';
    pill.style.alignItems = 'center';
    pill.style.gap = '6px';
    pill.innerHTML = `<span>📎 ${escapeHtml(att.name)}</span>`;
    const x = document.createElement('button');
    x.className = 'btn-text';
    x.style.padding = '0 4px';
    x.textContent = '✕';
    x.onclick = () => {
      state.pendingAttachments = state.pendingAttachments.filter((a) => a.id !== att.id);
      renderAttachmentStrip();
    };
    pill.appendChild(x);
    strip.appendChild(pill);
  });
}

// Gemini Streaming Send
async function sendPrompt() {
  if (state.streaming) {
    state.abortController?.abort();
    return;
  }
  if (!state.apiKey.trim()) {
    state.revisitSetup = true;
    renderRouting();
    return;
  }
  const inp = $('composer-input');
  const prompt = inp.value.trim();
  const attachments = [...state.pendingAttachments];
  if (!prompt && !attachments.length) return;

  inp.value = '';
  state.pendingAttachments = [];
  renderAttachmentStrip();

  const modelId = state.selectedModel;
  const modelObj = state.models.find((m) => m.id === modelId) || CURATED_MODELS[0];
  const historySnapshot = [...state.messages];

  const convId = state.activeConvId || await createConversation(
    prompt || attachments[0]?.name || 'STEM Chat',
    modelId,
    prompt || `Attached ${attachments.length} file(s)`
  );
  await addMessage(convId, 'user', prompt || 'Analyze attached file(s).', '', modelId, [], attachments.map((a) => a.name));

  state.streaming = true;
  state.abortController = new AbortController();
  $('btn-send').textContent = '■';
  $('btn-send').classList.add('stop');

  let textBuf = '';
  let thoughtBuf = '';
  let citations = [];
  const updateLive = () => renderMessages({
    role: 'model',
    text: textBuf,
    thoughtSummary: thoughtBuf,
    modelId,
    citations,
    isStreaming: true,
  });
  updateLive();

  try {
    const isGemma = modelId.toLowerCase().includes('gemma');
    const attachTools = state.search && !isGemma && (modelId.includes('2.5') || modelId.includes('gemini-2'));
    await runGeminiSse(modelId, modelObj, historySnapshot, prompt, attachments, attachTools, (evt) => {
      if (evt.thought) thoughtBuf += evt.thought;
      if (evt.text) textBuf += evt.text;
      if (evt.citations) citations = evt.citations;
      updateLive();
    });
  } catch (err) {
    if (err.name !== 'AbortError') {
      textBuf += `\n\n**Error:** ${err.message}`;
    }
  } finally {
    state.streaming = false;
    $('btn-send').textContent = '↑';
    $('btn-send').classList.remove('stop');
    if (textBuf.trim()) {
      await addMessage(convId, 'model', textBuf.trim(), thoughtBuf.trim(), modelId, citations);
    } else {
      renderMessages();
    }
  }
}

async function runGeminiSse(modelId, modelObj, history, prompt, attachments, attachTools, onDelta) {
  const isGemma = modelId.toLowerCase().includes('gemma');
  const effectiveSystem =
    'You are NEXORA (THINK. SOLVE. MASTER.), an expert tutor specializing in Combined Mathematics, Physics, and Chemistry.\n' +
    '1. Math & Sinhala: Use LaTeX delimiters ($...$ inline, $$...$$ display). Wrap Sinhala words inside \\text{...} in math blocks.\n' +
    '2. STEM Diagrams: Whenever helpful (free-body forces, circuits, optics, graphs, chemistry energy/molecular diagrams), include a clean self-contained ```svg ... ``` block with viewBox="0 0 600 400", vivid strokes, clear <text> labels, and arrowheads.' +
    (state.systemInstruction ? `\n\nUser Custom Instructions:\n${state.systemInstruction}` : '');

  const contents = [];
  const recent = history.slice(-24).filter((m) => m.text);
  recent.forEach((m, idx) => {
    const role = m.role === 'model' ? 'model' : 'user';
    const txt = (isGemma && idx === 0 && role === 'user')
      ? `[System Context]\n${effectiveSystem}\n\n[User]\n${m.text}`
      : m.text;
    contents.push({ role, parts: [{ text: txt }] });
  });

  const curParts = attachments.map((a) => ({ inlineData: { mimeType: a.mimeType, data: a.base64Data } }));
  const effPrompt = prompt || 'Analyze the attached content in detail.';
  curParts.push({
    text: (isGemma && recent.length === 0)
      ? `[System Context]\n${effectiveSystem}\n\n[User]\n${effPrompt}`
      : effPrompt,
  });
  contents.push({ role: 'user', parts: curParts });

  const body = { contents };
  if (!isGemma) {
    body.systemInstruction = { parts: [{ text: effectiveSystem }] };
    if (modelObj.supportsThinking) {
      body.generationConfig = {
        thinkingConfig: {
          includeThoughts: state.thinking,
          ...(state.thinking ? {} : { thinkingBudget: 0 }),
        },
      };
    }
    if (attachTools) {
      body.tools = [{ google_search: {} }];
    }
  }

  const res = await fetch(`${GEMINI_BASE_URL}/models/${modelId}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': state.apiKey.trim() },
    body: JSON.stringify(body),
    signal: state.abortController.signal,
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === '[DONE]') continue;
      try {
        const parsed = JSON.parse(raw);
        const cand = parsed.candidates?.[0];
        for (const part of cand?.content?.parts || []) {
          if (part.text) {
            onDelta(part.thought ? { thought: part.text } : { text: part.text });
          }
        }
        const chunks = cand?.groundingMetadata?.groundingChunks;
        if (chunks?.length) {
          const cites = chunks
            .map((c) => c.web)
            .filter((w) => w && w.uri)
            .map((w) => ({ title: w.title || w.uri, uri: w.uri }));
          if (cites.length) onDelta({ citations: cites });
        }
      } catch {}
    }
  }
}

// Composer & Quick Pills
$('btn-send').onclick = sendPrompt;
$('composer-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendPrompt();
  }
});

$('pill-thinking').onclick = () => {
  state.thinking = !state.thinking;
  localStorage.setItem(LS_THINKING, state.thinking ? '1' : '0');
  renderCapabilities();
};
$('pill-search').onclick = () => {
  state.search = !state.search;
  localStorage.setItem(LS_SEARCH, state.search ? '1' : '0');
  renderCapabilities();
};
$('pill-theme').onclick = () => {
  const order = ['system', 'light', 'dark'];
  state.theme = order[(order.indexOf(state.theme) + 1) % order.length];
  localStorage.setItem(LS_THEME, state.theme);
  applyTheme();
};

$('btn-voice').onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert('Use the iPhone keyboard microphone button for dictation in Safari.');
    return;
  }
  const rec = new SR();
  rec.onresult = (e) => {
    const t = e.results?.[0]?.[0]?.transcript || '';
    if (t) $('composer-input').value = `${$('composer-input').value} ${t}`.trim();
  };
  rec.start();
};

// Model Picker Modal
$('btn-model-picker').onclick = () => {
  const list = $('models-list');
  list.innerHTML = '';
  state.models.forEach((m) => {
    const card = document.createElement('div');
    card.className = `model-card${m.id === state.selectedModel ? ' selected' : ''}`;
    card.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${escapeHtml(m.displayName)}</strong>
        <span style="font-size:0.74rem; color:var(--success); font-weight:700;">${escapeHtml(m.badge)}</span>
      </div>
      <div class="mono" style="font-size:0.74rem; color:var(--accent); margin:3px 0;">${escapeHtml(m.id)}</div>
      <div class="muted-copy" style="font-size:0.8rem;">${escapeHtml(m.description)}</div>`;
    card.onclick = () => {
      state.selectedModel = m.id;
      localStorage.setItem(LS_MODEL, m.id);
      updateActiveModelLabel();
      $('modal-models').classList.add('hidden');
    };
    list.appendChild(card);
  });
  $('modal-models').classList.remove('hidden');
};
$('btn-close-models').onclick = () => $('modal-models').classList.add('hidden');

// Settings Modal
function openSettings() {
  $('input-settings-key').value = state.apiKey;
  $('input-system-prompt').value = state.systemInstruction;
  $('settings-account-label').textContent = state.user?.email || 'Device-Only Mode';
  $('settings-key-status').classList.add('hidden');
  $('modal-settings').classList.remove('hidden');
}
$('btn-top-settings').onclick = openSettings;
$('btn-drawer-settings').onclick = () => { setDrawerOpen(false); openSettings(); };
$('btn-close-settings').onclick = () => $('modal-settings').classList.add('hidden');

$('btn-save-settings-key').onclick = async () => {
  const key = $('input-settings-key').value.trim();
  const st = $('settings-key-status');
  st.classList.remove('hidden');
  if (!key) {
    state.apiKey = '';
    localStorage.removeItem(LS_API_KEY);
    st.style.color = 'var(--text-secondary)';
    st.textContent = 'API key cleared.';
    $('missing-key-banner').classList.remove('hidden');
    return;
  }
  st.style.color = 'var(--text-secondary)';
  st.textContent = 'Verifying key...';
  try {
    const count = await verifyAndRefreshModels(key);
    state.apiKey = key;
    localStorage.setItem(LS_API_KEY, key);
    st.style.color = 'var(--success)';
    st.textContent = `Connected • ${count} free-tier models available.`;
    $('missing-key-banner').classList.add('hidden');
  } catch (err) {
    st.style.color = 'var(--danger)';
    st.textContent = err.message;
  }
};

$('btn-save-system').onclick = () => {
  state.systemInstruction = $('input-system-prompt').value.trim();
  localStorage.setItem(LS_SYSTEM, state.systemInstruction);
  $('modal-settings').classList.add('hidden');
};

$('btn-open-guide-from-settings').onclick = () => {
  $('modal-settings').classList.add('hidden');
  state.revisitSetup = true;
  renderRouting();
};

$('missing-key-banner').onclick = () => {
  state.revisitSetup = true;
  renderRouting();
};

$('btn-sign-out').onclick = () => {
  $('modal-settings').classList.add('hidden');
  handleSignOut();
};

// Boot
applyTheme();
setupIosInstallHint();
renderRouting();
setTimeout(() => showToast('✨ Built by Era_editz', 3200), 500);
