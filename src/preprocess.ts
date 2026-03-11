import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Image Preprocessing
 *
 * Rules from the spec:
 * 1. Format: WebP is default (CleanShot X).
 * 2. Resolution: Do NOT resize. Maintain high res (up to 3072px longest side).
 * 3. Compression: Only convert to JPEG (85%) if file exceeds 10MB.
 *
 * Returns the path to the (possibly converted) image file.
 */
export async function preprocessImage(imagePath: string): Promise<string> {
  const fileStat = await stat(imagePath);

  if (fileStat.size <= MAX_FILE_SIZE_BYTES) {
    return imagePath;
  }

  // File exceeds 10MB — convert to high-quality JPEG using sips
  const dir = path.dirname(imagePath);
  const base = path.basename(imagePath, path.extname(imagePath));
  const jpegPath = path.join(dir, `${base}.jpg`);

  await execFileAsync("sips", [
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    "85",
    imagePath,
    "--out",
    jpegPath,
  ]);

  console.log(
    `[preprocess] Converted oversized image to JPEG: ${jpegPath} (original: ${(fileStat.size / 1024 / 1024).toFixed(1)}MB)`
  );

  return jpegPath;
}
