# PATCH: Keymaster Spec — Tribal Knowledge Install Step

> Add this to `flavio__keymaster/_specs/SPEC__create-new-project.md`
> Insert after **Step 3: Create the Repo** → **Required Structure** section.

---

## Step 3.5: Install Tribal Knowledge

Every new project gets the Tribal Knowledge Chief installed as a subdirectory:

```bash
cd ~/Portfolio/dlfn-task
curl -fsSL https://raw.githubusercontent.com/flavioespinoza/tribal-knowledge/main/install.sh | bash
```

**What the installer does:**
1. Clones `tribal-knowledge/` into the project root
2. Runs `npm install` + `npm run build`
3. Creates `images/` and `images/done/` directories
4. Creates `README__tribal-knowledge.md` (master report)
5. Verifies `GOOGLE_APPLICATION_CREDENTIALS` and `GEMINI_API_KEY` env vars

**After install, the tribal-knowledge directory looks like:**

```
dlfn-task/
└── tribal-knowledge/
    ├── src/                                    # Watcher source
    ├── images/                                 # Drop screenshots here
    │   └── done/                               # Chief moves processed images here
    ├── README__tribal-knowledge.md             # Master report (auto-updated)
    ├── run.sh                                  # Launchd daemon wrapper
    ├── install.sh                              # Installer (already ran)
    ├── package.json
    └── tsconfig.json
```

**To start the watcher:**

```bash
cd tribal-knowledge && npm start
```

**Or run as a background daemon:**

```bash
cd tribal-knowledge && ./run.sh
```

---

### Also update the Required Structure tree to show the expanded tribal-knowledge layout:

Replace:

```
└── tribal-knowledge/                                        # Slack screenshots, undocumented tips
    ├── README__tribal-knowledge.md                          # master report (the chief updates this)
    ├── images/                                              # drop screenshots here
    │   ├── done/                                            # chief moves processed images here
    │   │   └── tribal__docker-fix--2026-02-08.png           # same name — just archived after processing
    │   └── tribal__api-key--2026-02-09.png         # pending — chief hasn't processed yet
    ├── tribal__docker-fix--2026-02-08.md                    # matches the image name (.md ext)
    └── tribal__api-key--2026-02-09.md              # matches the image name (.md ext)
```

With:

```
└── tribal-knowledge/                                        # Installed via install.sh — OCR pipeline
    ├── src/                                                 # Watcher source (TypeScript)
    ├── dist/                                                # Compiled JS (gitignored)
    ├── node_modules/                                        # Dependencies (gitignored)
    ├── install.sh                                           # Per-project installer
    ├── run.sh                                               # Launchd daemon wrapper
    ├── package.json                                         # Dependencies + scripts
    ├── tsconfig.json                                        # TypeScript config
    ├── README__tribal-knowledge.md                          # Master report (auto-updated by chief)
    ├── images/                                              # Drop screenshots here
    │   ├── done/                                            # Chief moves processed images here
    │   │   └── tribal__docker-fix--2026-02-08.png           # Archived after processing
    │   └── tribal__api-key--2026-02-09.png                  # Pending — chief hasn't processed yet
    ├── tribal__docker-fix--2026-02-08.md                    # Output — matches image name (.md ext)
    └── tribal__api-key--2026-02-09.md                       # Output — matches image name (.md ext)
```

---

### Also update Open Question #2:

> 2. Should the tribal-knowledge directory be pre-created, or only when the chief is ready?

**RESOLVED:** Tribal Knowledge is installed per-project via `install.sh`. Run it after Step 3 (repo creation). The installer clones the repo, builds, and sets up the full directory structure.
