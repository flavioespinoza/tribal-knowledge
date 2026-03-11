import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

/**
 * Stage 1 — Google Cloud Vision OCR (Perception)
 * Uses documentTextDetection for dense UI text (Slack screenshots).
 * Returns the raw extracted string — every character, every timestamp.
 */
export async function extractText(imagePath: string): Promise<string> {
  const [result] = await client.documentTextDetection(imagePath);
  const fullText = result.fullTextAnnotation?.text;
  if (!fullText) {
    throw new Error(`No text detected in image: ${imagePath}`);
  }
  return fullText;
}
