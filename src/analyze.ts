import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey });

export interface AnalysisResult {
  topic: string;
  authors: string[];
  verbatim: string;
  summary: string;
  keyTakeaways: string[];
  actionItems: string[];
}

const SYSTEM_PROMPT = `You are a Slack conversation analyst. You receive raw OCR text extracted from a Slack screenshot. Your job is to produce a structured JSON analysis.

Rules:
- "verbatim" must contain the EXACT conversation text as extracted. Do not paraphrase or alter it.
- "topic" should be a short descriptive title for the conversation thread.
- "authors" is a list of all participants (usernames/display names seen in the text).
- "summary" is a concise 2-4 sentence summary of what was discussed.
- "keyTakeaways" are the most important facts, tips, or insights from the conversation.
- "actionItems" are any action items, todos, or follow-ups mentioned.

Respond with ONLY valid JSON matching this schema:
{
  "topic": "string",
  "authors": ["string"],
  "verbatim": "string",
  "summary": "string",
  "keyTakeaways": ["string"],
  "actionItems": ["string"]
}`;

/**
 * Stage 2 — Gemini 1.5 Pro (Cognition)
 * Takes raw OCR text and produces structured analysis.
 */
export async function analyzeText(rawText: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\n--- RAW OCR TEXT ---\n${rawText}\n--- END ---`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed: AnalysisResult = JSON.parse(text);
  return parsed;
}
