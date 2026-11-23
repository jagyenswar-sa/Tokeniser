/**
 * LLM Token Explorer - Interactive BPE Vocabulary Builder
 * Simulates real Byte-Pair Encoding (BPE) vocabulary learning from a custom corpus.
 * Tracks character frequencies, pair co-occurrences, merge rule generation, and live re-tokenization.
 */

export class BPEVocabularyBuilder {
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
