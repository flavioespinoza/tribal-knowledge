# tribal-knowledge

TypeScript file watcher that OCRs Slack screenshots, extracts conversation text via Google Cloud Vision, summarizes via Gemini 1.5 Pro, and writes structured markdown files. Runs as a launchd daemon per-project.

## Install Into a Project

```bash
cd ~/Portfolio/dlfn-task
curl -fsSL https://raw.githubusercontent.com/flavioespinoza/tribal-knowledge/main/install.sh | bash
```

This clones `tribal-knowledge/` into your project, installs deps, builds, and sets up the directory structure:

```txt
dlfn-task/
└── tribal-knowledge/
    ├── src/                                    # Watcher source (don't touch)
    ├── images/                                 # Drop screenshots here
    │   └── done/                               # Chief moves processed images here
    ├── README__tribal-knowledge.md             # Master report (auto-updated)
    ├── tribal__slack-thread--2026-03-11.md     # Output — matches image name
    ├── run.sh                                  # Launchd daemon wrapper
    ├── install.sh                              # This installer
    ├── package.json
    └── tsconfig.json
```

### Environment Variables

Required in `~/.zkeys` (or your shell profile):

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.gcp/service-account.json"
export GEMINI_API_KEY="your-key-from-aistudio"
```

- `GOOGLE_APPLICATION_CREDENTIALS` — GCP service account JSON for Cloud Vision
- `GEMINI_API_KEY` — API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Usage

```bash
cd ~/Portfolio/dlfn-task/tribal-knowledge

# Start the watcher
npm start

# Or run as background daemon
./run.sh
```

Drop a screenshot into `images/` and the pipeline runs automatically:

1. **Preprocess** — compress to JPEG if >10MB
2. **OCR** — extract text via Google Cloud Vision `documentTextDetection`
3. **Analyze** — structure via Gemini 1.5 Pro (topic, authors, verbatim, summary, takeaways, actions)
4. **Write** — output structured `.md` file (name matches the image)
5. **Archive** — move processed image to `images/done/`
6. **Report** — append entry to `README__tribal-knowledge.md`
7. **Alert** — fire signal for Flavio Alert extension + copy path to clipboard

## Architecture

```txt
tribal-knowledge/
├── src/
│   ├── watcher.ts        # Main entry — chokidar file watcher
│   ├── ocr.ts            # Stage 1 — Google Cloud Vision OCR
│   ├── analyze.ts        # Stage 2 — Gemini 1.5 Pro analysis
│   ├── preprocess.ts     # Image preprocessing (compression >10MB)
│   ├── writer.ts         # Markdown output + master report
│   └── alert.ts          # Post-processing alerts + clipboard
├── install.sh            # Per-project installer
├── run.sh                # Launchd daemon wrapper
├── .prettierrc
├── package.json
├── tsconfig.json
├── _specs/
│   └── SPEC__watcher--tribal-knowledge.md
└── .claude/
    └── CLAUDE.md
```

## Naming Convention

```
tribal__{topic}--{YYYY-MM-DD}.png    # Image (input)
tribal__{topic}--{YYYY-MM-DD}.md     # Markdown (output — same name, different ext)
README__tribal-knowledge.md           # Master report
```

## Dev

```bash
npm run dev       # Run watcher via tsx (no build step)
npm run build     # Compile TypeScript
npm run watch     # Compile in watch mode
```

## Notes

See `_specs/SPEC__watcher--tribal-knowledge.md` for the full architecture spec.
