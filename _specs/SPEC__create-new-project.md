# SPEC: Template — New Project

v6 | Mar 11 2026 - 11:55 PM (MST)

## Purpose

A standardized onboarding process for every new external project (Snorkel, Mercor, or any future platform). Every project gets the same foundation — then customized for its unique requirements.

**Every new project's first session is a setup session.** Baby Girl works with Flavio to build it, because she knows what he needs and she knows the spec.

**This entire spec uses "Dolphin" (alias DLFN) as a walkthrough example.** Dolphin is NOT a real project. Do NOT start building it. Do NOT add it to the alias table. It exists purely to show how each step works with a concrete name instead of placeholders. When a REAL project lands, follow these steps with the REAL name.

---

## Trigger

Flavio says: "New project — Dolphin" (or whatever the name is).

---

## Step 1: Alias Compression

Compress the project name to a 4-letter alias (Commandment #16):

- Single word — drop vowels: Dolphin → DLFN
- Multi-word — first 2 of each: Dolphin Config → DOCF
- Too short — pad with Z: Ox → OXZZ

**After compression, confirm with Flavio:** "The alias is **{ALIAS}** and the repo will be `{alias}-task/`. Want to change the name or alias?"

Do NOT proceed until Flavio confirms or gives a new name.

---

## Step 2: Ask Flavio These Questions

Before building anything, get answers to ALL of these:

| # | Question | Why |
|---|----------|-----|
| 1 | What does this project do? (one-liner) | README description |
| 2 | What platform is it on? (Snorkel, Mercor, other) | Determines tooling and submission format |
| 3 | What are the deliverables? (code review, task creation, model eval, etc.) | Directory structure depends on this |
| 4 | What are the unique requirements? (timing, format, special rules) | Every project has different rules |
| 5 | Are there existing files or repos to pull from? | Don't start from scratch if prior work exists |
| ~~6~~ | ~~Public or private repo?~~ | **ALWAYS PRIVATE — removed, no longer asked** |

---

## Step 3: Create the Repo

Following Commandment #17 (New Repo Setup):

```bash
# Example for Dolphin
mkdir ~/Portfolio/dlfn-task
cd ~/Portfolio/dlfn-task
git init
```

### TypeScript + npm + Prettier Setup

**Every new project is initialized as a TypeScript npm project. No exceptions.**

```bash
cd ~/Portfolio/dlfn-task
npm init -y
npm install -D typescript prettier @trivago/prettier-plugin-sort-imports tailwindcss @tailwindcss/cli prettier-plugin-tailwindcss
```

**`.prettierrc`** — standard config for every project:

```json
{
	"arrowParens": "always",
	"useTabs": true,
	"tabWidth": 2,
	"singleQuote": true,
	"trailingComma": "none",
	"semi": false,
	"printWidth": 100,
	"importOrderSeparation": false,
	"importOrderSortSpecifiers": true,
	"importOrderGroupNamespaceSpecifiers": true,
	"importOrderParserPlugins": ["typescript", "jsx", "decorators-legacy"],
	"importOrder": [
		"^react$",
		"^react-dom$",
		"^react",
		"^next",
		"<THIRD_PARTY_MODULES>",
		"^[./]"
	],
	"plugins": ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"]
}
```

- ✅ Tabs, single quotes, no semicolons, no trailing commas, print width 100
- ✅ Import sorting via `@trivago/prettier-plugin-sort-imports` — always included
- ✅ Tailwind class sorting via `prettier-plugin-tailwindcss` — always included
- ❌ Do NOT deviate from this config — it is the standard for all projects

**`src/app.css`** — base Tailwind v4 entry point:

```css
@import "tailwindcss";
```

- ✅ Tailwind v4 uses `@import "tailwindcss"` — no `@tailwind base/components/utilities` directives
- ✅ Project-specific `@theme` blocks go below the import (see Palette section for frontend projects)

**`tsconfig.json`** — standard config for every project:

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"module": "ESNext",
		"moduleResolution": "bundler",
		"lib": ["ES2020"],
		"strict": true,
		"skipLibCheck": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,
		"outDir": "dist",
		"rootDir": "src"
	},
	"include": ["src"],
	"exclude": ["node_modules", "dist"]
}
```

- ✅ Strict mode, ES2020 target, ESNext modules
- ✅ `outDir: "dist"`, `rootDir: "src"` — every project compiles from `src/` to `dist/`
- ✅ For frontend projects, add `"DOM"`, `"DOM.Iterable"` to `lib`, add `"jsx": "react-jsx"`, and remove `outDir`/`rootDir` (Vite handles it)
- ✅ Project-specific path aliases go in `paths` as needed

**After setup, every new project has these files at root:**

| File | Source |
|------|--------|
| `package.json` | `npm init -y` (then edit name/description) |
| `package-lock.json` | `npm install` |
| `.prettierrc` | Standard config above |
| `tsconfig.json` | Standard config above |
| `src/app.css` | Tailwind v4 entry point (`@import "tailwindcss"`) |

### README Header Rule

Every project's README must include a link at the top to **Flavio's Preferred Idioms** — a global reference for naming conventions, style rules, and project standards.

`[TODO: mechanism TBD — likely a trigger that opens a standalone window, not embedded markdown]`

### Required Structure

```txt
dlfn-task/
├── README.md                                                # Commandment #17 template + Step 2 answers
├── NOTES.md                                                 # Persistent scratchpad — survives across sessions
├── TEMP.md                                                  # Throwaway scratch — can be wiped any time
├── TODO.md                                                  # Active task list — what needs doing NOW
├── .gitignore                                               # Commandment #17 template
├── .prettierrc                                              # Standard Prettier config
├── tsconfig.json                                            # Standard TypeScript config
├── package.json                                             # npm init -y + edit name/description
├── package-lock.json                                        # npm install output
├── src/                                                     # All source code lives here
├── .claude/                                                 # Claude Code config (committed to repo)
│   ├── CLAUDE.md                                            # project-specific rules (NOT in root!)
│   └── settings.json                                        # standardized permissions (Commandment #22)
├── _docs/                                                   # project-specific documentation
│   └── doc__onboarding--dlfn.md                             # unique requirements from Step 7
├── _notes/                                                  # Flavio's notes — HANDS OFF unless told
├── _specs/                                                  # project specs (SPEC__{name}.md)
└── tribal-knowledge/                                        # Slack screenshots, undocumented tips
    ├── README__tribal-knowledge.md                          # master report (the chief updates this)
    ├── images/                                              # drop screenshots here
    │   ├── done/                                            # chief moves processed images here
    │   │   └── tribal__docker-fix--2026-02-08.png           # same name — just archived after processing
    │   └── tribal__api-key--2026-02-09.png         # pending — chief hasn't processed yet
    ├── tribal__docker-fix--2026-02-08.md                    # matches the image name (.md ext)
    └── tribal__api-key--2026-02-09.md              # matches the image name (.md ext)
```

### ALLCAPS Markdown Files

Every project gets these root-level ALLCAPS markdown files. They are exceptions to FX naming (Commandment #6 says ALLCAPS files stay as-is: CLAUDE.md, README.md, TEMP.md, NOTES.md, TODO.md).

| File | Purpose | Persistence |
|------|---------|-------------|
| `README.md` | Project overview — what it is, how to run it, structure | Permanent |
| `NOTES.md` | Persistent scratchpad for ideas, observations, context that survives across sessions | Permanent |
| `TEMP.md` | Throwaway scratch space — paste dumps, quick calcs, draft text. Can be wiped any time | Ephemeral |
| `TODO.md` | Active task list — what needs doing NOW. Items get checked off and removed as they're done | Rolling |

- ✅ All four are created on project init — even if empty
- ✅ `NOTES.md` and `TEMP.md` are Flavio's space — don't edit unless told
- ✅ `TODO.md` can be updated by Claude when Flavio says "add to TODO" or "update TODO"
- ❌ Do NOT use FX naming on these — they stay ALLCAPS at root

### .claude/ Directory Setup

Every new project gets `.claude/` with two files:

**`.claude/CLAUDE.md`** — project-specific instructions:

```txt
# {Project Name} — Project Instructions

## What This Is

{One-line description from Step 2.}

## Game Time Protocol

1. Read this CLAUDE.md
2. Read the README.md
3. {Project-specific startup steps}
```

**`.claude/settings.json`** — standardized permissions (Commandment #22):

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)", "Bash(npx:*)", "Bash(node:*)", "Bash(git:*)", "Bash(gh:*)",
      "Bash(mkdir:*)", "Bash(cp:*)", "Bash(mv:*)", "Bash(rm:*)", "Bash(ls:*)",
      "Bash(cat:*)", "Bash(chmod:*)", "Bash(touch:*)", "Bash(curl:*)",
      "Bash(python3:*)", "Bash(pip:*)", "Bash(pip3:*)", "Bash(brew:*)",
      "Bash(source:*)", "Bash(cd:*)", "Bash(echo:*)", "Bash(find:*)",
      "Bash(grep:*)", "Bash(sed:*)", "Bash(awk:*)", "Bash(tail:*)",
      "Bash(head:*)", "Bash(wc:*)", "Bash(sort:*)", "Bash(tsc:*)", "Bash(tsx:*)",
      "Bash(which:*)", "Bash(env:*)", "Bash(export:*)",
      "Bash(killall:*)", "Bash(lsof:*)", "Bash(ps:*)", "Bash(open:*)",
      "Read", "Edit", "Write", "WebFetch", "Glob", "Grep", "Agent"
    ],
    "deny": [
      "Edit(~/.zkeys)", "Write(~/.zkeys)",
      "Edit(~/.zshrc)", "Write(~/.zshrc)",
      "Edit(~/.zballs)", "Write(~/.zballs)",
      "Edit(~/.ssh/**)", "Write(~/.ssh/**)"
    ],
    "additionalDirectories": ["/Users/flavio", "/tmp", "/dev", "/private/tmp"]
  }
}
```

**After creating `.claude/`, set permissions:**

```bash
chmod -R 755 .claude/
```

- ✅ `.claude/CLAUDE.md` — ALWAYS here, NEVER in root
- ✅ `.claude/settings.json` — same standard for every project
- ✅ `chmod -R 755 .claude/` — full read/write/execute permissions on the directory
- ✅ Both files get committed to the repo (`.claude/` is NOT in `.gitignore`)
- ❌ Do NOT create a root-level `CLAUDE.md` — root is reserved for the Keymaster global only

### Palette

Every new project with a frontend uses the **steel/rose/sage** color palette. This is the global design system — one palette for all projects.

**Full reference:** `_specs/SPEC__ux-design.md` (in the Keymaster repo)

**Component screenshots:** `_specs/images/ux-*.png` (cards, buttons, callouts, form controls, links, tabs, alerts, avatars, badges, headings)

Add to the project's main CSS file with `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-steel-50: #f1f7fa;
  --color-steel-100: #dcebf1;
  --color-steel-200: #bdd8e4;
  --color-steel-300: #8fbcd1;
  --color-steel-400: #4c8bab;
  --color-steel-500: #3f7b9b;
  --color-steel-600: #376483;
  --color-steel-700: #32546c;
  --color-steel-800: #2f475b;
  --color-steel-900: #2b3d4e;
  --color-steel-950: #192733;

  --color-rose-50: #fff0f1;
  --color-rose-100: #ffe3e5;
  --color-rose-200: #ffcad1;
  --color-rose-300: #ff9fab;
  --color-rose-400: #ff6980;
  --color-rose-500: #fe3557;
  --color-rose-600: #ec1242;
  --color-rose-700: #c80837;
  --color-rose-800: #a70a36;
  --color-rose-900: #8e0d35;
  --color-rose-950: #500117;

  --color-sage-50: #f9faf9;
  --color-sage-100: #f4f5f4;
  --color-sage-200: #e5e8e3;
  --color-sage-300: #d3d8cf;
  --color-sage-400: #a2ac9a;
  --color-sage-500: #636e5b;
  --color-sage-600: #4f5b4a;
  --color-sage-700: #3e4739;
  --color-sage-800: #282b22;
  --color-sage-900: #191e15;
  --color-sage-950: #0a0d08;
}
```

| Role | Name | Primary Hex | Usage |
|------|------|-------------|-------|
| Primary | `steel` | `#4c8bab` | Buttons, links, focus rings, primary actions |
| Secondary | `rose` | `#fe3557` | Alerts, destructive actions, accents |
| Tertiary | `sage` | `#636e5b` | Muted backgrounds, secondary text, borders |

**Source:** UI Colors Tailwind CSS Color Generator (uicolors.app) — Palette 17

- ✅ Every frontend project uses this palette — no per-project color decisions
- ✅ Tailwind CSS v4 with `@theme` block
- ✅ shadcn/ui components + Lucide React icons
- ✅ The Keymaster owns the palette spec — projects reference it, don't copy it
- ❌ Do NOT invent new colors — use the palette

---

### The Three Underscore Directories

| Directory | What goes here | Who writes |
|-----------|---------------|------------|
| `_docs/` | Project-specific docs, onboarding, guides | Claude + Flavio |
| `_specs/` | Specs for anything being built in this project | Claude + Flavio |
| `_notes/` | Flavio's personal notes | **Flavio ONLY** — stay the fuck out unless directly told |

The `_` prefix sorts them to the top in VS Code so Flavio doesn't have to hunt for them.

---

## Step 4: Create Zballs Alias

Add to `.zballs`:

```bash
alias __dlfn="cd ~/Portfolio/dlfn-task"
```

The `__` prefix groups all project aliases together. Run `source ~/.zballs` to activate.

---

## Step 5: Update Keymaster

1. **Commandment #16 table** — add the new alias row (with GitHub SSH URL)
2. **README Expected Directory Structure** — add the new repo

---

## Step 6: Create GitHub Remote

```bash
cd ~/Portfolio/dlfn-task
gh repo create flavioespinoza/dlfn-task --private --source=. --remote=origin
git remote set-url origin git@github.com:flavioespinoza/dlfn-task.git
git add -A && git commit -m "Initial project setup"
git push -u origin main
```

---

## Step 7: Document Unique Requirements

Create `_docs/doc__onboarding--dlfn.md` with:

- Platform-specific rules (submission format, timing, grading criteria)
- What makes this project different from others
- Any tribal knowledge from Flavio's first interactions with the platform
- Links to platform docs if they exist

---

## Tribal Knowledge Naming

The chief renames everything on extraction. No CleanShot garbage. No date-first filenames.

```txt
tribal__{topic}--{YYYY-MM-DD}.png    # Image
tribal__{topic}--{YYYY-MM-DD}.md     # Matching markdown (same name, different ext)
README__tribal-knowledge.md           # Master report
```

- ✅ Image and markdown share the exact same name
- ✅ Block = `tribal__`, Element = topic (kebab-case), Modifier = date
- ✅ Master report is `README__tribal-knowledge.md`
- ❌ No raw CleanShot filenames
- ❌ No date-first filenames — topic first, date is the modifier

---

## Naming Conventions (Project Files)

All files inside the project follow the same global rules (Commandment #6 BEM for markdown, kebab-case for directories). Project-specific prefixes use the 4-letter alias:

```txt
dlfn__task-1234__assessment.md
dlfn__task-1234__submission--2026-02-08--1430-mst.md
dlfn__task-1234__turns.md
```

---

## Open Questions

1. ~~Should each project get a project-specific CLAUDE.md, or just rely on globals?~~ **RESOLVED:** Every project gets `.claude/CLAUDE.md`. Globals come from `~/.claude/CLAUDE.md` (Keymaster).
2. Should the tribal-knowledge directory be pre-created, or only when the chief is ready?
3. Does the Keymaster auto-create repos via script, or is it always manual + spec?
