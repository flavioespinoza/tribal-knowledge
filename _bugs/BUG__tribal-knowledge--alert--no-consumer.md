# BUG: Alert Consumer — No Consumer Running

v1 | Mar 12 2026 - 02:30 AM (MST)

**Status:** OPEN
**Severity:** High — drums never fire, popup never shows
**Assigned to:** Claude Online

---

## What's Broken

The tribal knowledge watcher (`com.tribal-chief-keymaster`, `com.tribal-chief-trm2`) successfully processes screenshots and writes signal files to:

```txt
~/.claude/alerts/pending/
```

But nothing reads from that directory. Signal files pile up forever. Drums never play. Popup never shows.

## Diagnosis

There are 8 unprocessed alert files sitting in `~/.claude/alerts/pending/`:

```txt
alert-1773263856414.json
alert-1773265603682.json
alert-1773265675624.json
alert-1773266265869.json
alert-1773266313927.json
alert-1773266522952.json
alert-1773364979304.json
alert-1773379960136.json
```

No launchd plist exists for an alert consumer. No process is watching this directory. The tribal chief writes, nothing reads.

## Root Cause

The alert system was designed in two halves:
1. **Producer** — tribal chief writes JSON signal files to `~/.claude/alerts/pending/` ✅ Working
2. **Consumer** — something reads those files and fires the sound/popup ❌ Never built / not running

The consumer half was never wired up.

## What Needs to Be Fixed

**Option A — Kill the signal file pattern entirely (preferred)**

Remove `~/.claude/alerts/pending/` from the tribal chief. Instead, have the tribal chief fire the alert DIRECTLY at the end of the pipeline:

```bash
# Play the drums inline — no signal file, no separate consumer
afplay /path/to/drums.mp3 &
osascript -e 'display notification "New tribal knowledge: $TOPIC" with title "Tribal Chief"'
```

This eliminates the need for a plist, a separate watcher, and a pending directory. The tribal chief processes the image AND plays the sound in one process. Done.

**Option B — Build the consumer (not recommended)**

Write and load a new launchd service that watches `~/.claude/alerts/pending/` and fires on new files. More moving parts, more things to break.

## Instructions for Claude Online

**Use Option A. Kill the signal file pattern.**

1. Read `scripts/tribal-chief/src/` — find where the alert signal is written (look for `alerts/pending` or `alert-` in the source)
2. Remove the signal file write
3. Replace it with a direct call: `afplay` for the drums + `osascript` for the notification
4. Find the drums sound file — check `scripts/tribal-chief/sounds/` or wherever it's stored
5. Rebuild: `npm run build`
6. Unload and reload the plist: `launchctl unload` then `launchctl load`
7. **Test it**: copy a PNG into `tribal-knowledge/images/` and confirm the drums play and the popup shows
8. If it works: clean up `~/.claude/alerts/pending/` (delete all pending JSON files)
9. If it doesn't work: stop and report

**Do not declare victory without testing. Run the actual test. See the popup. Hear the drums. Then commit.**
