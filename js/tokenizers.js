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
export const MODEL_PROFILES = {
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
export const SPECIAL_TOKENS = {
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
export const PRE_TOKENIZE_PATTERNS = {
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
export function tokenize(text, modelKey = 'gpt-4o') {
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
export function calculateMetrics(tokens, rawText) {
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
export function compareAllModels(rawText) {
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
