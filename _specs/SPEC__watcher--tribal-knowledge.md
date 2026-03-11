# SPEC: Watcher — Tribal Knowledge (Chief)

v3 | Mar 11 2026 - 11:55 PM (MST)

---

## What This Is

The Tribal Knowledge Chief is a TypeScript file watcher that OCRs Slack screenshots, extracts verbatim conversation text, summarizes it, and writes structured `.md` files. It runs as a launchd daemon per-project.

This is not just a single TypeScript file. It relies on other scripts — specifically the alert that lets Flavio know when he drops a screenshot in the images directory. The image file is processed and an alert pops up playing tribal music.

**Purpose:** Flavio screenshots Slack threads that contain undocumented tips, platform intel, and insider knowledge. The Chief turns those screenshots into searchable, structured markdown.

---

## The New Two-Stage Architecture (v2)

To eliminate hallucinations and "content refusals," the pipeline is now split into Perception and Cognition.

### STAGE 1 — Google Cloud Vision API (Perception)
- **Input:** Raw screenshot (PNG or WebP).
- **Process:** `documentTextDetection` (Optimized for dense UI text).
- **Output:** Raw extracted string (every character, every timestamp).
- **Why:** Deterministic OCR. No LLM "guessing." It reads exactly what is on the screen.
- **Library:** `@google-cloud/vision` (Node.js client).
- **Auth:** Service account JSON file at `~/.gcp/service-account.json`. No API key — the library reads `GOOGLE_APPLICATION_CREDENTIALS` automatically.
- **Free tier:** 1,000 OCR calls/month free.
- **Setup:** [Cloud Vision Setup](https://docs.cloud.google.com/vision/docs/setup) — enable Cloud Vision API in GCP Console, create service account, download JSON key.

### STAGE 2 — Gemini 1.5 Pro (Cognition)
- **Input:** The raw text from Stage 1 (Plain text).
- **Process:** Structured analysis and summarization.
- **Output:** Structured JSON — topic, authors, verbatim, summary, key takeaways, action items.
- **Why:** Gemini handles the intelligence layer. It receives verified text, making it 100% faithful to the source.
- **Library:** `@google/genai` (Node.js v18+). NOT `@google/generative-ai` — that SDK is deprecated (EOL Nov 30 2025).
- **Auth:** Uses `GEMINI_API_KEY` env var (already in `~/.zkeys`).
- **Free tier:** 15 requests/minute free via Google AI Studio. Paid: ~$1.25-$2.50/1M input tokens.
- **Setup:** Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Docs: [Gemini API Quickstart](https://ai.google.dev/gemini-api/docs/quickstart).

---

## Image Preprocessing Rules

Since Stage 1 (Cloud Vision) is now the primary OCR engine, we prioritize pixel clarity:

1.  **Format:** CleanShot X should save as **WebP** (Default).
2.  **Resolution:** **Do NOT resize to 1500px.** Maintain high resolution (up to **3072px** on the longest side) to ensure small Retina text is legible.
3.  **Compression:** Only use `sips` to convert to high-quality JPEG (85%) if the file size exceeds **10MB**. 

---

## Implementation Details

### API Configuration
- **OCR:** Requires `GOOGLE_APPLICATION_CREDENTIALS` (JSON service account key).
- **Model:** `@google-cloud/vision` for Stage 1.
- **Analysis:** `gemini-1.5-pro` via `@google/genai` for Stage 2.

### Launchd Daemon Fix
To prevent `module not found` errors, the `run.sh` wrapper must use absolute paths and change directory:

```bash
#!/bin/bash
source "$HOME/.zkeys" 2>/dev/null || true
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.gcp/service-account.json"
export GEMINI_API_KEY
cd /Users/flavio/Portfolio/term-task
exec /Users/flavio/.nvm/versions/node/v24.12.0/bin/node dist/tribal-chief/watcher.js
```

---

## Image Slicing for Claude Code (Manual Processing)

When the automated pipeline is not running or Claude Code is processing images directly, tall screenshots (Slack threads, long conversations) must be sliced into readable chunks before transcription.

**Problem:** Claude Code's Read tool scales large images to fit, destroying text legibility. A 1424x6010 retina screenshot becomes unreadable.

**Solution:** Use `sips` to crop the image into ~1000px-tall slices, read each slice separately, then write the verbatim transcription.

```bash
# Get image dimensions
sips -g pixelHeight -g pixelWidth {image_path}

# Slice into 1000px chunks using Python + sips
python3 -c "
import subprocess, os
src = '{image_path}'
out_dir = '/tmp/tribal-slices'
os.makedirs(out_dir, exist_ok=True)
height = {total_height}
chunk = 1000
for i in range(0, height, chunk):
    h = min(chunk, height - i)
    out = f'{out_dir}/slice_{i:04d}.png'
    subprocess.run(['sips', '-c', str(h), '{width}', '--cropOffset', str(i), '0', src, '--out', out], capture_output=True)
"
```

Then read each slice with the Read tool, transcribe verbatim, and clean up:

```bash
rm -rf /tmp/tribal-slices
```

---

## Post-Processing Alert

When an image is processed (either by the automated pipeline or manually by Claude Code), two things happen:

### 1. Indian Drums Alert

The Flavio Alert extension (`SPEC__engine--flavio-alert.md`) fires a popup with an Indian drums sound effect.

**Signal file:**

```json
{
  "type": "tribal_knowledge",
  "sound": "indian_drums",
  "message": "New tribal knowledge processed",
  "source_image": "tribal__slack-announcements--2026-03-11.png",
  "output_file": "tribal__slack-announcements--2026-03-11.md",
  "created": "2026-03-11T23:55:00-07:00"
}
```

Written to `~/.claude/alerts/pending/alert-{timestamp}.json`. The extension picks it up, plays the Indian drums audio clip, and shows the popup.

**Sound file:** `~/.claude/alerts/sounds/indian-drums.mp3` — short clip (2-3 seconds), plays on alert fire.

### 2. Clipboard Message

After processing, the Chief copies a ready-to-paste message to the system clipboard:

```txt
New tribal knowledge: {project-root}/tribal-knowledge/{output-filename}.md — ## {first-section-heading}
```

**Example:**

```txt
New tribal knowledge: /Users/flavio/Portfolio/term-2-task/tribal-knowledge/tribal__slack-announcements--2026-03-11.md — ## Message 1 — Puyun (6:17 PM)
```

This gives Flavio the full file path and the section ID so he can jump directly to the content. The message is copied to clipboard automatically — Flavio can paste it into any Claude instance to point them at the new knowledge.

**Implementation:** Use `pbcopy` on macOS:

```bash
echo "New tribal knowledge: {full_path} — ## {section_heading}" | pbcopy
```

When Claude Code processes an image manually (no watcher running), it should run this `pbcopy` command after writing the `.md` file.