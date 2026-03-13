import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import os from 'node:os'

const execFileAsync = promisify(execFile)

const DRUMS_PATH = path.join(
	os.homedir(),
	'.claude',
	'alerts',
	'sounds',
	'indian-drums.m4a'
)

/**
 * Plays indian drums audio via afplay (non-blocking).
 * Returns the child process so it can be killed when the popup is dismissed.
 */
function playDrums(): ChildProcess {
	const child = spawn('afplay', [DRUMS_PATH], { stdio: 'ignore' })
	console.log('[alert] Playing drums audio')
	return child
}

/**
 * Shows a BLOCKING native macOS popup via osascript.
 * The popup stays on screen until Flavio clicks OK.
 * Returns when the popup is dismissed.
 */
async function showPopup(filename: string): Promise<void> {
	const script = `display alert "Tribal Knowledge" message "New tribal knowledge processed:\\n\\n${filename}" buttons {"OK"} default button "OK"`
	await execFileAsync('osascript', ['-e', script])
	console.log('[alert] Popup dismissed')
}

/**
 * Copies a message to the system clipboard via pbcopy.
 *
 * pbcopy with LANG/LC_CTYPE set performs encoding conversion (UTF-8 → Mac Roman),
 * which mangles multi-byte characters like … (U+2026) into the Mac Roman byte C9.
 * Stripping locale vars from pbcopy's env prevents that conversion — pbcopy then
 * treats stdin as raw bytes and the UTF-8 passes through intact.
 */
async function copyToClipboard(message: string): Promise<void> {
	const env = { ...process.env }
	delete env.LANG
	delete env.LC_ALL
	delete env.LC_CTYPE
	const child = execFileAsync('pbcopy', [], { env })
	child.child.stdin?.write(message, 'utf-8')
	child.child.stdin?.end()
	await child
	console.log(`[alert] Copied to clipboard: ${message}`)
}

/**
 * Post-processing alert: drums + blocking popup + clipboard on dismiss.
 *
 * Flow:
 * 1. Play indian drums audio (non-blocking)
 * 2. Show native macOS alert (BLOCKING — waits for OK)
 * 3. After OK is clicked, kill drums + copy message to clipboard
 */
export async function fireAlert(
	mdFilePath: string,
	heading: string
): Promise<void> {
	const filename = path.basename(mdFilePath)
	const clipboardMessage = `New tribal knowledge: ${mdFilePath} -- ## ${heading}`

	let drumsProcess: ChildProcess | null = null

	try {
		// Play drums alongside the popup
		drumsProcess = playDrums()

		// Blocking popup — waits until Flavio clicks OK
		await showPopup(filename)

		// Kill drums immediately on dismiss
		drumsProcess.kill()
		console.log('[alert] Drums stopped')

		// After dismiss — copy to clipboard
		await copyToClipboard(clipboardMessage)
	} catch (err) {
		drumsProcess?.kill()
		console.error('[alert] Alert failed:', err)
	}
}
