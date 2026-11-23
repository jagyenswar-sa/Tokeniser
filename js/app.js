/**
 * LLM Token Explorer - Application Controller
 * Handles UI state, event listeners, view rendering, and interactive widgets.
 * Features:
 * - Real-time BPE Tokenizer & Metrics
 * - Interactive BPE Vocabulary Builder & Step-by-Step Trainer
 * - 3D Vector Embedding Space with Dynamic Token Injection
 * - Multi-Model Side-by-Side Comparison
 * - Logits & Autoregressive Sampling Simulator
 * - Real-Time API Inference Cost Estimator
 * - Educational Guide
 */

import { MODEL_PROFILES, tokenize, calculateMetrics, compareAllModels } from './tokenizers.js';
import { getRawPredictions, computeSamplingDistribution, sampleNextToken } from './predictor.js';
import { PRICING_MODELS, calculateModelCosts } from './cost.js';
import { BPEVocabularyBuilder } from './vocab-builder.js';
import { EmbeddingVisualizer3D, CLUSTER_CONFIG } from './embeddings-3d.js';

// Pre-curated Prompts
const PRESETS = {
  english: "The quick brown fox jumps over the lazy dog.",
  multilingual: "Bonjour le monde! こんにちは世界！ Hello, мир! 你好世界！ مرحبا بالعالم",
  code: `def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number efficiently."""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print([fibonacci(i) for i in range(10)])`,
  math: `f(x) = \\int_{0}^{\\infty} \\frac{\\sin(x)}{x} dx = \\frac{\\pi}{2}`,
  emojis: "🚀✨🎉🧠🤖👩‍💻👨‍👩‍👧‍👦 🪐🌈",
  whitespace: "        def indented_block():\n            x = 42\n                y = 100",
  chatml: `<|im_start|>system
You are a helpful and knowledgeable AI assistant.<|im_end|>
<|im_start|>user
How does Byte-Pair Encoding (BPE) tokenize subwords?<|im_end|>
<|im_start|>assistant`,
  glitch: `SolidGoldMagikarp StreamerBot petertodd smartcontracts Davidjl`
};

// Application State
const state = {
  text: PRESETS.english,
  selectedModel: 'gpt-4o',
  displayMode: 'inline', // 'inline' | 'chips' | 'table' | 'raw'
  showWhitespace: true,
  activeTab: 'explorer', // 'explorer' | 'vocab' | 'embeddings' | 'comparison' | 'predictor' | 'cost' | 'guide'
  selectedToken: null,
  tokens: [],
  metrics: null,
  predictor: {
    temperature: 0.7,
    topP: 0.9,
    topK: 50,
    repetitionPenalty: 1.0
  },
  cost: {
    outputTokens: 500,
    requestVolume: 1000
  },
  vocabBuilder: null,
  embeddingViz: null
};

// DOM Elements
const elements = {
  inputText: document.getElementById('inputText'),
  clearBtn: document.getElementById('clearBtn'),
  copyTextBtn: document.getElementById('copyTextBtn'),
  fileUpload: document.getElementById('fileUpload'),
  presetSelect: document.getElementById('presetSelect'),
  modelSelect: document.getElementById('modelSelect'),
  themeToggle: document.getElementById('themeToggle'),
  themeIcon: document.getElementById('themeIcon'),
  whitespaceToggle: document.getElementById('whitespaceToggle'),
  
  // Navigation Tabs
  navTabs: document.querySelectorAll('.nav-tab'),
  tabContents: {
    explorer: document.getElementById('tabExplorer'),
    vocab: document.getElementById('tabVocab'),
    embeddings: document.getElementById('tabEmbeddings'),
    comparison: document.getElementById('tabComparison'),
    predictor: document.getElementById('tabPredictor'),
    cost: document.getElementById('tabCost'),
    guide: document.getElementById('tabGuide')
  },

  // Display Mode Buttons
  modeBtns: document.querySelectorAll('.mode-btn'),
  tokenDisplayContainer: document.getElementById('tokenDisplayContainer'),
  tokenFlowView: document.getElementById('tokenFlowView'),
  tokenChipsView: document.getElementById('tokenChipsView'),
  tokenTableView: document.getElementById('tokenTableView'),
  tokenTableBody: document.getElementById('tokenTableBody'),
  tokenRawView: document.getElementById('tokenRawView'),
  tokenRawJson: document.getElementById('tokenRawJson'),
  copyRawBtn: document.getElementById('copyRawBtn'),

  // Metrics Display
  metricTokens: document.getElementById('metricTokens'),
  metricChars: document.getElementById('metricChars'),
  metricWords: document.getElementById('metricWords'),
  metricRatio: document.getElementById('metricRatio'),
  metricBytes: document.getElementById('metricBytes'),
  metricCharsPerToken: document.getElementById('metricCharsPerToken'),

  // Inspector Drawer
  inspectorCard: document.getElementById('inspectorCard'),
  inspectorEmpty: document.getElementById('inspectorEmpty'),
  inspectorContent: document.getElementById('inspectorContent'),
  inspectText: document.getElementById('inspectText'),
  inspectId: document.getElementById('inspectId'),
  inspectBytes: document.getElementById('inspectBytes'),
  inspectHex: document.getElementById('inspectHex'),
  inspectRange: document.getElementById('inspectRange'),
  inspectType: document.getElementById('inspectType'),
  closeInspectorBtn: document.getElementById('closeInspectorBtn'),

  // Comparison Tab
  comparisonGrid: document.getElementById('comparisonGrid'),

  // Predictor Tab
  tempSlider: document.getElementById('tempSlider'),
  tempValue: document.getElementById('tempValue'),
  topPSlider: document.getElementById('topPSlider'),
  topPValue: document.getElementById('topPValue'),
  topKSlider: document.getElementById('topKSlider'),
  topKValue: document.getElementById('topKValue'),
  repSlider: document.getElementById('repSlider'),
  repValue: document.getElementById('repValue'),
  predictorPromptPreview: document.getElementById('predictorPromptPreview'),
  candidatesContainer: document.getElementById('candidatesContainer'),
  stepTokenBtn: document.getElementById('stepTokenBtn'),

  // Cost Tab
  costOutputSlider: document.getElementById('costOutputSlider'),
  costOutputValue: document.getElementById('costOutputValue'),
  costVolumeSlider: document.getElementById('costVolumeSlider'),
  costVolumeValue: document.getElementById('costVolumeValue'),
  costTableBody: document.getElementById('costTableBody'),

  // Quick preset pills
  presetPills: document.querySelectorAll('.preset-pill'),

  // Vocab Builder Elements
  vocabCorpusInput: document.getElementById('vocabCorpusInput'),
  vocabStepBtn: document.getElementById('vocabStepBtn'),
  vocabRun5Btn: document.getElementById('vocabRun5Btn'),
  vocabResetBtn: document.getElementById('vocabResetBtn'),
  vocabExportBtn: document.getElementById('vocabExportBtn'),
  vocabStatsSize: document.getElementById('vocabStatsSize'),
  vocabStatsBase: document.getElementById('vocabStatsBase'),
  vocabStatsMerges: document.getElementById('vocabStatsMerges'),
  vocabPairTableBody: document.getElementById('vocabPairTableBody'),
  vocabCorpusTokens: document.getElementById('vocabCorpusTokens'),
  vocabMergesList: document.getElementById('vocabMergesList'),

  // 3D Embedding Elements
  embeddingsCanvasContainer: document.getElementById('embeddingsCanvasContainer'),
  addTokenInput: document.getElementById('addTokenInput'),
  addTokenCluster: document.getElementById('addTokenCluster'),
  addTokenBtn: document.getElementById('addTokenBtn'),
  tokenSearchInput: document.getElementById('tokenSearchInput'),
  toggleAutoRotateBtn: document.getElementById('toggleAutoRotateBtn'),
  toggleLinesBtn: document.getElementById('toggleLinesBtn'),
  resetCameraBtn: document.getElementById('resetCameraBtn'),
  hudTokenName: document.getElementById('hudTokenName'),
  hudClusterBadge: document.getElementById('hudClusterBadge'),
  hudCoordinates: document.getElementById('hudCoordinates'),
  hudNeighborsList: document.getElementById('hudNeighborsList'),
  clusterFilterBtns: document.querySelectorAll('.cluster-filter-btn'),
  quickAddTokenPills: document.querySelectorAll('.quick-add-token-pill')
};

/**
 * Initialize application
 */
function init() {
  initTheme();
  setupEventListeners();
  elements.inputText.value = state.text;
  updateTokenization();
  updatePredictor();
  updateCostEstimator();
  initVocabBuilder();
  initEmbeddings3D();
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Input changes
  elements.inputText.addEventListener('input', (e) => {
    state.text = e.target.value;
    updateTokenization();
    if (state.activeTab === 'predictor') updatePredictor();
    if (state.activeTab === 'cost') updateCostEstimator();
    if (state.activeTab === 'comparison') updateComparison();
  });

  // Clear text
  elements.clearBtn.addEventListener('click', () => {
    state.text = '';
    elements.inputText.value = '';
    state.selectedToken = null;
    updateTokenization();
    if (state.activeTab === 'predictor') updatePredictor();
  });

  // Copy text
  elements.copyTextBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(state.text);
    showToast('Input text copied to clipboard!');
  });

  // Presets select dropdown
  if (elements.presetSelect) {
    elements.presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (PRESETS[val]) {
        state.text = PRESETS[val];
        elements.inputText.value = state.text;
        updateTokenization();
        if (state.activeTab === 'predictor') updatePredictor();
      }
    });
  }

  // Quick Preset Pills
  elements.presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const pKey = pill.getAttribute('data-preset');
      if (PRESETS[pKey]) {
        state.text = PRESETS[pKey];
        elements.inputText.value = state.text;
        updateTokenization();
        if (state.activeTab === 'predictor') updatePredictor();
      }
    });
  });

  // Model select
  elements.modelSelect.addEventListener('change', (e) => {
    state.selectedModel = e.target.value;
    updateTokenization();
    if (state.activeTab === 'comparison') updateComparison();
  });

  // Whitespace toggle
  elements.whitespaceToggle.addEventListener('change', (e) => {
    state.showWhitespace = e.target.checked;
    renderTokens();
  });

  // Display mode buttons
  elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.modeBtns.forEach(b => b.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-blue-600', 'dark:text-blue-400'));
      btn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-blue-600', 'dark:text-blue-400');
      state.displayMode = btn.getAttribute('data-mode');
      switchDisplayMode(state.displayMode);
    });
  });

  // Copy raw JSON IDs
  elements.copyRawBtn.addEventListener('click', () => {
    const rawIds = state.tokens.map(t => t.id);
    navigator.clipboard.writeText(JSON.stringify(rawIds, null, 2));
    showToast('Token IDs copied as JSON!');
  });

  // File Upload
  elements.fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        state.text = event.target.result;
        elements.inputText.value = state.text;
        updateTokenization();
      };
      reader.readAsText(file);
    }
  });

  // Navigation Tabs
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Close inspector button
  elements.closeInspectorBtn.addEventListener('click', () => {
    state.selectedToken = null;
    renderInspector();
    document.querySelectorAll('.token-pill').forEach(el => el.classList.remove('active-inspect'));
  });

  // Predictor Controls
  elements.tempSlider.addEventListener('input', (e) => {
    state.predictor.temperature = parseFloat(e.target.value);
    elements.tempValue.textContent = state.predictor.temperature.toFixed(2);
    updatePredictorDistribution();
  });

  elements.topPSlider.addEventListener('input', (e) => {
    state.predictor.topP = parseFloat(e.target.value);
    elements.topPValue.textContent = state.predictor.topP.toFixed(2);
    updatePredictorDistribution();
  });

  elements.topKSlider.addEventListener('input', (e) => {
    state.predictor.topK = parseInt(e.target.value);
    elements.topKValue.textContent = state.predictor.topK;
    updatePredictorDistribution();
  });

  elements.repSlider.addEventListener('input', (e) => {
    state.predictor.repetitionPenalty = parseFloat(e.target.value);
    elements.repValue.textContent = state.predictor.repetitionPenalty.toFixed(2);
    updatePredictorDistribution();
  });

  elements.stepTokenBtn.addEventListener('click', handleStepToken);

  // Cost Estimator Controls
  elements.costOutputSlider.addEventListener('input', (e) => {
    state.cost.outputTokens = parseInt(e.target.value);
    elements.costOutputValue.textContent = state.cost.outputTokens.toLocaleString();
    updateCostEstimator();
  });

  elements.costVolumeSlider.addEventListener('input', (e) => {
    state.cost.requestVolume = parseInt(e.target.value);
    elements.costVolumeValue.textContent = state.cost.requestVolume.toLocaleString();
    updateCostEstimator();
  });
}

/**
 * Tab switching controller
 */
function switchTab(tabId) {
  state.activeTab = tabId;
  elements.navTabs.forEach(tab => {
    const isCurrent = tab.getAttribute('data-tab') === tabId;
    if (isCurrent) {
      tab.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-400', 'dark:border-blue-400');
      tab.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'dark:text-slate-400');
    } else {
      tab.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-400', 'dark:border-blue-400');
      tab.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'dark:text-slate-400');
    }
  });

  Object.keys(elements.tabContents).forEach(key => {
    if (elements.tabContents[key]) {
      if (key === tabId) {
        elements.tabContents[key].classList.remove('hidden');
      } else {
        elements.tabContents[key].classList.add('hidden');
      }
    }
  });

  if (tabId === 'comparison') updateComparison();
  if (tabId === 'predictor') updatePredictor();
  if (tabId === 'cost') updateCostEstimator();
  if (tabId === 'embeddings' && state.embeddingViz) {
    setTimeout(() => state.embeddingViz.resize(), 50);
  }
}

/**
 * Display mode switcher (Inline, Chips, Table, Raw)
 */
function switchDisplayMode(mode) {
  elements.tokenFlowView.classList.add('hidden');
  elements.tokenChipsView.classList.add('hidden');
  elements.tokenTableView.classList.add('hidden');
  elements.tokenRawView.classList.add('hidden');

  if (mode === 'inline') elements.tokenFlowView.classList.remove('hidden');
  if (mode === 'chips') elements.tokenChipsView.classList.remove('hidden');
  if (mode === 'table') elements.tokenTableView.classList.remove('hidden');
  if (mode === 'raw') elements.tokenRawView.classList.remove('hidden');
}

/**
 * Run tokenization and update all views
 */
function updateTokenization() {
  state.tokens = tokenize(state.text, state.selectedModel);
  state.metrics = calculateMetrics(state.tokens, state.text);

  // Update Metrics Numbers
  elements.metricTokens.textContent = state.metrics.tokenCount.toLocaleString();
  elements.metricChars.textContent = state.metrics.charCount.toLocaleString();
  elements.metricWords.textContent = state.metrics.wordCount.toLocaleString();
  elements.metricRatio.textContent = state.metrics.tokensPerWord;
  elements.metricBytes.textContent = state.metrics.byteCount.toLocaleString();
  elements.metricCharsPerToken.textContent = state.metrics.charsPerToken;

  renderTokens();
  renderInspector();
}

/**
 * Format token representation for display
 */
function formatTokenText(text, showWhitespace) {
  if (!showWhitespace) return escapeHtml(text);

  // Replace whitespace with visible symbols
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') {
      out += '<span class="ws-space"> </span>';
    } else if (ch === '\n') {
      out += '<span class="ws-newline">\n</span>';
    } else if (ch === '\t') {
      out += '<span class="ws-tab">\t</span>';
    } else {
      out += escapeHtml(ch);
    }
  }
  return out;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render Tokens into Flow, Chips, Table and Raw JSON views
 */
function renderTokens() {
  const wsClass = state.showWhitespace ? 'show-whitespace' : '';

  // 1. Flow View (Inline wrapped text)
  if (state.tokens.length === 0) {
    elements.tokenFlowView.innerHTML = `
      <div class="text-center py-12 text-slate-400 dark:text-slate-500">
        <p class="text-sm">Type or paste text above, or choose a preset to inspect tokens.</p>
      </div>`;
    elements.tokenChipsView.innerHTML = '';
    elements.tokenTableBody.innerHTML = '';
    elements.tokenRawJson.textContent = '[]';
    return;
  }

  let flowHtml = `<div class="p-4 leading-relaxed font-mono ${wsClass}">`;
  state.tokens.forEach(t => {
    const formatted = formatTokenText(t.text, state.showWhitespace);
    flowHtml += `<span class="token-pill token-color-${t.colorIndex}" data-token-idx="${t.index}" title="Token ID: ${t.id} | Bytes: ${t.byteLength}">${formatted}</span>`;
  });
  flowHtml += `</div>`;
  elements.tokenFlowView.innerHTML = flowHtml;

  // 2. Chips View (Discrete badges with token ID subscript)
  let chipsHtml = `<div class="p-4 flex flex-wrap gap-2 font-mono ${wsClass}">`;
  state.tokens.forEach(t => {
    const formatted = formatTokenText(t.text, state.showWhitespace);
    chipsHtml += `
      <div class="token-pill token-color-${t.colorIndex} px-2.5 py-1 rounded-lg flex items-center gap-1.5" data-token-idx="${t.index}">
        <span class="font-medium">${formatted}</span>
        <span class="text-[10px] opacity-75 font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">#${t.id}</span>
      </div>`;
  });
  chipsHtml += `</div>`;
  elements.tokenChipsView.innerHTML = chipsHtml;

  // 3. Table View
  let tableHtml = '';
  state.tokens.forEach(t => {
    tableHtml += `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800" data-token-idx="${t.index}">
        <td class="px-4 py-2 text-xs font-mono text-slate-400">#${t.index + 1}</td>
        <td class="px-4 py-2 font-mono">
          <span class="token-pill token-color-${t.colorIndex} text-xs font-medium">${formatTokenText(t.text, true)}</span>
        </td>
        <td class="px-4 py-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">${t.id}</td>
        <td class="px-4 py-2 font-mono text-xs text-slate-500">${t.byteLength} B</td>
        <td class="px-4 py-2 font-mono text-[11px] text-slate-400">${t.hex}</td>
        <td class="px-4 py-2 text-xs">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${t.type}</span>
        </td>
      </tr>`;
  });
  elements.tokenTableBody.innerHTML = tableHtml;

  // 4. Raw JSON View
  elements.tokenRawJson.textContent = JSON.stringify(state.tokens.map(t => t.id), null, 2);

  // Attach click listeners to all token pills
  document.querySelectorAll('[data-token-idx]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(el.getAttribute('data-token-idx'));
      selectToken(idx);
    });
  });
}

/**
 * Handle Token Selection for Inspector Drawer
 */
function selectToken(idx) {
  const token = state.tokens[idx];
  if (!token) return;

  state.selectedToken = token;

  // Highlight pill
  document.querySelectorAll('.token-pill').forEach(el => el.classList.remove('active-inspect'));
  document.querySelectorAll(`[data-token-idx="${idx}"]`).forEach(el => el.classList.add('active-inspect'));

  renderInspector();
}

/**
 * Render Inspector Drawer
 */
function renderInspector() {
  if (!state.selectedToken) {
    elements.inspectorEmpty.classList.remove('hidden');
    elements.inspectorContent.classList.add('hidden');
    return;
  }

  const t = state.selectedToken;
  elements.inspectorEmpty.classList.add('hidden');
  elements.inspectorContent.classList.remove('hidden');

  elements.inspectText.textContent = JSON.stringify(t.text);
  elements.inspectId.textContent = t.id;
  elements.inspectBytes.textContent = `${t.byteLength} bytes (${t.bytes.join(', ')})`;
  elements.inspectHex.textContent = t.hex;
  elements.inspectRange.textContent = `chars ${t.startChar} to ${t.endChar} (${t.text.length} chars)`;
  elements.inspectType.textContent = t.type;
}

/**
 * Model Comparison Tab
 */
function updateComparison() {
  if (!state.text) {
    elements.comparisonGrid.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-400">
        Enter some text above to compare tokenizer efficiency across models.
      </div>`;
    return;
  }

  const results = compareAllModels(state.text);
  const baseline = results['gpt-4o'];
  const baselineCount = baseline ? baseline.metrics.tokenCount : 1;

  let html = '';
  Object.keys(results).forEach(key => {
    const item = results[key];
    const diff = item.metrics.tokenCount - baselineCount;
    const pctDiff = baselineCount > 0 ? ((diff / baselineCount) * 100).toFixed(1) : 0;
    const isBaseline = key === 'gpt-4o';

    let diffBadge = '';
    if (isBaseline) {
      diffBadge = `<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">Baseline (o200k)</span>`;
    } else if (diff < 0) {
      diffBadge = `<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">${Math.abs(pctDiff)}% more efficient</span>`;
    } else if (diff > 0) {
      diffBadge = `<span class="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">+${pctDiff}% more tokens</span>`;
    } else {
      diffBadge = `<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-medium">Equal count</span>`;
    }

    html += `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white text-base">${item.profile.name}</h4>
            <p class="text-xs text-slate-500 font-mono">${item.profile.encoding} • ${item.profile.vocabSize.toLocaleString()} vocab</p>
          </div>
          ${diffBadge}
        </div>

        <div class="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-center font-mono">
          <div>
            <div class="text-xs text-slate-500">Tokens</div>
            <div class="text-lg font-bold text-blue-600 dark:text-blue-400">${item.metrics.tokenCount}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500">Tokens/Word</div>
            <div class="text-lg font-bold text-slate-700 dark:text-slate-300">${item.metrics.tokensPerWord}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500">Chars/Token</div>
            <div class="text-lg font-bold text-slate-700 dark:text-slate-300">${item.metrics.charsPerToken}</div>
          </div>
        </div>

        <div class="mt-3">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Token Segmentation Preview</div>
          <div class="p-3 bg-slate-50/70 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80 max-h-36 overflow-y-auto leading-relaxed">
            ${item.tokens.map(t => `<span class="token-pill token-color-${t.colorIndex} text-xs">${formatTokenText(t.text, true)}</span>`).join('')}
          </div>
        </div>
      </div>`;
  });

  elements.comparisonGrid.innerHTML = html;
}

/**
 * Predictor & Logits Simulation
 */
let cachedRawCandidates = [];

function updatePredictor() {
  elements.predictorPromptPreview.textContent = state.text || '(empty prompt)';
  cachedRawCandidates = getRawPredictions(state.text);
  updatePredictorDistribution();
}

function updatePredictorDistribution() {
  const distribution = computeSamplingDistribution(cachedRawCandidates, state.text, state.predictor);
  renderPredictorCandidates(distribution);
}

function renderPredictorCandidates(candidates) {
  let html = '';
  candidates.forEach((cand, idx) => {
    const pct = (cand.probability * 100).toFixed(1);
    const inTopP = cand.inTopP;
    const inTopK = cand.inTopK;
    const isEligible = inTopP && inTopK;

    const barColor = isEligible ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700 opacity-40';
    const textColor = isEligible ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 line-through';

    html += `
      <div class="candidate-row p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900 cursor-pointer transition-all group" data-cand-text="${escapeHtml(cand.text)}">
        <div class="flex items-center justify-between text-xs mb-1.5">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-mono text-[10px] font-bold">#${idx + 1}</span>
            <span class="font-mono text-sm px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 ${textColor}">
              ${formatTokenText(cand.text, true)}
            </span>
            ${!inTopP ? '<span class="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-600 rounded">Cut by Top-P</span>' : ''}
            ${!inTopK ? '<span class="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded">Cut by Top-K</span>' : ''}
          </div>
          <div class="flex items-center gap-3 font-mono">
            <span class="text-slate-400 text-[11px]">logit: ${cand.logit}</span>
            <span class="font-bold text-sm text-blue-600 dark:text-blue-400">${pct}%</span>
          </div>
        </div>

        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div class="${barColor} h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
        </div>
      </div>`;
  });

  elements.candidatesContainer.innerHTML = html;

  // Click candidate row to append directly
  document.querySelectorAll('.candidate-row').forEach(row => {
    row.addEventListener('click', () => {
      const textToAppend = row.getAttribute('data-cand-text');
      appendPredictedToken(textToAppend);
    });
  });
}

function handleStepToken() {
  const distribution = computeSamplingDistribution(cachedRawCandidates, state.text, state.predictor);
  const sampledText = sampleNextToken(distribution);
  if (sampledText) {
    appendPredictedToken(sampledText);
  }
}

function appendPredictedToken(tokenStr) {
  state.text += tokenStr;
  elements.inputText.value = state.text;
  updateTokenization();
  updatePredictor();
  showToast(`Sampled token: "${tokenStr}"`);
}

/**
 * Cost & Efficiency Estimator Tab
 */
function updateCostEstimator() {
  const tokenCount = state.metrics ? state.metrics.tokenCount : 0;
  const costData = calculateModelCosts(tokenCount, state.cost.outputTokens, state.cost.requestVolume);

  let html = '';
  costData.forEach(m => {
    html += `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <td class="px-5 py-4">
          <div class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            ${m.name}
            ${m.isFlagship ? '<span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">Flagship</span>' : ''}
          </div>
          <div class="text-xs text-slate-400 font-mono">${m.provider} • ${m.contextWindow} ctx</div>
        </td>
        <td class="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">$${m.inputPer1M.toFixed(2)}</td>
        <td class="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">$${m.outputPer1M.toFixed(2)}</td>
        <td class="px-5 py-4 font-mono text-sm font-semibold text-slate-900 dark:text-white">${m.formattedSingle}</td>
        <td class="px-5 py-4 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">${m.formattedMonthly}</td>
      </tr>`;
  });

  elements.costTableBody.innerHTML = html;
}

/**
 * ==========================================================
 * FEATURE: INTERACTIVE BPE VOCABULARY BUILDER
 * ==========================================================
 */
function initVocabBuilder() {
  const initialCorpus = elements.vocabCorpusInput ? elements.vocabCorpusInput.value : 'low lower lowest newest widest wider low low lowest';
  state.vocabBuilder = new BPEVocabularyBuilder(initialCorpus);

  if (elements.vocabCorpusInput) {
    elements.vocabCorpusInput.addEventListener('input', (e) => {
      state.vocabBuilder.reset(e.target.value);
      renderVocabBuilderUI();
    });
  }

  if (elements.vocabStepBtn) {
    elements.vocabStepBtn.addEventListener('click', () => {
      const record = state.vocabBuilder.step();
      if (record) {
        showToast(`Merged pair '${record.pair.join(' + ')}' → '${record.newToken}'`);
        renderVocabBuilderUI();
      } else {
        showToast('No more pairs available to merge in this corpus.');
      }
    });
  }

  if (elements.vocabRun5Btn) {
    elements.vocabRun5Btn.addEventListener('click', () => {
      const records = state.vocabBuilder.runMultiple(5);
      if (records.length > 0) {
        showToast(`Executed ${records.length} BPE merge iterations!`);
        renderVocabBuilderUI();
      } else {
        showToast('No more pairs to merge.');
      }
    });
  }

  if (elements.vocabResetBtn) {
    elements.vocabResetBtn.addEventListener('click', () => {
      const corpus = elements.vocabCorpusInput ? elements.vocabCorpusInput.value : '';
      state.vocabBuilder.reset(corpus);
      showToast('Vocabulary reset to base alphabet!');
      renderVocabBuilderUI();
    });
  }

  if (elements.vocabExportBtn) {
    elements.vocabExportBtn.addEventListener('click', () => {
      const vocabData = state.vocabBuilder.getVocabularyList();
      const exportJson = JSON.stringify({
        vocabSize: vocabData.totalSize,
        baseTokens: vocabData.baseTokens,
        learnedMerges: state.vocabBuilder.merges
      }, null, 2);
      navigator.clipboard.writeText(exportJson);
      showToast('Learned BPE Vocabulary copied as JSON!');
    });
  }

  renderVocabBuilderUI();
}

function renderVocabBuilderUI() {
  if (!state.vocabBuilder || !elements.vocabStatsSize) return;

  const vocabData = state.vocabBuilder.getVocabularyList();
  elements.vocabStatsSize.textContent = vocabData.totalSize;
  elements.vocabStatsBase.textContent = vocabData.baseTokens.length;
  elements.vocabStatsMerges.textContent = state.vocabBuilder.merges.length;

  // 1. Render Candidate Frequency Table
  const pairFreqs = state.vocabBuilder.getPairFrequencies();
  let pairsHtml = '';
  if (pairFreqs.length === 0) {
    pairsHtml = `<tr><td colspan="4" class="px-4 py-4 text-center text-slate-400 text-xs">All adjacent pairs merged or corpus exhausted.</td></tr>`;
  } else {
    pairFreqs.slice(0, 8).forEach((p, idx) => {
      const isTop = idx === 0;
      pairsHtml += `
        <tr class="border-b border-slate-100 dark:border-slate-800 ${isTop ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold' : ''}">
          <td class="px-4 py-2 font-mono text-xs text-slate-500">#${idx + 1}</td>
          <td class="px-4 py-2 font-mono text-xs">
            <span class="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700">'${p.first}'</span> + 
            <span class="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700">'${p.second}'</span>
          </td>
          <td class="px-4 py-2 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">${p.count}</td>
          <td class="px-4 py-2 text-xs">
            ${isTop ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">Next Merge Target</span>' : '<span class="text-slate-400 text-[11px]">Candidate</span>'}
          </td>
        </tr>`;
    });
  }
  elements.vocabPairTableBody.innerHTML = pairsHtml;

  // 2. Render Live Corpus Tokenization
  const wordsTokens = state.vocabBuilder.getCurrentCorpusTokens();
  let corpusHtml = '';
  wordsTokens.forEach(wTokens => {
    corpusHtml += `<div class="inline-flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm mr-2 mb-2 font-mono text-xs">`;
    wTokens.forEach(t => {
      corpusHtml += `<span class="token-pill token-color-${t.colorIndex} px-1.5 py-0.5 text-xs font-medium" title="ID: ${t.id}">${formatTokenText(t.display, false)}</span>`;
    });
    corpusHtml += `</div>`;
  });
  elements.vocabCorpusTokens.innerHTML = corpusHtml;

  // 3. Render Merges Rulebook
  let mergesHtml = '';
  if (state.vocabBuilder.merges.length === 0) {
    mergesHtml = `<div class="text-center py-6 text-slate-400 text-xs">No merges executed yet. Click "Step 1 Merge" to begin training!</div>`;
  } else {
    state.vocabBuilder.merges.slice().reverse().forEach(m => {
      mergesHtml += `
        <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">#${m.rank}</span>
            <span class="text-slate-600 dark:text-slate-300">(${m.pair[0]} + ${m.pair[1]})</span>
            <span class="text-slate-400">→</span>
            <span class="font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950">${m.newToken}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-400">${m.count} co-occurrences</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">ID: ${m.id}</span>
          </div>
        </div>`;
    });
  }
  elements.vocabMergesList.innerHTML = mergesHtml;
}

/**
 * ==========================================================
 * FEATURE: 3D VECTOR EMBEDDING SPACE VISUALIZER
 * ==========================================================
 */
function initEmbeddings3D() {
  if (!elements.embeddingsCanvasContainer) return;

  state.embeddingViz = new EmbeddingVisualizer3D(elements.embeddingsCanvasContainer, {
    onSelectNode: (node, neighbors) => {
      renderHUD(node, neighbors);
    }
  });

  // Default selection
  const firstNode = state.embeddingViz.nodes[0];
  if (firstNode) {
    state.embeddingViz.selectNode(firstNode);
  }

  // Add Custom Token Button
  if (elements.addTokenBtn) {
    elements.addTokenBtn.addEventListener('click', handleAddCustomToken);
  }

  // Add Custom Token via Enter Key
  if (elements.addTokenInput) {
    elements.addTokenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddCustomToken();
    });
  }

  // Quick Add Token Pills
  elements.quickAddTokenPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const token = pill.getAttribute('data-token');
      const cluster = pill.getAttribute('data-cluster') || 'custom';
      injectTokenInto3D(token, cluster);
    });
  });

  // Cluster filter buttons
  elements.clusterFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.clusterFilterBtns.forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'dark:bg-blue-500'));
      btn.classList.add('bg-blue-600', 'text-white', 'dark:bg-blue-500');
      const cluster = btn.getAttribute('data-cluster');
      state.embeddingViz.setFilter(cluster);
    });
  });

  // Search Token in 3D
  if (elements.tokenSearchInput) {
    elements.tokenSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim().toLowerCase();
      if (!term) return;
      const found = state.embeddingViz.nodes.find(n => n.token.toLowerCase().includes(term));
      if (found) {
        state.embeddingViz.focusOnNode(found);
        state.embeddingViz.selectNode(found);
      }
    });
  }

  // Camera Controls
  if (elements.toggleAutoRotateBtn) {
    elements.toggleAutoRotateBtn.addEventListener('click', () => {
      state.embeddingViz.autoRotate = !state.embeddingViz.autoRotate;
      elements.toggleAutoRotateBtn.classList.toggle('bg-blue-100', state.embeddingViz.autoRotate);
      elements.toggleAutoRotateBtn.classList.toggle('dark:bg-blue-900', state.embeddingViz.autoRotate);
      showToast(`Auto-Rotate: ${state.embeddingViz.autoRotate ? 'ON' : 'PAUSED'}`);
    });
  }

  if (elements.toggleLinesBtn) {
    elements.toggleLinesBtn.addEventListener('click', () => {
      state.embeddingViz.showLines = !state.embeddingViz.showLines;
      showToast(`Nearest Neighbor Lines: ${state.embeddingViz.showLines ? 'ON' : 'OFF'}`);
    });
  }

  if (elements.resetCameraBtn) {
    elements.resetCameraBtn.addEventListener('click', () => {
      state.embeddingViz.resetCamera();
      showToast('Camera reset to default view.');
    });
  }
}

function handleAddCustomToken() {
  if (!elements.addTokenInput) return;
  const token = elements.addTokenInput.value.trim();
  const cluster = elements.addTokenCluster ? elements.addTokenCluster.value : 'custom';

  if (!token) {
    showToast('Please enter a token name.');
    return;
  }

  injectTokenInto3D(token, cluster);
  elements.addTokenInput.value = '';
}

function injectTokenInto3D(token, cluster) {
  if (!state.embeddingViz) return;
  const newNode = state.embeddingViz.addToken(token, cluster);
  if (newNode) {
    showToast(`✨ Token "${newNode.token}" injected into 3D Embedding Space!`);
  }
}

function renderHUD(node, neighbors) {
  if (!elements.hudTokenName) return;

  const clusterCfg = CLUSTER_CONFIG[node.cluster] || CLUSTER_CONFIG.custom;

  elements.hudTokenName.textContent = node.token;
  elements.hudClusterBadge.textContent = clusterCfg.label;
  elements.hudClusterBadge.style.backgroundColor = `${node.color}22`;
  elements.hudClusterBadge.style.color = node.color;
  elements.hudCoordinates.textContent = `(x: ${Math.round(node.x)}, y: ${Math.round(node.y)}, z: ${Math.round(node.z)})`;

  let nHtml = '';
  neighbors.forEach(nb => {
    const simPct = (nb.similarity * 100).toFixed(0);
    nHtml += `
      <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:text-blue-500" data-hud-token="${nb.node.token}">
        <span class="font-mono font-medium">${nb.node.token}</span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-slate-400 font-mono">${Math.round(nb.dist)}px</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono">${simPct}% sim</span>
        </div>
      </div>`;
  });
  elements.hudNeighborsList.innerHTML = nHtml;

  // Click neighbor to focus
  document.querySelectorAll('[data-hud-token]').forEach(el => {
    el.addEventListener('click', () => {
      const tName = el.getAttribute('data-hud-token');
      const target = state.embeddingViz.nodes.find(n => n.token === tName);
      if (target) {
        state.embeddingViz.focusOnNode(target);
        state.embeddingViz.selectNode(target);
      }
    });
  });
}

/**
 * Theme Manager
 */
function initTheme() {
  const savedTheme = localStorage.getItem('llm_explorer_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('llm_explorer_theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    elements.themeIcon.innerHTML = `
      <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>`;
  } else {
    elements.themeIcon.innerHTML = `
      <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
      </svg>`;
  }
}

/**
 * Toast Notification Utility
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 transform transition-all duration-200 translate-y-2 opacity-0';
  toast.innerHTML = `
    <svg class="w-4 h-4 text-emerald-400 dark:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>
    <span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

// Start application
window.addEventListener('DOMContentLoaded', init);
