import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

/** Path to the bundled Indian drums sound file */
const DRUMS_SOUND = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "..",
  "sounds",
  "indian_drums.wav"
);

/**
 * Fires the success alert directly — plays Indian drums via afplay
 * and shows a macOS notification via osascript. No signal files, no consumer.
 */
export async function fireAlert(
  _sourceImage: string,
  outputFile: string
): Promise<void> {
  const topic = path.basename(outputFile, ".md");
  const message = `New tribal knowledge: ${topic}`;

  // Play Indian drums sound (non-blocking — don't await so pipeline isn't held up)
  if (existsSync(DRUMS_SOUND)) {
    execFileAsync("afplay", [DRUMS_SOUND]).catch((err) => {
      console.error("[alert] afplay failed:", err);
    });
    console.log(`[alert] Playing drums: ${DRUMS_SOUND}`);
  } else {
    console.warn(`[alert] Drums sound file not found: ${DRUMS_SOUND}`);
  }

  // Show macOS notification popup
  try {
    await execFileAsync("osascript", [
      "-e",
      `display notification "${message}" with title "Tribal Chief" sound name "default"`,
    ]);
    console.log(`[alert] Notification shown: ${message}`);
  } catch (err) {
    // osascript not available (Linux, CI, etc.)
    console.log(`[alert] Notification (osascript unavailable): ${message}`);
  }
}

/**
 * Copies a ready-to-paste message to the system clipboard via pbcopy.
 * Message format: New tribal knowledge: {full_path} — ## {section_heading}
 */
export async function copyToClipboard(
  filePath: string,
  heading: string
): Promise<void> {
  const message = `New tribal knowledge: ${filePath} — ## ${heading}`;
  try {
    const child = execFileAsync("pbcopy");
    child.child.stdin?.write(message);
    child.child.stdin?.end();
    await child;
    console.log(`[alert] Copied to clipboard: ${message}`);
  } catch {
    // pbcopy not available (Linux, CI, etc.) — log instead
    console.log(`[alert] Clipboard message (pbcopy unavailable): ${message}`);
  }
}
