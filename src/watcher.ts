import chokidar from "chokidar";
import { rename, mkdir } from "node:fs/promises";
import path from "node:path";
import { preprocessImage } from "./preprocess.js";
import { extractText } from "./ocr.js";
import { analyzeText } from "./analyze.js";
import { writeMarkdown, updateMasterReport } from "./writer.js";
import { fireAlert, copyToClipboard } from "./alert.js";

// Project root — images/ is the watch dir, output goes to tribal-knowledge/
const PROJECT_ROOT = path.resolve(process.cwd());
const IMAGES_DIR = path.join(PROJECT_ROOT, "images");
const IMAGES_DONE_DIR = path.join(IMAGES_DIR, "done");
const OUTPUT_DIR = PROJECT_ROOT;

const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/**
 * Process a single image through the full pipeline:
 * 1. Preprocess (compression if >10MB)
 * 2. OCR via Google Cloud Vision
 * 3. Analyze via Gemini 1.5 Pro
 * 4. Write structured markdown
 * 5. Fire alert + clipboard
 */
async function processImage(imagePath: string): Promise<void> {
  const filename = path.basename(imagePath);
  console.log(`\n[watcher] New image detected: ${filename}`);
  console.log("[watcher] Starting pipeline...");

  try {
    // Stage 0: Preprocess
    console.log("[pipeline] Stage 0: Preprocessing image...");
    const processedPath = await preprocessImage(imagePath);

    // Stage 1: OCR
    console.log("[pipeline] Stage 1: Extracting text via Cloud Vision...");
    const rawText = await extractText(processedPath);
    console.log(
      `[pipeline] Stage 1 complete: ${rawText.length} characters extracted`
    );

    // Stage 2: Analysis
    console.log("[pipeline] Stage 2: Analyzing via Gemini 1.5 Pro...");
    const analysis = await analyzeText(rawText);
    console.log(`[pipeline] Stage 2 complete: topic="${analysis.topic}"`);

    // Write markdown
    console.log("[pipeline] Writing markdown...");
    const { filePath, heading } = await writeMarkdown(
      analysis,
      imagePath,
      OUTPUT_DIR
    );

    // Move processed image to done/
    await mkdir(IMAGES_DONE_DIR, { recursive: true });
    const donePath = path.join(IMAGES_DONE_DIR, path.basename(imagePath));
    await rename(imagePath, donePath);
    console.log(`[pipeline] Moved image to: ${donePath}`);

    // Update master report
    await updateMasterReport(OUTPUT_DIR, analysis, imagePath, filePath);

    // Post-processing: alert + clipboard
    await fireAlert(imagePath, filePath);
    await copyToClipboard(filePath, heading);

    console.log(`[watcher] Pipeline complete: ${filePath}`);
  } catch (err) {
    console.error(`[watcher] Pipeline failed for ${filename}:`, err);
  }
}

function start(): void {
  console.log("[watcher] Tribal Knowledge Chief starting...");
  console.log(`[watcher] Watching: ${IMAGES_DIR}`);
  console.log(`[watcher] Output:   ${OUTPUT_DIR}`);

  const watcher = chokidar.watch(IMAGES_DIR, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 200,
    },
  });

  watcher.on("add", (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (SUPPORTED_EXTENSIONS.has(ext)) {
      processImage(filePath);
    }
  });

  watcher.on("error", (err) => {
    console.error("[watcher] Error:", err);
  });

  console.log("[watcher] Ready. Waiting for screenshots...");
}

start();
