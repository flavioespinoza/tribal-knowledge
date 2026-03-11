# tribal-knowledge

TypeScript file watcher that OCRs Slack screenshots, extracts conversation text via Google Cloud Vision, summarizes via Gemini 1.5 Pro, and writes structured markdown files. Runs as a launchd daemon per-project.

## Structure

```txt
tribal-knowledge/
├── src/
│   ├── watcher.ts        # Main entry — chokidar file watcher
│   ├── ocr.ts            # Stage 1 — Google Cloud Vision OCR
│   ├── analyze.ts        # Stage 2 — Gemini 1.5 Pro analysis
│   ├── preprocess.ts     # Image preprocessing (compression >10MB)
│   ├── writer.ts         # Markdown output writer
│   └── alert.ts          # Post-processing alerts + clipboard
├── images/               # Drop screenshots here (watched directory)
├── run.sh                # Launchd daemon wrapper
├── package.json
├── tsconfig.json
├── _specs/
│   └── SPEC__watcher--tribal-knowledge.md
└── .claude/
    └── CLAUDE.md
```

## Setup

```bash
git clone git@github.com:flavioespinoza/tribal-knowledge.git
cd tribal-knowledge
npm install
npm run build
```

### Environment Variables

- `GOOGLE_APPLICATION_CREDENTIALS` — path to GCP service account JSON (e.g. `~/.gcp/service-account.json`)
- `GEMINI_API_KEY` — API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Usage

```bash
# Development
npm run dev

# Production (build + run)
npm run build
npm start

# Via launchd wrapper
./run.sh
```

Drop a screenshot into `images/` and the pipeline runs automatically:
1. **Preprocess** — compress to JPEG if >10MB
2. **OCR** — extract text via Google Cloud Vision `documentTextDetection`
3. **Analyze** — structure via Gemini 1.5 Pro (topic, authors, verbatim, summary, takeaways, actions)
4. **Write** — output structured `.md` file to project root
5. **Alert** — fire signal for Flavio Alert extension + copy path to clipboard

## Notes

See `_specs/SPEC__watcher--tribal-knowledge.md` for the full architecture spec.
