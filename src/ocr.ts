import { GoogleGenAI } from "@google/genai";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const execFileAsync = promisify(execFile);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `You are a verbatim transcriber. Read the screenshot and output EXACTLY what you see — every word, every username, every timestamp, every emoji reaction.

Rules:
- VERBATIM transcription — copy every word exactly as it appears
- If it's a Slack thread, capture every message word-for-word including usernames, timestamps, reactions, and thread replies
- Preserve formatting: bold, italic, code blocks, links, bullet points — recreate them in markdown
- Preserve emoji reactions and their counts
- Preserve thread structure (who replied to whom)
- Do NOT summarize
- Do NOT paraphrase or rewrite
- Do NOT skip any messages
- Do NOT add commentary or analysis
- If you cannot read a word clearly, use [unclear] as a placeholder

Output: plain text, every character as it appears on screen.`;

/**
 * Get image dimensions via sips.
 */
async function getImageDimensions(
  imagePath: string
): Promise<{ width: number; height: number }> {
  const { stdout } = await execFileAsync("sips", [
    "-g",
    "pixelHeight",
    "-g",
    "pixelWidth",
    imagePath,
  ]);
  const heightMatch = stdout.match(/pixelHeight:\s*(\d+)/);
  const widthMatch = stdout.match(/pixelWidth:\s*(\d+)/);
  return {
    width: widthMatch ? parseInt(widthMatch[1]) : 0,
    height: heightMatch ? parseInt(heightMatch[1]) : 0,
  };
}

/**
 * Slice a tall image into chunks using sips via Python.
 */
async function sliceImage(
  imagePath: string,
  height: number,
  width: number
): Promise<string[]> {
  const sliceDir = `/tmp/tribal-slices-${Date.now()}`;
  await mkdir(sliceDir, { recursive: true });

  const chunkHeight = 1000;
  const script = `
import subprocess, os
src = '${imagePath.replace(/'/g, "\\'")}'
out_dir = '${sliceDir}'
height = ${height}
width = ${width}
chunk = ${chunkHeight}
for i in range(0, height, chunk):
    h = min(chunk, height - i)
    out = f'{out_dir}/slice_{i:04d}.png'
    subprocess.run(['sips', '-c', str(h), str(width), '--cropOffset', str(i), '0', src, '--out', out], capture_output=True)
`;

  await execFileAsync("python3", ["-c", script]);

  const { stdout } = await execFileAsync("ls", [sliceDir]);
  const slices = stdout
    .trim()
    .split("\n")
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => path.join(sliceDir, f));

  return slices;
}

/**
 * Stage 1 — Gemini Vision OCR (Perception)
 * Sends image (or slices of tall images) to Gemini 2.5 Flash for verbatim text extraction.
 * Returns the raw extracted string.
 */
export async function extractText(imagePath: string): Promise<string> {
  const dims = await getImageDimensions(imagePath);
  console.log(`[ocr] Image dimensions: ${dims.width}x${dims.height}`);

  let slicePaths: string[];
  let sliceDir: string | null = null;

  // Slice tall images into 1000px chunks
  if (dims.height > 1500) {
    console.log(
      `[ocr] Tall image detected (${dims.height}px) — slicing into chunks...`
    );
    slicePaths = await sliceImage(imagePath, dims.height, dims.width);
    sliceDir = path.dirname(slicePaths[0]);
    console.log(`[ocr] ${slicePaths.length} slice(s)`);
  } else {
    slicePaths = [imagePath];
  }

  const parts: string[] = [];

  // Process one slice at a time — sequential, not parallel
  for (let i = 0; i < slicePaths.length; i++) {
    const slicePath = slicePaths[i];
    const imageBuffer = await readFile(slicePath);
    const base64 = imageBuffer.toString("base64");
    const ext = path.extname(slicePath).toLowerCase();
    const mimeType =
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text:
                slicePaths.length > 1
                  ? `This is slice ${i + 1} of ${slicePaths.length} from a tall screenshot. Transcribe ONLY what you see in this slice.`
                  : "Transcribe everything you see in this screenshot.",
            },
          ],
        },
      ],
    });

    const text = response.text ?? "";
    parts.push(text.trim());

    // Breathe between API calls
    if (slicePaths.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Clean up slices
  if (sliceDir) {
    await rm(sliceDir, { recursive: true, force: true });
  }

  const fullText = parts.join("\n\n");
  if (!fullText.trim()) {
    throw new Error(`No text detected in image: ${imagePath}`);
  }

  return fullText;
}
