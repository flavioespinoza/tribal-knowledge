# BUG__tribal-knowledge--clipboard--encoding-artifacts

v1 | Mar 13 2026 - 02:15 AM (MST)

**Type:** BUG
**Project:** tribal-knowledge
**Status:** FIXED
**Severity:** Medium — clipboard is unusable when Unicode chars are present

---

## Problem

The watcher alert copies a message to the clipboard via `pbcopy`. When the heading contains
a multi-byte Unicode character — specifically the ellipsis `…` (U+2026, UTF-8: `E2 80 A6`) —
the clipboard content comes out mangled as `‚Ä¶` when pasted.

`‚Ä¶` is exactly what `E2 80 A6` (the three UTF-8 bytes for `…`) looks like when read as
Mac Roman encoding. This is the classic UTF-8/Mac Roman mismatch.

---

## Root Cause

`pbcopy` performs encoding conversion when `LANG`, `LC_ALL`, or `LC_CTYPE` is set in its
environment. With `LANG=en_US.UTF-8` present:

1. pbcopy reads stdin (UTF-8 bytes `E2 80 A6` for `…`)
2. Decodes as UTF-8 → gets Unicode character U+2026
3. Re-encodes into Mac Roman before storing to the clipboard → byte `C9`
4. `pbpaste` outputs the Mac Roman byte `C9`
5. Applications that expect UTF-8 interpret `C9` as the start of an incomplete UTF-8
   sequence → mangled display

**Counterintuitively:** setting `LANG=en_US.UTF-8` on pbcopy makes it WORSE, not better.
Without any locale vars, pbcopy treats stdin as raw bytes and passes them through unchanged —
the UTF-8 bytes land in the clipboard exactly as written.

### What triggered it

The launchd service (`run.sh`) was sourcing `~/.zkeys` which may export `LANG=en_US.UTF-8`.
When that var propagates to the `pbcopy` child process spawned by Node.js, the conversion
happens. In environments without LANG set, the bug is silent.

An earlier attempted fix added `LANG=en_US.UTF-8` explicitly to `run.sh` and to the
`execFileAsync` call in `alert.ts` — this locked in the bad behavior unconditionally.

### Confirmed behavior (verified empirically)

| Condition | Last bytes of `pbpaste \| xxd` | Result |
|-----------|-------------------------------|--------|
| `pbcopy` with `LANG=en_US.UTF-8` | `c9` | Mangled — Mac Roman byte for `…` |
| `pbcopy` without any LANG vars | `e2 80 a6` | Correct — UTF-8 for `…` |

---

## Fix

**File:** `src/alert.ts` — `copyToClipboard()`

Strip locale-related environment variables from pbcopy's spawn env before calling it.
This prevents any conversion regardless of what the parent process has set.

```typescript
async function copyToClipboard(message: string): Promise<void> {
	const env = { ...process.env }
	delete env.LANG
	delete env.LC_ALL
	delete env.LC_CTYPE
	const child = execFileAsync('pbcopy', [], { env })
	child.child.stdin?.write(message, 'utf-8')
	child.child.stdin?.end()
	await child
}
```

**File:** `run.sh`

Do NOT export `LANG` or `LC_ALL`. Comment added to prevent future recurrence.

---

## Test

1. Restart the launchd service: `launchctl stop com.tribal-chief-keymaster && launchctl start com.tribal-chief-keymaster`
2. Drop a screenshot with long heading text into `tribal-knowledge/images/`
3. After popup dismissal, run: `pbpaste | xxd | tail -3`
4. Confirm last bytes are `e2 80 a6` (clean UTF-8 ellipsis), NOT `c9`

**Tested on:** Mar 13 2026 — clean output confirmed.

---

## Files Affected

- `src/alert.ts` — `copyToClipboard()`: strip LANG/LC_ALL/LC_CTYPE from pbcopy env
- `run.sh` — removed LANG/LC_ALL exports, added explanatory comment
- `dist/alert.js` — compiled output (rebuilt via `npm run build`)
