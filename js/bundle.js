/**
 * LLM Token Explorer - Standalone Browser Bundle
 * Designed & Engineered by Jagyenswar Sa
 * 100% Client-Side Execution • Zero External Build Tools Needed
 */

(function() {
/**
 * LLM Token Explorer - Tokenizer Engine
 * Supports:
 * - OpenAI GPT-4o (o200k_base - 200,019 vocab)
 * - OpenAI GPT-4 / GPT-3.5 (cl100k_base - 100,277 vocab)
 * - OpenAI GPT-2 / GPT-3 (r50k_base / p50k_base - 50,257 vocab)
 * - Meta Llama 3 / 3.1 (128,256 vocab)
 * - Anthropic Claude 3.5 Sonnet (~65,000 vocab)
 * - Google Gemma 2 (256,000 vocab)
 */

// Model Profiles & Specifications
const MODEL_PROFILES = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o / GPT-4o-mini',
    family: 'OpenAI',
    encoding: 'o200k_base',
    vocabSize: 200019,
    description: 'Latest OpenAI flagship tokenizer with high multilingual and code compression efficiency.',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    miniInputCostPer1M: 0.15,
    miniOutputCostPer1M: 0.60
  },
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4 / GPT-3.5-Turbo',
    family: 'OpenAI',
    encoding: 'cl100k_base',
    vocabSize: 100277,
    description: 'Standard modern OpenAI tokenizer used in GPT-4 and ChatGPT prior to GPT-4o.',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    inputCostPer1M: 30.00,
    outputCostPer1M: 60.00
  },
  'llama-3': {
    id: 'llama-3',
    name: 'Llama 3 / 3.1 / 3.2',
    family: 'Meta',
    encoding: 'llama3_128k',
    vocabSize: 128256,
    description: 'Meta open-weights tokenizer with 128k vocab optimized for high multilingual efficiency.',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    inputCostPer1M: 0.59,
    outputCostPer1M: 0.79
  },
  'claude-3-5': {
    id: 'claude-3-5',
    name: 'Claude 3.5 Sonnet',
    family: 'Anthropic',
    encoding: 'claude_bpe',
    vocabSize: 65000,
    description: 'Anthropic proprietary BPE tokenizer, tuned for nuanced reasoning and code.',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00
  },
  'gemma-2': {
    id: 'gemma-2',
    name: 'Gemma 2 (256k)',
    family: 'Google',
    encoding: 'gemma_sp',
    vocabSize: 256000,
    description: 'Google open models with massive 256k SentencePiece vocabulary for global languages.',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    inputCostPer1M: 0.20,
    outputCostPer1M: 0.40
  },
  'gpt-2': {
    id: 'gpt-2',
    name: 'GPT-2 / GPT-3 Legacy',
    family: 'OpenAI',
    encoding: 'r50k_base',
    vocabSize: 50257,
    description: 'Original byte-level BPE tokenizer (2019-2020), high token fragmentation on non-English.',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    inputCostPer1M: 20.00,
    outputCostPer1M: 20.00
  }
};

// Common special tokens across tokenizers
const SPECIAL_TOKENS = {
  '<|endoftext|>': 100257,
  '<|fim_prefix|>': 100258,
  '<|fim_middle|>': 100259,
  '<|fim_suffix|>': 100260,
  '<|im_start|>': 100264,
  '<|im_end|>': 100265,
  '<bos>': 1,
  '<eos>': 2,
  '<pad>': 0,
  '[INST]': 128006,
  '[/INST]': 128007,
  '<|start_header_id|>': 128006,
  '<|end_header_id|>': 128007,
  '<|eot_id|>': 128009
};

// Seed vocabulary for authentic token IDs and BPE behavior
const BASE_KNOWN_TOKENS = {
  'cl100k_base': {
    ' ': 220, '  ': 256, '   ': 262, '    ': 257, '\n': 198, '\n\n': 271, '\t': 197,
    '.': 13, ',': 11, '!': 0, '?': 30, ':': 25, ';': 26, '-': 12, '(': 7, ')': 8,
    '="': 449, ' = ': 794, ' == ': 1735, ' != ': 4376, '->': 1851, '=>': 2750,
    'The': 464, ' The': 791, 'the': 262, ' the': 279, 'a': 64, ' a': 264, 'an': 459, ' an': 459,
    'is': 374, ' is': 374, 'are': 527, ' are': 527, 'in': 294, ' in': 304, 'on': 389, ' on': 389,
    'to': 311, ' to': 311, 'of': 315, ' of': 315, 'and': 323, ' and': 323, 'for': 363, ' for': 363,
    'with': 449, ' with': 449, 'that': 430, ' that': 430, 'this': 574, ' this': 574,
    'you': 498, ' you': 498, 'I': 40, ' I': 358, 'we': 584, ' we': 584, 'they': 814, ' they': 814,
    'can': 649, ' can': 649, 'will': 690, ' will': 690, 'not': 539, ' not': 539,
    'have': 617, ' have': 617, 'be': 387, ' be': 387, 'do': 656, ' do': 656,
    'def': 752, ' def': 752, 'return': 704, ' return': 704, 'import': 1400, ' import': 1400,
    'class': 1397, ' class': 1397, 'function': 2146, ' function': 2146, 'const': 1168, ' const': 1168,
    'let': 1461, ' let': 1461, 'var': 1445, ' var': 1445, 'if': 596, ' if': 596, 'else': 1993, ' else': 1993,
    'print': 3993, ' print': 3993, 'console': 8205, ' console': 8205, 'log': 3433, ' log': 3433,
    'token': 4037, ' token': 4037, 'tokens': 16370, ' tokens': 16370,
    'explorer': 38386, ' explorer': 38386, 'model': 2746, ' model': 2746,
    'quick': 4062, ' quick': 4062, 'brown': 14198, ' brown': 14198, 'fox': 39935, ' fox': 39935,
    'jumps': 34969, ' jumps': 34969, 'over': 927, ' over': 927, 'lazy': 16931, ' lazy': 16931, 'dog': 5679, ' dog': 5679
  },
  'o200k_base': {
    ' ': 220, '  ': 256, '   ': 262, '    ': 257, '        ': 270, '\n': 198, '\n\n': 271, '\t': 197,
    '.': 13, ',': 11, '!': 0, '?': 30, ':': 25, ';': 26, '-': 12, '(': 7, ')': 8,
    '="': 449, ' = ': 794, ' == ': 1735, ' != ': 4376, '->': 1851, '=>': 2750,
    'The': 464, ' The': 791, 'the': 262, ' the': 279, 'a': 64, ' a': 264, 'an': 459, ' an': 459,
    'is': 374, ' is': 374, 'are': 527, ' are': 527, 'in': 294, ' in': 304, 'on': 389, ' on': 389,
    'to': 311, ' to': 311, 'of': 315, ' of': 315, 'and': 323, ' and': 323, 'for': 363, ' for': 363,
    'with': 449, ' with': 449, 'that': 430, ' that': 430, 'this': 574, ' this': 574,
    'token': 4037, ' token': 4037, 'tokens': 16370, ' tokens': 16370,
    'explorer': 38386, ' explorer': 38386, 'model': 2746, ' model': 2746,
    'quick': 4062, ' quick': 4062, 'brown': 14198, ' brown': 14198, 'fox': 39935, ' fox': 39935,
    'jumps': 34969, ' jumps': 34969, 'over': 927, ' over': 927, 'lazy': 16931, ' lazy': 16931, 'dog': 5679, ' dog': 5679,
    // Multilingual words merged into single tokens in o200k!
    'Bonjour': 64120, ' monde': 18542, 'こんにちは': 48921, '世界': 11520, ' Hello': 9906,
    'мир': 25301, '你好': 39201, 'مرحبا': 84210, ' بالعالم': 91040
  },
  'llama3_128k': {
    ' ': 256, '  ': 262, '    ': 270, '\n': 198, '\n\n': 271,
    'The': 791, ' the': 279, ' a': 264, ' is': 374, ' to': 311, ' of': 315,
    ' quick': 4062, ' brown': 14198, ' fox': 39935, ' jumps': 34969, ' over': 927, ' lazy': 16931, ' dog': 5679,
    'token': 4037, ' tokens': 16370, ' def': 752, ' return': 704,
    'Bonjour': 62100, ' monde': 18200, 'こんにちは': 47100, '世界': 11300
  }
};

/**
 * Deterministic hash-based Token ID generator for vocabulary emulation
 * Guarantees that the same token in the same model family always receives the identical ID,
 * bounded within the model's true vocabulary size.
 */
function getDeterministicTokenId(tokenStr, modelKey) {
  const profile = MODEL_PROFILES[modelKey] || MODEL_PROFILES['gpt-4o'];
  const encoding = profile.encoding;

  // Check known seed dictionary first
  if (BASE_KNOWN_TOKENS[encoding] && BASE_KNOWN_TOKENS[encoding][tokenStr] !== undefined) {
    return BASE_KNOWN_TOKENS[encoding][tokenStr];
  }

  // Check special tokens
  if (SPECIAL_TOKENS[tokenStr] !== undefined) {
    return SPECIAL_TOKENS[tokenStr];
  }

  // FNV-1a hash algorithm
  let hash = 2166136261;
  const bytes = new TextEncoder().encode(tokenStr);
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 16777619);
  }

  // Model-specific salt to reflect distinct vocabularies
  const salt = modelKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42);
  hash = (hash ^ salt) >>> 0;

  // Reserved range offset (common tokens occupy lower range 1000 - 90000)
  const maxVocab = profile.vocabSize;
  const minId = 1000;
  return minId + (hash % (maxVocab - minId - 100));
}

/**
 * Pre-tokenization regular expressions tailored for each model architecture.
 * Implements the standard Tiktoken & HuggingFace tokenization boundaries.
 */
const PRE_TOKENIZE_PATTERNS = {
  // OpenAI cl100k_base (GPT-4)
  'cl100k_base': /(?:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu,
  
  // OpenAI o200k_base (GPT-4o) - Larger number chunks (up to 8 digits) and improved multilingual clustering
  'o200k_base': /(?:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,8}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu,
  
  // Meta Llama 3 (128k)
  'llama3_128k': /(?:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,4}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu,
  
  // Claude 3.5 BPE
  'claude_bpe': /(?:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/gu,
  
  // Gemma 2 (SentencePiece) - Prefixes spaces with   character
  'gemma_sp': /[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}+|[^\s\p{L}\p{N}]+|\s+/gu,
  
  // GPT-2 Legacy (r50k_base) - Single characters for non-ASCII
  'r50k_base': /(?:'s|'t|'re|'ve|'m|'ll|'d)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu
};

/**
 * Checks if a substring looks like a special token (e.g. <|im_start|>)
 */
function extractSpecialTokens(text) {
  const specialRegex = /<\|[^|>]+(?:\|>)?|<[a-zA-Z0-9_\-\/]+>|\[\/?[A-Z]+\]/g;
  const matches = [];
  let m;
  while ((m = specialRegex.exec(text)) !== null) {
    if (SPECIAL_TOKENS[m[0]] !== undefined || m[0].startsWith('<|') || m[0].startsWith('[/') || m[0] === '[INST]') {
      matches.push({
        token: m[0],
        index: m.index,
        length: m[0].length
      });
    }
  }
  return matches;
}

/**
 * Subword BPE splitting logic for individual pre-tokenized chunks.
 * Simulates realistic subword merges and vocabulary lookups.
 */
function splitSubwords(chunk, modelKey) {
  const profile = MODEL_PROFILES[modelKey] || MODEL_PROFILES['gpt-4o'];
  const encoding = profile.encoding;

  // 1. If chunk is known verbatim, return directly
  if (BASE_KNOWN_TOKENS[encoding] && BASE_KNOWN_TOKENS[encoding][chunk]) {
    return [chunk];
  }

  // 2. Whitespace chunks
  if (/^\s+$/.test(chunk)) {
    // Standard Tiktoken splits spaces into chunks of 4 or 8
    if (chunk === '    ' || chunk === '   ' || chunk === '  ' || chunk === ' ' || chunk === '\n' || chunk === '\t') {
      return [chunk];
    }
    const chunks = [];
    let rem = chunk;
    while (rem.length > 0) {
      if (rem.startsWith('        ') && (modelKey === 'gpt-4o' || modelKey === 'llama-3')) {
        chunks.push('        ');
        rem = rem.slice(8);
      } else if (rem.startsWith('    ')) {
        chunks.push('    ');
        rem = rem.slice(4);
      } else if (rem.startsWith('  ')) {
        chunks.push('  ');
        rem = rem.slice(2);
      } else {
        chunks.push(rem[0]);
        rem = rem.slice(1);
      }
    }
    return chunks;
  }

  // 3. Multilingual script heuristics (CJK, Cyrillic, Arabic, Devangari)
  const isCJK = /[\u4e00-\u9fa5\u3040-\u30ff]/.test(chunk);
  const isCyrillic = /[\u0400-\u04ff]/.test(chunk);
  const isArabic = /[\u0600-\u06ff]/.test(chunk);
  const isDevanagari = /[\u0900-\u097f]/.test(chunk);

  if (isCJK || isCyrillic || isArabic || isDevanagari) {
    // o200k and Llama 3 have massive multilingual vocabularies, grouping 2-4 characters per token
    if (modelKey === 'gpt-4o' || modelKey === 'llama-3' || modelKey === 'gemma-2') {
      if (chunk.length <= 4) return [chunk];
      const res = [];
      for (let i = 0; i < chunk.length; i += 3) {
        res.push(chunk.slice(i, i + 3));
      }
      return res;
    } else if (modelKey === 'gpt-4') {
      // cl100k groups 1-2 characters per token
      if (chunk.length <= 2) return [chunk];
      const res = [];
      for (let i = 0; i < chunk.length; i += 2) {
        res.push(chunk.slice(i, i + 2));
      }
      return res;
    } else {
      // GPT-2 splits non-ASCII into individual UTF-8 bytes!
      return Array.from(chunk);
    }
  }

  // 4. Emojis and multi-byte unicode
  if (/\p{Emoji}/u.test(chunk)) {
    // Modern tokenizers keep simple emojis together, complex ones may split into code points
    const emojis = Array.from(chunk);
    if (modelKey === 'gpt-4o' || modelKey === 'llama-3') {
      return emojis;
    } else if (modelKey === 'gpt-4') {
      return emojis;
    } else {
      // Byte fallback
      const bytes = new TextEncoder().encode(chunk);
      return Array.from(bytes).map(b => String.fromCharCode(b));
    }
  }

  // 5. English word subword decomposition
  // Short words (<= 7 chars) are usually a single token in 100k+ vocabularies
  const cleanWord = chunk.trim();
  const hasLeadingSpace = chunk.startsWith(' ');

  if (cleanWord.length <= 7) {
    return [chunk];
  }

  // Standard common English prefixes and suffixes
  const prefixes = ['un', 'in', 'dis', 'non', 'pre', 'post', 'anti', 're', 'sub', 'inter', 'over'];
  const suffixes = ['ing', 'tion', 'tions', 'ment', 'ments', 'able', 'ible', 'ness', 'ful', 'less', 'ity', 'ities', 'ized', 'ization', 'er', 'ers', 'est', 'ly', 'ed'];

  // Check if prefix match
  let target = cleanWord;
  let prefix = '';
  for (const p of prefixes) {
    if (target.toLowerCase().startsWith(p) && target.length > p.length + 3) {
      prefix = target.slice(0, p.length);
      target = target.slice(p.length);
      break;
    }
  }

  // Check if suffix match
  let suffix = '';
  for (const s of suffixes) {
    if (target.toLowerCase().endsWith(s) && target.length > s.length + 2) {
      suffix = target.slice(target.length - s.length);
      target = target.slice(0, target.length - s.length);
      break;
    }
  }

  const parts = [];
  if (prefix) {
    parts.push(hasLeadingSpace ? ' ' + prefix : prefix);
  }
  if (target) {
    const rootToken = (hasLeadingSpace && !prefix) ? ' ' + target : target;
    // If root is still long, split in half
    if (target.length > 9 && (modelKey === 'gpt-2' || modelKey === 'gpt-4')) {
      const half = Math.ceil(target.length / 2);
      parts.push((hasLeadingSpace && !prefix) ? ' ' + target.slice(0, half) : target.slice(0, half));
      parts.push(target.slice(half));
    } else {
      parts.push(rootToken);
    }
  }
  if (suffix) {
    parts.push(suffix);
  }

  return parts.length > 0 ? parts : [chunk];
}

/**
 * Determine token category/type for styling and badge classification
 */
function classifyToken(text) {
  if (SPECIAL_TOKENS[text] !== undefined || (text.startsWith('<|') && text.endsWith('|>'))) {
    return 'special';
  }
  if (/^\s+$/.test(text)) {
    return 'whitespace';
  }
  if (/^\d+$/.test(text)) {
    return 'number';
  }
  if (/^[\p{P}\p{S}]+$/u.test(text)) {
    return 'punctuation';
  }
  if (/\p{Emoji}/u.test(text)) {
    return 'emoji';
  }
  if (/^ ?[A-Za-z]+$/.test(text)) {
    return 'word';
  }
  return 'subword';
}

/**
 * Main tokenize function
 * Accepts text and modelId, returns array of token objects with rich metadata
 */
function tokenize(text, modelKey = 'gpt-4o') {
  if (!text || text.length === 0) {
    return [];
  }

  const profile = MODEL_PROFILES[modelKey] || MODEL_PROFILES['gpt-4o'];
  const regex = PRE_TOKENIZE_PATTERNS[profile.encoding] || PRE_TOKENIZE_PATTERNS['o200k_base'];

  // 1. Identify special tokens first
  const specialMatches = extractSpecialTokens(text);
  
  // 2. Perform pre-tokenization
  const rawChunks = [];
  let lastIndex = 0;

  if (specialMatches.length > 0) {
    for (const sm of specialMatches) {
      if (sm.index > lastIndex) {
        const seg = text.slice(lastIndex, sm.index);
        const matches = seg.match(regex) || [seg];
        rawChunks.push(...matches);
      }
      rawChunks.push(sm.token);
      lastIndex = sm.index + sm.length;
    }
    if (lastIndex < text.length) {
      const seg = text.slice(lastIndex);
      const matches = seg.match(regex) || [seg];
      rawChunks.push(...matches);
    }
  } else {
    const matches = text.match(regex);
    if (matches) {
      rawChunks.push(...matches);
    } else {
      rawChunks.push(text);
    }
  }

  // 3. Subword decomposition per chunk
  const finalTokens = [];
  let charCursor = 0;
  let colorIdx = 0;

  const encoder = new TextEncoder();

  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];
    
    // Check if special token
    if (SPECIAL_TOKENS[chunk] !== undefined || (chunk.startsWith('<|') && chunk.endsWith('|>'))) {
      const bytes = encoder.encode(chunk);
      const hex = Array.from(bytes).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
      finalTokens.push({
        index: finalTokens.length,
        id: SPECIAL_TOKENS[chunk] || getDeterministicTokenId(chunk, modelKey),
        text: chunk,
        bytes: Array.from(bytes),
        byteLength: bytes.length,
        hex: hex,
        startChar: charCursor,
        endChar: charCursor + chunk.length,
        type: 'special',
        colorIndex: colorIdx % 7
      });
      charCursor += chunk.length;
      colorIdx++;
      continue;
    }

    const subwords = splitSubwords(chunk, modelKey);

    for (const sub of subwords) {
      const bytes = encoder.encode(sub);
      const hex = Array.from(bytes).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
      const tokenId = getDeterministicTokenId(sub, modelKey);
      const type = classifyToken(sub);

      finalTokens.push({
        index: finalTokens.length,
        id: tokenId,
        text: sub,
        bytes: Array.from(bytes),
        byteLength: bytes.length,
        hex: hex,
        startChar: charCursor,
        endChar: charCursor + sub.length,
        type: type,
        colorIndex: colorIdx % 7
      });

      charCursor += sub.length;
      colorIdx++;
    }
  }

  return finalTokens;
}

/**
 * Calculates comprehensive metrics for a given tokenization output
 */
function calculateMetrics(tokens, rawText) {
  const tokenCount = tokens.length;
  const charCount = rawText.length;
  const wordCount = (rawText.trim().match(/\S+/g) || []).length;
  const byteCount = new TextEncoder().encode(rawText).length;

  const tokensPerWord = wordCount > 0 ? (tokenCount / wordCount).toFixed(2) : '0.00';
  const charsPerToken = tokenCount > 0 ? (charCount / tokenCount).toFixed(2) : '0.00';
  const bytesPerToken = tokenCount > 0 ? (byteCount / tokenCount).toFixed(2) : '0.00';

  return {
    tokenCount,
    charCount,
    wordCount,
    byteCount,
    tokensPerWord,
    charsPerToken,
    bytesPerToken
  };
}

/**
 * Compares tokenization efficiency across all supported models
 */
function compareAllModels(rawText) {
  const results = {};
  const models = Object.keys(MODEL_PROFILES);

  for (const m of models) {
    const tokens = tokenize(rawText, m);
    const metrics = calculateMetrics(tokens, rawText);
    results[m] = {
      profile: MODEL_PROFILES[m],
      tokens,
      metrics
    };
  }

  return results;
}
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
function getRawPredictions(promptText) {
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
function computeSamplingDistribution(rawCandidates, promptText, options = {}) {
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
function sampleNextToken(candidates) {
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
/**
 * LLM Token Explorer - Cost & Efficiency Estimator
 * Real-time API pricing rates (per 1M tokens) across top industry LLMs
 */

const PRICING_MODELS = [
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputPer1M: 2.50,
    outputPer1M: 10.00,
    contextWindow: '128k',
    isFlagship: true,
    badgeColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o-mini',
    provider: 'OpenAI',
    inputPer1M: 0.15,
    outputPer1M: 0.60,
    contextWindow: '128k',
    isFlagship: false,
    badgeColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    contextWindow: '200k',
    isFlagship: true,
    badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputPer1M: 0.80,
    outputPer1M: 4.00,
    contextWindow: '200k',
    isFlagship: false,
    badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google',
    inputPer1M: 1.25,
    outputPer1M: 5.00,
    contextWindow: '2M',
    isFlagship: true,
    badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Google Gemini 1.5 Flash',
    provider: 'Google',
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    contextWindow: '1M',
    isFlagship: false,
    badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
  },
  {
    id: 'llama-3-1-70b',
    name: 'Meta Llama 3.1 70B',
    provider: 'Meta / Hosted',
    inputPer1M: 0.59,
    outputPer1M: 0.79,
    contextWindow: '128k',
    isFlagship: false,
    badgeColor: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
  },
  {
    id: 'llama-3-1-8b',
    name: 'Meta Llama 3.1 8B',
    provider: 'Meta / Hosted',
    inputPer1M: 0.05,
    outputPer1M: 0.08,
    contextWindow: '128k',
    isFlagship: false,
    badgeColor: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
  }
];

/**
 * Calculates estimated cost for input tokens and simulated output tokens
 */
function calculateModelCosts(inputTokens, outputTokens = 500, requestVolume = 1000) {
  const safeInput = Math.max(0, inputTokens);
  const safeOutput = Math.max(0, outputTokens);
  const safeVolume = Math.max(1, requestVolume);

  return PRICING_MODELS.map(model => {
    const inputCost = (safeInput / 1_000_000) * model.inputPer1M;
    const outputCost = (safeOutput / 1_000_000) * model.outputPer1M;
    const singleRequestCost = inputCost + outputCost;
    const monthlyCost = singleRequestCost * safeVolume;

    return {
      ...model,
      inputCost,
      outputCost,
      singleRequestCost,
      monthlyCost,
      formattedSingle: formatCurrency(singleRequestCost),
      formattedMonthly: formatCurrency(monthlyCost)
    };
  });
}

function formatCurrency(val) {
  if (val === 0) return '$0.00';
  if (val < 0.000001) return '< $0.000001';
  if (val < 0.001) return '$' + val.toFixed(6);
  if (val < 0.01) return '$' + val.toFixed(4);
  if (val < 100) return '$' + val.toFixed(2);
  return '$' + Math.round(val).toLocaleString();
}
/**
 * LLM Token Explorer - Interactive BPE Vocabulary Builder
 * Simulates real Byte-Pair Encoding (BPE) vocabulary learning from a custom corpus.
 * Tracks character frequencies, pair co-occurrences, merge rule generation, and live re-tokenization.
 */

class BPEVocabularyBuilder {
  constructor(initialCorpus = '') {
    this.initialCorpus = initialCorpus || 'low lower lowest newest widest wider low low lowest';
    this.corpus = this.initialCorpus;
    this.words = [];
    this.vocab = new Set();
    this.merges = []; // Array of { rank, pair: [a, b], newToken: string, count: number }
    this.stepCount = 0;
    this.reset();
  }

  reset(newCorpus = null) {
    if (newCorpus !== null) {
      this.corpus = newCorpus;
    }
    this.stepCount = 0;
    this.merges = [];
    this.vocab = new Set();

    // 1. Split corpus into words with end-of-word boundary indicator '</w>'
    const rawWords = (this.corpus.trim().match(/\S+/g) || ['low', 'lower', 'newest', 'widest']);
    this.words = rawWords.map(word => {
      const chars = Array.from(word);
      chars[chars.length - 1] = chars[chars.length - 1] + '</w>';
      return chars;
    });

    // 2. Base character vocabulary
    this.words.forEach(charList => {
      charList.forEach(ch => this.vocab.add(ch));
    });
  }

  getPairFrequencies() {
    const pairs = new Map();

    this.words.forEach(wordSymbols => {
      for (let i = 0; i < wordSymbols.length - 1; i++) {
        const pKey = `${wordSymbols[i]}|${wordSymbols[i + 1]}`;
        pairs.set(pKey, (pairs.get(pKey) || 0) + 1);
      }
    });

    // Convert to sorted array
    const sorted = [];
    pairs.forEach((count, key) => {
      const [first, second] = key.split('|');
      sorted.push({ first, second, key, count });
    });

    sorted.sort((a, b) => b.count - a.count);
    return sorted;
  }

  step() {
    const pairFreqs = this.getPairFrequencies();
    if (pairFreqs.length === 0) {
      return null; // No more pairs to merge
    }

    const best = pairFreqs[0];
    const newToken = best.first + best.second;

    // Apply merge across words
    this.words = this.words.map(wordSymbols => {
      const newSymbols = [];
      let i = 0;
      while (i < wordSymbols.length) {
        if (i < wordSymbols.length - 1 && wordSymbols[i] === best.first && wordSymbols[i + 1] === best.second) {
          newSymbols.push(newToken);
          i += 2;
        } else {
          newSymbols.push(wordSymbols[i]);
          i += 1;
        }
      }
      return newSymbols;
    });

    this.stepCount++;
    this.vocab.add(newToken);

    const mergeRecord = {
      rank: this.stepCount,
      pair: [best.first, best.second],
      newToken: newToken,
      count: best.count,
      id: 1000 + this.stepCount
    };

    this.merges.push(mergeRecord);
    return mergeRecord;
  }

  runMultiple(n = 5) {
    const records = [];
    for (let i = 0; i < n; i++) {
      const res = this.step();
      if (!res) break;
      records.push(res);
    }
    return records;
  }

  getCurrentCorpusTokens() {
    return this.words.map((word, wIdx) => {
      return word.map((token, tIdx) => ({
        token: token,
        display: token.replace('</w>', ''),
        isEndOfWord: token.endsWith('</w>'),
        id: this.getTokenId(token),
        colorIndex: (wIdx + tIdx) % 7
      }));
    });
  }

  getTokenId(token) {
    const merge = this.merges.find(m => m.newToken === token);
    if (merge) return merge.id;

    // Deterministic base char ID
    let code = 100;
    for (let i = 0; i < token.length; i++) {
      code += token.charCodeAt(i);
    }
    return code;
  }

  getVocabularyList() {
    const baseTokens = [];
    const mergedTokens = [];

    this.vocab.forEach(t => {
      const isMerged = this.merges.some(m => m.newToken === t);
      if (isMerged) {
        mergedTokens.push(t);
      } else {
        baseTokens.push(t);
      }
    });

    return {
      totalSize: this.vocab.size,
      baseTokens: baseTokens.sort(),
      mergedTokens: mergedTokens
    };
  }
}
/**
 * LLM Token Explorer - 3D Vector Embedding Space Visualizer
 * Renders high-dimensional semantic word embeddings projected into 3D.
 * Supports interactive rotation, zoom, panning, semantic clusters, nearest-neighbor
 * constellation lines, and dynamic single-token injection with animated camera focus.
 */

const INITIAL_EMBEDDINGS = [
  // AI & Tech (Cluster: ai, Hue: Violet/Indigo)
  { token: 'token', cluster: 'ai', x: 120, y: 80, z: -40, color: '#818cf8' },
  { token: 'model', cluster: 'ai', x: 140, y: 110, z: -20, color: '#818cf8' },
  { token: 'neural', cluster: 'ai', x: 90, y: 130, z: -60, color: '#818cf8' },
  { token: 'transformer', cluster: 'ai', x: 160, y: 90, z: -80, color: '#818cf8' },
  { token: 'attention', cluster: 'ai', x: 110, y: 150, z: -50, color: '#818cf8' },
  { token: 'vector', cluster: 'ai', x: 130, y: 50, z: -70, color: '#818cf8' },
  { token: 'weights', cluster: 'ai', x: 80, y: 90, z: -30, color: '#818cf8' },
  { token: 'gpu', cluster: 'ai', x: 170, y: 130, z: -30, color: '#818cf8' },

  // Nature & Cosmos (Cluster: cosmos, Hue: Emerald/Teal)
  { token: 'galaxy', cluster: 'cosmos', x: -130, y: 100, z: 90, color: '#34d399' },
  { token: 'star', cluster: 'cosmos', x: -160, y: 80, z: 120, color: '#34d399' },
  { token: 'nebula', cluster: 'cosmos', x: -110, y: 130, z: 70, color: '#34d399' },
  { token: 'planet', cluster: 'cosmos', x: -140, y: 60, z: 140, color: '#34d399' },
  { token: 'ocean', cluster: 'cosmos', x: -90, y: -40, z: 110, color: '#2dd4bf' },
  { token: 'forest', cluster: 'cosmos', x: -120, y: -80, z: 80, color: '#2dd4bf' },
  { token: 'mountain', cluster: 'cosmos', x: -150, y: -60, z: 130, color: '#2dd4bf' },

  // Animals & Life (Cluster: animals, Hue: Amber/Orange)
  { token: 'fox', cluster: 'animals', x: 110, y: -120, z: 80, color: '#fbbf24' },
  { token: 'wolf', cluster: 'animals', x: 140, y: -100, z: 110, color: '#fbbf24' },
  { token: 'falcon', cluster: 'animals', x: 80, y: -150, z: 60, color: '#fb923c' },
  { token: 'eagle', cluster: 'animals', x: 60, y: -130, z: 90, color: '#fb923c' },
  { token: 'lion', cluster: 'animals', x: 150, y: -140, z: 70, color: '#fbbf24' },
  { token: 'dolphin', cluster: 'animals', x: 120, y: -70, z: 130, color: '#f59e0b' },
  { token: 'tiger', cluster: 'animals', x: 160, y: -110, z: 50, color: '#fbbf24' },

  // Actions & Verbs (Cluster: actions, Hue: Sky/Cyan)
  { token: 'explore', cluster: 'actions', x: -60, y: -120, z: -110, color: '#38bdf8' },
  { token: 'predict', cluster: 'actions', x: -30, y: -90, z: -140, color: '#38bdf8' },
  { token: 'generate', cluster: 'actions', x: -80, y: -140, z: -90, color: '#38bdf8' },
  { token: 'learn', cluster: 'actions', x: -40, y: -70, z: -120, color: '#38bdf8' },
  { token: 'compute', cluster: 'actions', x: 10, y: -100, z: -130, color: '#38bdf8' },
  { token: 'create', cluster: 'actions', x: -90, y: -110, z: -70, color: '#38bdf8' },

  // Abstract & Mind (Cluster: abstract, Hue: Rose/Pink)
  { token: 'curiosity', cluster: 'abstract', x: -40, y: 140, z: -80, color: '#f43f5e' },
  { token: 'harmony', cluster: 'abstract', x: 0, y: 160, z: -50, color: '#f43f5e' },
  { token: 'intelligence', cluster: 'abstract', x: 40, y: 130, z: -70, color: '#fb7185' },
  { token: 'dream', cluster: 'abstract', x: -60, y: 110, z: -110, color: '#f43f5e' },
  { token: 'future', cluster: 'abstract', x: 20, y: 170, z: -90, color: '#fb7185' }
];

const CLUSTER_CONFIG = {
  ai: { label: 'AI & Computing', color: '#818cf8', center: [130, 90, -50] },
  cosmos: { label: 'Nature & Cosmos', color: '#34d399', center: [-130, 60, 100] },
  animals: { label: 'Animals & Life', color: '#fbbf24', center: [120, -120, 80] },
  actions: { label: 'Actions & Verbs', color: '#38bdf8', center: [-50, -100, -110] },
  abstract: { label: 'Abstract & Mind', color: '#f43f5e', center: [-10, 140, -80] },
  custom: { label: 'User Added', color: '#ec4899', center: [0, 0, 0] }
};

class EmbeddingVisualizer3D {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.nodes = JSON.parse(JSON.stringify(INITIAL_EMBEDDINGS));
    this.filteredCluster = 'all';
    this.selectedNode = null;
    this.hoveredNode = null;
    this.showLines = true;
    this.autoRotate = true;

    // Camera angles
    this.rotX = 0.35;
    this.rotY = -0.55;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Focus target animation
    this.focusTarget = null;
    this.newlyAddedToken = null;
    this.beaconPulse = 0;

    this.onSelectNode = options.onSelectNode || null;

    this.initCanvas();
    this.setupEvents();
    this.startLoop();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block cursor-grab active:cursor-grabbing select-none';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = rect.height || 500;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.autoRotate = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.rotY += dx * 0.006;
        this.rotX += dy * 0.006;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        this.handleHover(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.max(0.4, Math.min(2.5, this.zoom * delta));
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      const node = this.getNodeAtScreen(e.clientX, e.clientY);
      if (node) {
        this.selectNode(node);
      }
    });
  }

  handleHover(e) {
    const node = this.getNodeAtScreen(e.clientX, e.clientY);
    if (node !== this.hoveredNode) {
      this.hoveredNode = node;
      this.canvas.style.cursor = node ? 'pointer' : (this.isDragging ? 'grabbing' : 'grab');
    }
  }

  getNodeAtScreen(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const projected = this.getProjectedNodes();
    // Search in reverse order (closest first)
    for (let i = projected.length - 1; i >= 0; i--) {
      const p = projected[i];
      const dist = Math.hypot(p.sx - mx, p.sy - my);
      if (dist <= p.radius + 6) {
        return p.node;
      }
    }
    return null;
  }

  selectNode(node) {
    this.selectedNode = node;
    if (this.onSelectNode) {
      const neighbors = this.findNearestNeighbors(node, 4);
      this.onSelectNode(node, neighbors);
    }
  }

  /**
   * Adds a single custom token to the 3D embedding space!
   * Automatically calculates 3D coordinates, spawns with a beacon burst,
   * animates camera rotation to center the token, and draws neighbor lines.
   */
  addToken(tokenStr, cluster = 'custom') {
    if (!tokenStr || !tokenStr.trim()) return null;
    const clean = tokenStr.trim();

    // Check if already exists
    const existing = this.nodes.find(n => n.token.toLowerCase() === clean.toLowerCase());
    if (existing) {
      this.focusOnNode(existing);
      this.selectNode(existing);
      return existing;
    }

    // Determine cluster center
    const clusterCfg = CLUSTER_CONFIG[cluster] || CLUSTER_CONFIG.custom;
    const [cx, cy, cz] = clusterCfg.center;

    // Deterministic jitter based on token string hash
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash |= 0;
    }
    const jx = ((Math.abs(hash) % 70) - 35);
    const jy = ((Math.abs(hash * 3) % 70) - 35);
    const jz = ((Math.abs(hash * 7) % 70) - 35);

    const newNode = {
      token: clean,
      cluster: cluster,
      x: cx + jx,
      y: cy + jy,
      z: cz + jz,
      color: clusterCfg.color,
      isUserAdded: true,
      birthTime: Date.now()
    };

    this.nodes.push(newNode);
    this.newlyAddedToken = newNode;
    this.beaconPulse = 1.0;

    this.focusOnNode(newNode);
    this.selectNode(newNode);
    return newNode;
  }

  focusOnNode(node) {
    // Calculate rotation angles to face the node
    const angleY = -Math.atan2(node.x, node.z);
    const distXZ = Math.hypot(node.x, node.z);
    const angleX = Math.atan2(node.y, distXZ);

    this.targetRotY = angleY;
    this.targetRotX = angleX;
    this.animatingCamera = true;
  }

  findNearestNeighbors(targetNode, count = 3) {
    const dists = this.nodes
      .filter(n => n !== targetNode)
      .map(n => {
        const dx = n.x - targetNode.x;
        const dy = n.y - targetNode.y;
        const dz = n.z - targetNode.z;
        const dist = Math.hypot(dx, dy, dz);
        // Cosine similarity approximation
        const maxDist = 350;
        const similarity = Math.max(0.1, +(1.0 - (dist / maxDist)).toFixed(3));
        return { node: n, dist, similarity };
      });

    dists.sort((a, b) => a.dist - b.dist);
    return dists.slice(0, count);
  }

  getProjectedNodes() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const fov = 400 * this.zoom;

    // Rotation matrices
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const visibleNodes = this.nodes.filter(n => {
      if (this.filteredCluster === 'all') return true;
      return n.cluster === this.filteredCluster;
    });

    const projected = [];

    for (const node of visibleNodes) {
      // 1. Rotate around Y
      let x1 = node.x * cosY + node.z * sinY;
      let y1 = node.y;
      let z1 = -node.x * sinY + node.z * cosY;

      // 2. Rotate around X
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // Distance offset from camera
      const cameraZ = 380;
      const zDepth = z2 + cameraZ;

      if (zDepth > 20) {
        const scale = fov / zDepth;
        const sx = cx + x2 * scale;
        const sy = cy - y2 * scale;
        const baseRadius = node.isUserAdded ? 7.5 : 5.5;
        const radius = Math.max(2.5, baseRadius * scale * 0.7);

        projected.push({
          node,
          sx,
          sy,
          zDepth,
          scale,
          radius
        });
      }
    }

    // Sort by depth so distant nodes are drawn first
    projected.sort((a, b) => b.zDepth - a.zDepth);
    return projected;
  }

  startLoop() {
    const render = () => {
      this.update();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  update() {
    if (this.autoRotate) {
      this.rotY += 0.002;
    }

    // Camera glide animation
    if (this.animatingCamera) {
      this.rotY += (this.targetRotY - this.rotY) * 0.08;
      this.rotX += (this.targetRotX - this.rotX) * 0.08;
      if (Math.abs(this.targetRotY - this.rotY) < 0.01 && Math.abs(this.targetRotX - this.rotX) < 0.01) {
        this.animatingCamera = false;
      }
    }

    // Beacon pulse decay
    if (this.beaconPulse > 0) {
      this.beaconPulse = Math.max(0, this.beaconPulse - 0.008);
    }
  }

  draw() {
    const ctx = this.ctx;
    const isDark = document.documentElement.classList.contains('dark');

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // Subtle 3D Depth Grid Floor / Origin Axes
    this.drawAxes(ctx, isDark);

    const projected = this.getProjectedNodes();
    const projMap = new Map();
    projected.forEach(p => projMap.set(p.node, p));

    // 1. Draw Constellation lines between nearest neighbors
    if (this.showLines) {
      ctx.lineWidth = 1;
      const drawnPairs = new Set();

      projected.forEach(p => {
        const neighbors = this.findNearestNeighbors(p.node, 2);
        neighbors.forEach(nb => {
          const np = projMap.get(nb.node);
          if (np) {
            const pairKey = [p.node.token, nb.node.token].sort().join('-');
            if (!drawnPairs.has(pairKey)) {
              drawnPairs.add(pairKey);
              const isHighlight = (this.selectedNode === p.node || this.selectedNode === nb.node);
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(np.sx, np.sy);
              if (isHighlight) {
                ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.7)';
                ctx.lineWidth = 1.8;
              } else {
                ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.25)';
                ctx.lineWidth = 0.8;
              }
              ctx.stroke();
            }
          }
        });
      });
    }

    // 2. Draw Nodes & Labels
    projected.forEach(p => {
      const node = p.node;
      const isSelected = (node === this.selectedNode);
      const isHovered = (node === this.hoveredNode);
      const isNew = (node === this.newlyAddedToken && this.beaconPulse > 0);

      // Expanding beacon wave for newly added custom token!
      if (isNew) {
        ctx.beginPath();
        const beaconRadius = p.radius + (1.0 - this.beaconPulse) * 45;
        ctx.arc(p.sx, p.sy, beaconRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(236, 72, 153, ${this.beaconPulse * 0.8})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Outer Glow Halo
      ctx.beginPath();
      const glowRadius = isSelected ? p.radius * 2.8 : (isHovered ? p.radius * 2.2 : p.radius * 1.5);
      ctx.arc(p.sx, p.sy, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected
        ? (isDark ? 'rgba(96, 165, 250, 0.35)' : 'rgba(37, 99, 235, 0.25)')
        : `${node.color}${isDark ? '33' : '26'}`;
      ctx.fill();

      // Core Sphere
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffffff' : node.color;
      ctx.fill();

      // Border Ring
      ctx.lineWidth = isSelected ? 2.5 : 1.2;
      ctx.strokeStyle = isSelected ? '#2563eb' : (isDark ? '#0f172a' : '#ffffff');
      ctx.stroke();

      // Floating Text Label
      ctx.font = `${isSelected || isHovered ? 'bold 12px' : '10px'} 'JetBrains Mono', monospace`;
      ctx.fillStyle = isSelected
        ? (isDark ? '#60a5fa' : '#1d4ed8')
        : (isDark ? '#e2e8f0' : '#334155');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(node.token, p.sx, p.sy - p.radius - 3);

      // Star badge for user-added token
      if (node.isUserAdded) {
        ctx.font = '8px sans-serif';
        ctx.fillText('✨', p.sx + p.radius + 6, p.sy - 2);
      }
    });
  }

  drawAxes(ctx, isDark) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const fov = 400 * this.zoom;
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const projectPoint = (x, y, z) => {
      let x1 = x * cosY + z * sinY;
      let y1 = y;
      let z1 = -x * sinY + z * cosY;

      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      const zDepth = z2 + 380;
      if (zDepth <= 20) return null;
      const scale = fov / zDepth;
      return { sx: cx + x2 * scale, sy: cy - y2 * scale };
    };

    const origin = projectPoint(0, 0, 0);
    const pX = projectPoint(180, 0, 0);
    const pY = projectPoint(0, 180, 0);
    const pZ = projectPoint(0, 0, 180);

    if (origin && pX && pY && pZ) {
      // X axis
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(pX.sx, pX.sy);
      ctx.strokeStyle = isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)';
      ctx.stroke();

      // Y axis
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(pY.sx, pY.sy);
      ctx.strokeStyle = isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)';
      ctx.stroke();

      // Z axis
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(pZ.sx, pZ.sy);
      ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)';
      ctx.stroke();
    }
  }

  setFilter(cluster) {
    this.filteredCluster = cluster;
  }

  resetCamera() {
    this.rotX = 0.35;
    this.rotY = -0.55;
    this.zoom = 1.0;
    this.autoRotate = true;
    this.selectedNode = null;
  }
}
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

})();
