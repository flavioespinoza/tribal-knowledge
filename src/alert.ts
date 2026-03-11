import { writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";

const execFileAsync = promisify(execFile);

const ALERTS_DIR = path.join(os.homedir(), ".claude", "alerts", "pending");

interface AlertSignal {
  type: "tribal_knowledge";
  sound: "indian_drums";
  message: string;
  source_image: string;
  output_file: string;
  created: string;
}

/**
 * Writes a signal file for the Flavio Alert extension.
 * The extension picks it up, plays indian drums audio, and shows a popup.
 */
export async function fireAlert(
  sourceImage: string,
  outputFile: string
): Promise<void> {
  try {
    await mkdir(ALERTS_DIR, { recursive: true });

    const signal: AlertSignal = {
      type: "tribal_knowledge",
      sound: "indian_drums",
      message: "New tribal knowledge processed",
      source_image: path.basename(sourceImage),
      output_file: path.basename(outputFile),
      created: new Date().toISOString(),
    };

    const alertPath = path.join(ALERTS_DIR, `alert-${Date.now()}.json`);
    await writeFile(alertPath, JSON.stringify(signal, null, 2), "utf-8");
    console.log(`[alert] Signal written: ${alertPath}`);
  } catch (err) {
    console.error("[alert] Failed to write alert signal:", err);
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
