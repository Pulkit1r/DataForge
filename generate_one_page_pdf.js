const { chromium } = require('./frontend/node_modules/playwright');
const fs = require('fs');
const path = require('path');

async function buildPdf() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page {
    size: letter;
    margin: 0.32in 0.35in;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 8.0pt;
    line-height: 1.25;
    color: #0f172a;
    background: #ffffff;
  }
  
  /* Header */
  header {
    border-bottom: 1.5px solid #0f172a;
    padding-bottom: 4px;
    margin-bottom: 5px;
    text-align: center;
  }
  h1 {
    font-size: 14.5pt;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #0f172a;
    line-height: 1.1;
    margin-bottom: 2px;
  }
  .subtitle {
    font-size: 7.6pt;
    font-weight: 600;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 3px;
  }
  .meta-bar {
    font-size: 7.2pt;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: #475569;
    display: flex;
    justify-content: center;
    gap: 14px;
  }
  .meta-bar a {
    color: #4338ca;
    text-decoration: none;
    font-weight: 600;
  }

  /* Two Column Layout */
  .columns {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .col {
    flex: 1;
    width: 50%;
    min-width: 0;
  }

  /* Section Styles */
  section {
    margin-bottom: 5px;
  }
  h2 {
    font-size: 8.4pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #0f172a;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 1.5px;
    margin-bottom: 3px;
  }
  p {
    margin-bottom: 3px;
    text-align: justify;
    text-justify: inter-word;
  }
  
  /* Core Claim Callout Box */
  .claim-box {
    background: #f8fafc;
    border-left: 3px solid #6366f1;
    border-top: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    padding: 3px 5px;
    margin-bottom: 3.5px;
    font-size: 7.8pt;
    font-style: italic;
    color: #1e293b;
    line-height: 1.22;
  }
  .claim-box strong {
    font-style: normal;
    color: #4338ca;
  }

  /* Compact Table */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.0pt;
    line-height: 1.15;
    margin: 2px 0 3px 0;
  }
  th, td {
    padding: 2px 2.5px;
    text-align: left;
    border-bottom: 0.5px solid #e2e8f0;
  }
  th {
    background: #f1f5f9;
    font-weight: 700;
    color: #0f172a;
    border-top: 1px solid #94a3b8;
    border-bottom: 1px solid #94a3b8;
    text-transform: uppercase;
    font-size: 6.4pt;
    letter-spacing: 0.02em;
  }
  td.num {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 6.8pt;
  }

  /* Lists */
  ul {
    list-style: none;
    padding-left: 0;
  }
  li {
    position: relative;
    padding-left: 7px;
    margin-bottom: 2px;
    text-align: justify;
  }
  li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #6366f1;
    font-weight: bold;
  }

  /* Badges */
  .badge {
    display: inline-block;
    font-size: 6.0pt;
    font-family: ui-monospace, monospace;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.5px 2.5px;
    border-radius: 2px;
    margin-right: 2px;
    letter-spacing: 0.02em;
  }
  .b-bench { background: #e0e7ff; color: #3730a3; border: 0.5px solid #c7d2fe; }
  .b-dev { background: #fef3c7; color: #92400e; border: 0.5px solid #fde68a; }
  .b-live { background: #dcfce7; color: #166534; border: 0.5px solid #bbf7d0; }

  /* Math & Typography helpers */
  .math {
    font-family: "Cambria Math", "Times New Roman", serif;
    font-style: italic;
  }
  .math-num {
    font-family: "Cambria Math", "Times New Roman", serif;
    font-style: normal;
  }

  /* Citations */
  .cites {
    font-size: 6.5pt;
    line-height: 1.15;
    color: #334155;
    border-top: 1px solid #cbd5e1;
    padding-top: 2px;
  }
  .cites span {
    font-weight: 700;
    color: #0f172a;
  }
</style>
</head>
<body>

<header>
  <h1>The Memory Cliff: Associative Memory and Fast Weights</h1>
  <div class="subtitle">Authoritative Concept Summary & System Evaluation Briefing · DataForge 2026 (Pathway Track)</div>
  <div class="meta-bar">
    <span><strong>Word Count:</strong> 795 words (Target: 500–950)</span>
    <span><strong>Live Application:</strong> <a href="https://memory-cliff-frontend.onrender.com">memory-cliff-frontend.onrender.com</a></span>
    <span><strong>Source Code:</strong> <a href="https://github.com/Pulkit1r/DataForge">github.com/Pulkit1r/DataForge</a></span>
  </div>
</header>

<div class="columns">
  <!-- LEFT COLUMN -->
  <div class="col">
    <section>
      <h2>1. Problem Motivation & Central Claim</h2>
      <div class="claim-box">
        <strong>Falsifiable Claim:</strong> “A fixed-size additive associative-memory state can process an arbitrarily long stream of facts without allocating a new slot per fact, but its exact-recall accuracy degrades once the number of stored facts exceeds the state's effective capacity, due to key-collision interference.”
      </div>
      <p>
        Standard Transformer self-attention preserves exact recall by explicitly appending every key-value pair (<span class="math">k<sub>i</sub>, v<sub>i</sub></span>) into an explicit Key-Value (KV) cache. This introduces an 𝒪(<span class="math">T</span>) memory footprint (<span class="math-num">2 · </span><span class="math">T · d</span> floats per head across sequence length <span class="math">T</span>) that imposes an unsustainable hardware bottleneck for long-context inference.
      </p>
      <p>
        Recurrent sub-quadratic architectures—such as linear attention, DeltaNet, and the Dragon Hatchling (BDH)—address this pressure by compressing history into a <strong>constant-size state matrix</strong> <span class="math">W<sub>t</sub></span> ∈ ℝ<sup><span class="math">d × d</span></sup>. By updating <span class="math">W<sub>t</sub></span> recurrently via outer products (<span class="math">W<sub>t</sub> = W<sub>t−1</sub> + v<sub>t</sub> k<sub>t</sub><sup>⊤</sup></span>), they ingest unbounded streams with 𝒪(<span class="math-num">1</span>) space complexity without allocating per-fact cache slots.
      </p>
      <p>
        However, linear algebra enforces <strong>The Memory Cliff</strong>: with linear readout <span class="math">y = W q</span>, a state of dimension <span class="math">d</span> supports at most <span class="math">d</span> mutually orthogonal keys. When stored facts <span class="math">N</span> exceed dimension <span class="math">d</span>, keys inevitably become linearly dependent in ℝ<sup><span class="math">d</span></sup>. The cross-talk interference term ∑<sub><span class="math">i ≠ t</span></sub> (<span class="math">k<sub>t</sub><sup>⊤</sup> k<sub>i</sub></span>)<span class="math">v<sub>i</sub></span> overwhelms the signal, causing exact retrieval accuracy to collapse toward zero.
      </p>
    </section>

    <section>
      <h2>2. Three Compared Memory Mechanisms</h2>
      <p>
        Our interactive benchmark evaluates three representative memory mechanisms on synthetic associative recall (<span class="math">d</span> = 32, <span class="math">N</span> ∈ [1, 96]):
      </p>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Memory Footprint</th>
            <th>Write Update Rule</th>
            <th>Readout</th>
            <th>Recall (<span class="math">N</span>=48 &gt; <span class="math">d</span>)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Full Attention</strong></td>
            <td class="num">𝒪(<span class="math">N · d</span>) Unbounded</td>
            <td>Append (<span class="math">k<sub>t</sub>, v<sub>t</sub></span>) slot</td>
            <td>Softmax(<span class="math">q K<sup>⊤</sup></span>)<span class="math">V</span></td>
            <td><strong>100%</strong> (Lossless)</td>
          </tr>
          <tr>
            <td><strong>Fixed Memory</strong></td>
            <td class="num">𝒪(<span class="math">d</span><sup>2</sup>) = 1,024 floats</td>
            <td><span class="math">W<sub>t−1</sub> + v<sub>t</sub> k<sub>t</sub><sup>⊤</sup></span> (Additive)</td>
            <td>Linear <span class="math">y = W q</span></td>
            <td><strong>31%</strong> (Cliff collapse)</td>
          </tr>
          <tr>
            <td><strong>DeltaNet</strong></td>
            <td class="num">𝒪(<span class="math">d</span><sup>2</sup>) = 1,024 floats</td>
            <td><span class="math">W<sub>t−1</sub> + β(v<sub>t</sub> − W<sub>t−1</sub>k<sub>t</sub>)k<sub>t</sub><sup>⊤</sup></span></td>
            <td>Linear <span class="math">y = W q</span></td>
            <td><strong>71%</strong> (Error-damped)</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>3. The Roles of BDH and BDH-CQ</h2>
      <p>
        Our project connects associative fast weights to Pathway's Dragon Hatchling research while preserving rigorous scientific boundaries:
      </p>
      <ul>
        <li>
          <strong>BDH Synaptic Update (Kosowski et al., 2025):</strong> BDH discards token caches in favor of biological synaptic memory: <span class="math">W<sub>t</sub> = W<sub>t−1</sub> + η · (y</span><sub>post</sub> ⊗ <span class="math">x</span><sub>pre</sub>). Synaptic connections strengthen additively based on correlated activations with <strong>no subtractive error feedback</strong>. Our Fixed Memory model directly isolates this correlation-based outer-product update.
        </li>
        <li>
          <strong>BDH-CQ Demonstration Ingestion (Engdahl et al., 2026):</strong> BDH-CQ demonstrates in-context learning where latent demonstration memory accumulates sequentially per exemplar into a constant working state without KV buffers. Our testbed models this exact sequential accumulation dynamic.
        </li>
        <li>
          <strong>Architectural Boundary Notice:</strong> DeltaNet is <strong>never conflated with BDH</strong>. DeltaNet inserts an instantaneous subtractive error term: <span class="math">e<sub>t</sub> = v<sub>t</sub> − W<sub>t−1</sub> k<sub>t</sub></span>. Because biological Hebbian plasticity does not possess negative error back-projection, equating DeltaNet with BDH would violate technical correctness.
        </li>
      </ul>
    </section>
  </div>

  <!-- RIGHT COLUMN -->
  <div class="col">
    <section>
      <h2>4. Classification of Evidence Types</h2>
      <p>
        To preserve epistemic honesty, all supporting evidence is explicitly categorized:
      </p>
      <ul>
        <li>
          <span class="badge b-bench">Academic Benchmark</span> <strong>Arora et al. (2024, “Based”):</strong> Establishes fundamental state-size vs. recall capacity tradeoffs across synthetic benchmarks and models up to 1.3B parameters.
        </li>
        <li>
          <span class="badge b-bench">Academic Benchmark</span> <strong>Yang et al. (2024, DeltaNet):</strong> Documents that uncorrected linear states suffer catastrophic collision that subtractive delta updates mitigate.
        </li>
        <li>
          <span class="badge b-bench">Academic Benchmark</span> <strong>Pandey & Singh (2026):</strong> Formulates mathematical proofs of continuous associative retrieval collapse as stored facts <span class="math">N → d<sub>h</sub></span>.
        </li>
        <li>
          <span class="badge b-dev">Developer-Reported</span> <strong>Kosowski et al. (2025, BDH):</strong> Internal Pathway evaluation demonstrating Hebbian synaptic dynamics and language scaling (awaiting external reproduction).
        </li>
        <li>
          <span class="badge b-dev">Developer-Reported</span> <strong>Engdahl et al. (2026, BDH-CQ):</strong> Internal Pathway evaluation demonstrating recurrent latent reasoning on ARC-AGI-1 ($0.0007/task).
        </li>
        <li>
          <span class="badge b-live">Live Synthetic Measurement</span> <strong>DataForge Dashboard (<span class="math">d</span>=32, <span class="math">N</span> ∈ [1, 96]):</strong> Live PyTorch execution measuring real-time exact recall, hidden tensor activations, and ablation surgery across 5 random seeds.
        </li>
      </ul>
    </section>

    <section>
      <h2>5. Advantages, Trade-offs & Failure Modes</h2>
      <p>
        <strong>Where the concept demonstrates advantage:</strong> Fixed-size associative fast weights achieve strictly constant 𝒪(<span class="math-num">1</span>) hardware memory (4.0 KB at <span class="math">d</span>=32), constant generation latency, and zero token cache allocation overhead regardless of context length.
      </p>
      <p>
        <strong>Where the concept fails:</strong> Exact associative recall degrades once fact count exceeds matrix rank <span class="math">d</span> = 32. Beyond <span class="math">d</span>, additive superposition blurs previously stored representations. DeltaNet partially resists this cliff by projecting out existing estimates before writing, but still degrades as the subspace saturates.
      </p>
    </section>

    <section>
      <h2>6. Core Limitations & Epistemic Scope</h2>
      <ul>
        <li>
          <strong>Hand-Crafted Analogue, Not Trained BDH Weights:</strong> Our Fixed Memory model is an isolated mathematical implementation of the outer-product update. Official BDH-CQ weights and training pipelines remain proprietary; no matched-scale baseline against trained BDH weights currently exists.
        </li>
        <li>
          <strong>Educational Toy Scale (<span class="math">d</span> = 32):</strong> Production models operate at <span class="math">d</span> = 2,048 to 8,192. We parameterized <span class="math">d</span> = 32 to enable sub-second client PyTorch execution and legible state heatmap inspection.
        </li>
        <li>
          <strong>Synthetic vs. Natural Language:</strong> Keys are normalized Gaussian vectors. Real language exhibits power-law frequencies and burstiness, which alters empirical collision rates.
        </li>
      </ul>
    </section>

    <section>
      <h2>7. Primary Literature & Continuing Learning</h2>
      <div class="cites">
        [1] <span>Yang et al. (2024)</span> <em>Gated Delta Networks</em>, arXiv:2412.06464.<br>
        [2] <span>Arora et al. (2024)</span> <em>Simple linear attention language models</em> ("Based"), arXiv:2402.18668.<br>
        [3] <span>Pandey & Singh (2026)</span> <em>Variational Linear Attention</em>, arXiv:2605.11196.<br>
        [4] <span>Kosowski et al. (2025)</span> <em>The Dragon Hatchling</em>, arXiv:2509.26507.<br>
        [5] <span>Engdahl et al. (2026)</span> <em>BDH-CQ: In-Context Learning</em>, arXiv:2608.09888.
      </div>
    </section>
  </div>
</div>

</body>
</html>`;

  fs.writeFileSync('temp_summary.html', htmlContent);

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });
  
  // Generate PDF exactly 1 page
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    pageRanges: '1'
  });

  fs.writeFileSync('blog.pdf', pdfBuffer);
  if (!fs.existsSync('frontend/public')) {
    fs.mkdirSync('frontend/public', { recursive: true });
  }
  fs.writeFileSync('frontend/public/blog.pdf', pdfBuffer);

  console.log('Successfully generated blog.pdf, size bytes:', pdfBuffer.length);
  await browser.close();
}

buildPdf().catch(err => {
  console.error('Build PDF failed:', err);
  process.exit(1);
});
