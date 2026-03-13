# tribal-knowledge

TypeScript file watcher that OCRs Slack screenshots via Gemini Vision, structures via Gemini 2.5 Flash, and writes markdown. Engine runs from this repo, output goes to the target project.

## How It Works

The engine lives here (`~/Portfolio/tribal-knowledge/`). Target projects get a **lean output directory** -- no source code, no node_modules, just the output structure.

```txt
target-project/
└── tribal-knowledge/                          # Output only -- no engine
    ├── README__tribal-knowledge.md            # Index (auto-updated)
    ├── tribal__screenshot--2026-03-11__1773265603682.md
    ├── images/
    │   └── done/
    │       └── tribal__screenshot--2026-03-11__1773265603682.png
```

## Start the Watcher

One command. Auto-creates the target directory if it doesn't exist.

```bash
cd ~/Portfolio/tribal-knowledge && npm start -- ~/Portfolio/your-project/tribal-knowledge
```

Or with the daemon wrapper:

```bash
cd ~/Portfolio/tribal-knowledge && ./run.sh ~/Portfolio/your-project/tribal-knowledge
```

## Pipeline

Drop a screenshot into `your-project/tribal-knowledge/images/` (any name, any format) and the pipeline runs automatically:

1. **Rename** -- auto-rename to `tribal__screenshot--{YYYY-MM-DD}__{epoch}.{ext}`
2. **Preprocess** -- compress to JPEG if >10MB
3. **OCR** -- verbatim transcription via Gemini Vision
4. **Analyze** -- structure via Gemini 2.5 Flash (topic, authors, verbatim, summary, takeaways, actions)
5. **Write** -- output structured `.md` file (same name as image, different ext)
6. **Archive** -- move processed image to `images/done/`
7. **Report** -- append entry to `README__tribal-knowledge.md` index
8. **Alert** -- play war drums + blocking macOS popup + copy path to clipboard on dismiss

## Environment Variables

Required in `~/.zkeys`:

```bash
export GEMINI_API_KEY="your-key-from-aistudio"
```

## Naming Convention

```txt
tribal__screenshot--{YYYY-MM-DD}__{epoch}.png    # Image (auto-renamed, moves to images/done/)
tribal__screenshot--{YYYY-MM-DD}__{epoch}.md     # Markdown output (stays in root)
README__tribal-knowledge.md                       # Index
```

## Engine Architecture

```txt
tribal-knowledge/                  # THIS REPO -- the engine
├── src/
│   ├── watcher.ts                 # Main entry -- chokidar file watcher + image rename
│   ├── ocr.ts                     # Stage 2 -- Gemini Vision verbatim transcription
│   ├── analyze.ts                 # Stage 3 -- Gemini 2.5 Flash structured analysis
│   ├── preprocess.ts              # Stage 1 -- image compression (>10MB)
│   ├── writer.ts                  # Markdown output + index report
│   └── alert.ts                   # War drums + osascript popup + pbcopy
├── install.sh                     # Creates lean output dir in target project
├── run.sh                         # Launchd daemon wrapper
├── TODO.md                        # Active TODO list
├── package.json
├── tsconfig.json
└── .claude/
    └── CLAUDE.md
```

## Alert System

Uses native macOS mechanisms (no VS Code extension needed):

- `afplay ~/.claude/alerts/sounds/indian-drums.m4a` -- war drums audio
- `osascript display alert` -- blocking popup, stays until OK is clicked
- `pbcopy` -- copies path + heading to clipboard after dismiss
- Drums stop when popup is dismissed

## Dev

```bash
npm run dev       # Run watcher via tsx (no build step)
npm run build     # Compile TypeScript
npm run watch     # Compile in watch mode
```
