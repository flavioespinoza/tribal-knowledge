# tribal-knowledge

TypeScript file watcher that OCRs Slack screenshots, extracts conversation text via Google Cloud Vision, summarizes via Gemini 1.5 Pro, and writes structured markdown files. Runs as a launchd daemon per-project.

## Structure

```txt
tribal-knowledge/
├── README.md
├── .gitignore
├── .prettierrc
├── tsconfig.json
├── package.json
├── package-lock.json
├── src/
│   └── app.css
├── .claude/
│   ├── CLAUDE.md
│   └── settings.json
├── _specs/
│   └── SPEC__watcher--tribal-knowledge.md
├── _docs/
└── _notes/
```

## Setup

```bash
git clone git@github.com:flavioespinoza/tribal-knowledge.git
cd tribal-knowledge
npm install
```

## Notes

See `_specs/SPEC__watcher--tribal-knowledge.md` for the full architecture spec.
