# 🧩 LLM Token Explorer (v2.5)

> A modern, bright, interactive LLM Tokenizer, BPE Vocabulary Builder, 3D Vector Embedding Visualizer, Multi-Model Comparison & Logits Simulator.
> 
> **Designed & Engineered by [Jagyenswar Sa](file:///Users/sonu/nst/Antigravity%20IDE/Tokeniser/index.html)** • *Inspired by [llm-token-explorer.vercel.app](https://llm-token-explorer.vercel.app/)*

---

## 🌟 Overview

**LLM Token Explorer** is a comprehensive client-side educational and research suite built for AI engineers, researchers, and developers to explore how Large Language Models ingest text, build subword vocabularies from raw data, and project tokens into multidimensional semantic vector spaces.

---

## 🚀 Key Features

### 1. 🔍 Interactive Token Explorer
- **Live BPE Segmentation**: Instant, zero-latency tokenization as you type, paste, or load files.
- **7-Hue High-Contrast Palette**: Distinct alternating pastel backgrounds and saturated borders (Sky, Purple, Amber, Emerald, Rose, Indigo, Teal) making adjacent subwords and token boundaries immediately distinct in both Light and Dark modes.
- **4 Flexible Display Modes**:
  - **Flow View**: Natural reading flow with contiguous token highlighting.
  - **Chips View**: Spaced individual pills featuring the token text and subscript vocabulary ID badge (`#id`).
  - **Table View**: Detailed breakdown showing Index, Token String, Token ID, Byte count, Hex encoding, and Character spans.
  - **Raw IDs**: Formatted JSON array `[1234, 5678, ...]` with one-click clipboard copying.
- **Whitespace Character Toggle**: Highlights invisible characters with explicit glyphs (`·` for spaces, `↵` for newlines, `⇥` for tabs).
- **Deep Token Inspector Drawer**: Click any token pill to inspect its exact UTF-8 byte array, hexadecimal representation, character start/end offsets, and token category.
- **8 Curated Prompt Presets**: English, Multilingual, Python Code, Math/LaTeX, Emojis, Whitespace, ChatML Tokens (`<|im_start|>`), and Glitch Tokens.
- **File Upload**: Drag-and-drop or upload `.txt`, `.py`, `.js`, `.json`, `.md` files.

---

### 2. 🏗️ Interactive BPE Vocabulary Builder (New!)
Learn firsthand how modern LLMs (GPT-4o, Llama 3) build their vocabulary from raw training data:
- **Custom Training Corpus Input**: Type or paste any text or load one of the built-in textbook or AI corpora.
- **Candidate Pair Frequencies Table**: Shows real-time co-occurrence frequencies of adjacent character and subword pairs, automatically highlighting the next merge candidate.
- **Step-by-Step Merge Execution**: Click **"▶️ Step 1 Merge"** to merge the single most frequent pair, or **"⚡ Run 5 Merges"** to accelerate training.
- **Live Corpus Re-Tokenization Preview**: Watch the entire corpus dynamically re-tokenize as new compound tokens are added to the vocabulary.
- **Learned Merge Rulebook**: Chronological log of all merge operations with generated vocabulary IDs.
- **Export Vocabulary**: Copy the trained vocabulary and merge hierarchy as structured JSON.

---

### 3. 🪐 3D Vector Embedding Space Visualizer (New!)
Explore high-dimensional token representations projected into an interactive 3D coordinate space:
- **Interactive Orbit Camera**: Left-click and drag to rotate, mouse wheel to zoom, toggle continuous auto-rotation.
- **5 Semantic Clusters**:
  - 🟣 **AI & Computing** (`token`, `model`, `neural`, `transformer`, `vector`, `weights`, `gpu`, `attention`)
  - 🟢 **Nature & Cosmos** (`galaxy`, `star`, `nebula`, `planet`, `ocean`, `forest`, `mountain`)
  - 🟠 **Animals & Life** (`fox`, `wolf`, `falcon`, `eagle`, `lion`, `dolphin`, `tiger`)
  - 🔵 **Actions & Verbs** (`explore`, `predict`, `generate`, `learn`, `compute`, `create`)
  - 🔴 **Abstract & Mind** (`curiosity`, `harmony`, `intelligence`, `dream`, `future`)
- **✨ Add Single Token into 3D Space**:
  - Type any custom token (e.g. `quantum`, `jagyenswar`, `supernova`) and select its semantic cluster.
  - An animated **beacon burst** waves out from the newly spawned node!
  - The camera smoothly **glides and centers** onto the added token.
  - Automatically calculates 3D distances and draws **glowing constellation lines** to its nearest neighbors.
- **Nearest Neighbor HUD Inspector**: Hover or click any token in the 3D space to inspect its exact coordinates $(x, y, z)$ and cosine similarity percentages.
- **Cluster Filter**: Filter by individual clusters or view the full universe simultaneously.
- **Search in 3D**: Real-time search bar that snaps the camera view directly to matching tokens.

---

### 4. ⚖️ Multi-Model Side-by-Side Comparison
Simultaneously compare tokenization efficiency across 6 leading model families on the exact same input text:
- **OpenAI GPT-4o / GPT-4o-mini** (`o200k_base` — 200,019 vocabulary)
- **OpenAI GPT-4 / GPT-3.5** (`cl100k_base` — 100,277 vocabulary)
- **Meta Llama 3 / 3.1 / 3.2** (`128k` vocabulary)
- **Anthropic Claude 3.5 Sonnet** (`claude_bpe` — ~65,000 vocabulary)
- **Google Gemma 2** (`256k` SentencePiece vocabulary)
- **OpenAI GPT-2 / GPT-3 Legacy** (`r50k_base` — 50,257 vocabulary)

Metrics reported:
- Total Token Count
- Tokens / Word Ratio
- Characters / Token Compression
- Efficiency Delta (%) relative to GPT-4o baseline

---

### 5. 🎲 Logits & Autoregressive Sampling Simulator
Simulates how modern transformers generate output tokens step-by-step:
- **Interactive Hyperparameter Sliders**:
  - **Temperature ($0.0 \to 2.0$)**: Flatten or sharpen probability distribution.
  - **Top-P Nucleus ($0.1 \to 1.0$)**: Dynamic cumulative probability cutoff.
  - **Top-K ($1 \to 50$)**: Candidate pool truncation.
  - **Repetition Penalty ($1.0 \to 2.0$)**: Penalizes tokens already present in the prompt.
- **Real-Time Probability Bars**: Visual progress bars displaying logit scores, calculated softmax probabilities, and cutoff warnings.
- **"🎲 Sample & Step Next Token"**: Weighted random sampling that appends the chosen token to the active prompt in real-time.
- **Click-to-Append**: Click any candidate token row to immediately insert it into the prompt.

---

### 6. 💰 Real-Time Inference Cost Estimator
Calculates projected API inference expenditure using up-to-date provider pricing:
- Covers **GPT-4o, GPT-4o-mini, Claude 3.5 Sonnet, Claude 3.5 Haiku, Gemini 1.5 Pro, Gemini 1.5 Flash, Llama 3.1 70B, and Llama 3.1 8B**.
- Dynamic sliders for:
  - **Simulated Output Tokens** (50 to 4,000 tokens)
  - **Monthly Request Volume** (100 to 50,000 calls)
- Displays single-request cost and aggregate monthly forecast.

---

### 7. 📚 Tokenization 101 Visual Guide
Educational breakdown explaining:
- What tokens are and how they map to vector embeddings.
- How Byte-Pair Encoding (BPE) merges frequent byte pairs.
- Why LLMs struggle with character counting (e.g., `"strawberry"`).
- How modern 128k-200k vocabularies eliminated the "multilingual tax".

---

## 💻 Tech Stack & Architecture

- **100% Client-Side**: Zero data is sent to external servers. High privacy and zero latency.
- **Interactive 3D Engine**: Hardware-accelerated 3D vector space with depth sorting, orbit rotation, and dynamic raycasting.
- **Styling**: Tailwind CSS (via CDN) with custom CSS token badges, glassmorphic panels, and light/dark mode support.
- **Icons**: Scalable, crisp inline SVGs.
- **Typography**: Google Fonts (`Inter` for UI and `JetBrains Mono` for tokens and code).
- **Zero Build Setup Required**: Can be opened directly in any browser (`open index.html`).

---

## 🛠️ How to Run Locally

### Option 1: Direct File Open
Simply double-click [`index.html`](file:///Users/sonu/nst/Antigravity%20IDE/Tokeniser/index.html) or run in terminal:
```bash
open index.html
```

### Option 2: Local HTTP Server
```bash
# Using Python
python3 -m http.server 3000

# Open in browser:
# http://localhost:3000
```

### Option 3: Deploy to Vercel / Netlify / GitHub Pages
Push the repository directly to GitHub and connect to Vercel or Netlify. It requires zero build commands (output directory: root).

---

## 👤 Work Credits

- **Designed & Engineered by**: **Jagyenswar Sa**
- **Reference**: Inspired by [llm-token-explorer.vercel.app](https://llm-token-explorer.vercel.app/)
- **License**: MIT License
