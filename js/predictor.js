/**
 * LLM Token Explorer - Next Token Predictor & Sampling Engine
 * Simulates LLM autoregressive next-token prediction, logits computation,
 * Softmax with Temperature, Top-P (Nucleus), Top-K, and Repetition Penalty.
 */

// Contextual completion knowledge base for authentic LLM simulation
const CONTEXT_PATTERNS = [
  {
    regex: /the quick brown fox jumps over the lazy\s*$/i,
    candidates: [
      { text: ' dog', logit: 8.5 },
      { text: ' dogs', logit: 4.8 },
      { text: ' hound', logit: 3.2 },
      { text: ' cat', logit: 2.1 },
      { text: ' puppy', logit: 1.5 }
    ]
  },
  {
    regex: /once upon a\s*$/i,
    candidates: [
      { text: ' time', logit: 9.2 },
      { text: ' midnight', logit: 3.8 },
      { text: ' hill', logit: 2.1 },
      { text: ' dream', logit: 1.9 },
      { text: ' star', logit: 1.2 }
    ]
  },
  {
    regex: /def fibonacci\(n\s*:?\s*int?\)?\s*(?:->\s*int)?:\s*$/i,
    candidates: [
      { text: '\n    if', logit: 7.9 },
      { text: '\n    """', logit: 5.4 },
      { text: '\n    if n <= 1:', logit: 4.8 },
      { text: '\n    a, b =', logit: 3.6 }
    ]
  },
  {
    regex: /console\.\s*$/i,
    candidates: [
      { text: 'log', logit: 8.9 },
      { text: 'error', logit: 5.1 },
      { text: 'warn', logit: 4.2 },
      { text: 'table', logit: 3.1 },
      { text: 'dir', logit: 2.0 }
    ]
  },
  {
    regex: /artificial\s*$/i,
    candidates: [
      { text: ' intelligence', logit: 8.7 },
      { text: ' neural', logit: 4.9 },
      { text: ' general', logit: 4.2 },
      { text: ' life', logit: 3.1 },
      { text: ' agents', logit: 2.8 }
    ]
  },
  {
    regex: /large language\s*$/i,
    candidates: [
      { text: ' models', logit: 8.6 },
      { text: ' model', logit: 7.2 },
      { text: ' dataset', logit: 3.1 },
      { text: ' processing', logit: 2.5 }
    ]
  },
  {
    regex: /token\s*$/i,
    candidates: [
      { text: 'ization', logit: 7.8 },
      { text: 's', logit: 7.2 },
      { text: ' count', logit: 5.4 },
      { text: ' limit', logit: 4.6 },
      { text: ' vocabulary', logit: 3.9 }
    ]
  },
  {
    regex: /hello\s*$/i,
    candidates: [
      { text: ',', logit: 7.4 },
      { text: ' world', logit: 7.1 },
      { text: ' there', logit: 6.2 },
      { text: '!', logit: 5.9 },
      { text: ' everyone', logit: 4.1 }
    ]
  },
  {
    regex: /what is the capital of\s*$/i,
    candidates: [
      { text: ' France', logit: 7.9 },
      { text: ' Japan', logit: 6.8 },
      { text: ' the', logit: 5.4 },
      { text: ' Australia', logit: 4.9 },
      { text: ' India', logit: 4.8 }
    ]
  }
];

// Fallback pool of high-frequency continuation tokens
const GENERAL_CANDIDATE_POOL = [
  { text: ' the', baseLogit: 6.2 },
  { text: ' and', baseLogit: 5.8 },
  { text: ' of', baseLogit: 5.5 },
  { text: ' to', baseLogit: 5.2 },
  { text: ' is', baseLogit: 5.0 },
  { text: ' a', baseLogit: 4.8 },
  { text: ' in', baseLogit: 4.5 },
  { text: ' that', baseLogit: 4.3 },
  { text: ' with', baseLogit: 4.0 },
  { text: '.', baseLogit: 3.9 },
  { text: ',', baseLogit: 3.8 },
  { text: ' for', baseLogit: 3.6 },
  { text: ' as', baseLogit: 3.4 },
  { text: ' on', baseLogit: 3.2 },
  { text: ' by', baseLogit: 3.0 },
  { text: ' it', baseLogit: 2.8 },
  { text: ' model', baseLogit: 2.7 },
  { text: ' data', baseLogit: 2.5 },
  { text: ' token', baseLogit: 2.4 },
  { text: '\n', baseLogit: 2.2 }
];

/**
 * Predict next token raw logits based on prompt text
 */
export function getRawPredictions(promptText) {
  const trimmed = (promptText || '').trimEnd();

  if (!trimmed) {
    return [
      { text: 'What', logit: 7.2 },
      { text: 'Explain', logit: 6.8 },
      { text: 'How', logit: 6.5 },
      { text: 'The', logit: 6.1 },
      { text: 'Write', logit: 5.9 },
      { text: 'Can', logit: 5.4 },
      { text: 'Hello', logit: 5.0 },
      { text: 'In', logit: 4.5 }
    ];
  }

  // 1. Check exact regex patterns
  for (const pattern of CONTEXT_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      return pattern.candidates.map(c => ({ ...c }));
    }
  }

  // 2. Synthesize plausible context-aware logits based on last word
  const words = trimmed.split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');

  let hash = 0;
  for (let i = 0; i < lastWord.length; i++) {
    hash = (hash << 5) - hash + lastWord.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  // Pick 8 varied candidates from the pool with simulated logits
  const candidates = GENERAL_CANDIDATE_POOL.slice(0, 10).map((cand, idx) => {
    const jitter = ((hash + idx * 17) % 30) / 10.0;
    return {
      text: cand.text,
      logit: Math.max(0.5, +(cand.baseLogit + (idx === 0 ? 1.5 : -0.2 * idx) + (jitter - 1.5)).toFixed(2))
    };
  });

  // Sort descending by logit
  candidates.sort((a, b) => b.logit - a.logit);
  return candidates;
}

/**
 * Applies Sampling Hyperparameters:
 * - Repetition Penalty
 * - Temperature
 * - Top-K Truncation
 * - Top-P (Nucleus) Cumulative Cutoff
 * - Softmax Normalization
 */
export function computeSamplingDistribution(rawCandidates, promptText, options = {}) {
  const {
    temperature = 0.7,
    topP = 0.9,
    topK = 50,
    repetitionPenalty = 1.0
  } = options;

  let candidates = rawCandidates.map(c => ({ ...c }));

  // 1. Repetition Penalty
  if (repetitionPenalty > 1.0 && promptText) {
    const promptLower = promptText.toLowerCase();
    candidates = candidates.map(c => {
      const appears = promptLower.includes(c.text.trim().toLowerCase());
      let logit = c.logit;
      if (appears) {
        logit = logit > 0 ? logit / repetitionPenalty : logit * repetitionPenalty;
      }
      return { ...c, logit: +logit.toFixed(3) };
    });
  }

  // Sort candidates by logit descending
  candidates.sort((a, b) => b.logit - a.logit);

  // 2. Top-K filtering
  const kLimit = Math.max(1, Math.min(topK, candidates.length));
  const topKCandidates = candidates.slice(0, kLimit);
  const excludedByTopK = candidates.slice(kLimit);

  // 3. Apply Temperature & Softmax
  const temp = Math.max(0.01, temperature); // Prevent division by zero
  const maxLogit = Math.max(...topKCandidates.map(c => c.logit));

  const expValues = topKCandidates.map(c => Math.exp((c.logit - maxLogit) / temp));
  const sumExp = expValues.reduce((acc, val) => acc + val, 0);

  const withProbs = topKCandidates.map((c, i) => ({
    ...c,
    probability: expValues[i] / sumExp
  }));

  // 4. Top-P (Nucleus) filtering
  let cumulativeProb = 0;
  let cutoffReached = false;

  const result = [];
  for (const item of withProbs) {
    const inTopP = !cutoffReached;
    cumulativeProb += item.probability;
    if (cumulativeProb >= topP) {
      cutoffReached = true;
    }

    result.push({
      ...item,
      cumulativeProb: Math.min(1.0, cumulativeProb),
      inTopP: inTopP,
      inTopK: true
    });
  }

  // Add any items truncated by Top-K
  for (const item of excludedByTopK) {
    result.push({
      ...item,
      probability: 0.0,
      cumulativeProb: 1.0,
      inTopP: false,
      inTopK: false
    });
  }

  return result;
}

/**
 * Samples a token based on the final probability distribution
 */
export function sampleNextToken(candidates) {
  // Only sample from tokens that are inside both Top-K and Top-P
  const eligible = candidates.filter(c => c.inTopP && c.inTopK && c.probability > 0);
  if (eligible.length === 0) {
    return candidates[0] ? candidates[0].text : '';
  }

  // Renormalize eligible probabilities
  const totalP = eligible.reduce((acc, c) => acc + c.probability, 0);
  const r = Math.random() * totalP;

  let running = 0;
  for (const item of eligible) {
    running += item.probability;
    if (r <= running) {
      return item.text;
    }
  }

  return eligible[0].text;
}
