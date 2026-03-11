import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AnalysisResult } from "./analyze.js";

const MASTER_REPORT = "README__tribal-knowledge.md";

/**
 * Generates a markdown filename from the image filename.
 * e.g. "tribal__slack-announcements--2026-03-11.png" → "tribal__slack-announcements--2026-03-11.md"
 */
export function mdFilenameFromImage(imagePath: string): string {
  const base = path.basename(imagePath, path.extname(imagePath));
  return `${base}.md`;
}

/**
 * Extracts the first section heading from the verbatim text.
 * Falls back to the topic if no clear heading is found.
 */
function firstSectionHeading(analysis: AnalysisResult): string {
  const lines = analysis.verbatim.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for a line that looks like "Author (time)" pattern
    if (trimmed && /\w+.*\(\d+:\d+/.test(trimmed)) {
      return trimmed;
    }
  }
  // Look for first non-empty line with an author-like pattern
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && trimmed.length > 3) {
      return trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed;
    }
  }
  return analysis.topic;
}

/**
 * Builds structured markdown from the analysis result.
 */
function buildMarkdown(analysis: AnalysisResult, imageFile: string): string {
  const now = new Date().toISOString();
  const lines: string[] = [];

  lines.push(`# ${analysis.topic}`);
  lines.push("");
  lines.push(`> Source image: \`${imageFile}\``);
  lines.push(`> Processed: ${now}`);
  lines.push("");

  // Authors
  lines.push("## Authors");
  lines.push("");
  for (const author of analysis.authors) {
    lines.push(`- ${author}`);
  }
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(analysis.summary);
  lines.push("");

  // Verbatim
  lines.push("## Verbatim");
  lines.push("");
  lines.push("```");
  lines.push(analysis.verbatim);
  lines.push("```");
  lines.push("");

  // Key Takeaways
  if (analysis.keyTakeaways.length > 0) {
    lines.push("## Key Takeaways");
    lines.push("");
    for (const takeaway of analysis.keyTakeaways) {
      lines.push(`- ${takeaway}`);
    }
    lines.push("");
  }

  // Action Items
  if (analysis.actionItems.length > 0) {
    lines.push("## Action Items");
    lines.push("");
    for (const item of analysis.actionItems) {
      lines.push(`- [ ] ${item}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Writes the structured markdown file to the output directory.
 * Returns the full path to the written file and the first section heading.
 */
export async function writeMarkdown(
  analysis: AnalysisResult,
  imagePath: string,
  outputDir: string
): Promise<{ filePath: string; heading: string }> {
  const filename = mdFilenameFromImage(imagePath);
  const filePath = path.join(outputDir, filename);
  const imageFile = path.basename(imagePath);
  const markdown = buildMarkdown(analysis, imageFile);

  await writeFile(filePath, markdown, "utf-8");
  console.log(`[writer] Wrote: ${filePath}`);

  const heading = firstSectionHeading(analysis);
  return { filePath, heading };
}

/**
 * Appends an entry to the master report (README__tribal-knowledge.md).
 * Replaces the "No entries yet" placeholder on first run.
 */
export async function updateMasterReport(
  outputDir: string,
  analysis: AnalysisResult,
  imagePath: string,
  mdPath: string
): Promise<void> {
  const reportPath = path.join(outputDir, MASTER_REPORT);
  const mdFile = path.basename(mdPath);
  const imgFile = path.basename(imagePath);
  const date = new Date().toISOString().split("T")[0];

  const entry = `| ${date} | [${analysis.topic}](${mdFile}) | ${analysis.authors.join(", ")} | \`${imgFile}\` |`;

  let content: string;
  try {
    content = await readFile(reportPath, "utf-8");
  } catch {
    content = `# Tribal Knowledge — Master Report\n\n> Auto-updated by the Tribal Knowledge Chief.\n\n## Entries\n\n_No entries yet. Drop a screenshot into \`images/\` to get started._\n`;
  }

  // Replace placeholder or append to table
  if (content.includes("_No entries yet")) {
    const table = [
      "| Date | Topic | Authors | Source Image |",
      "|------|-------|---------|--------------|",
      entry,
    ].join("\n");
    content = content.replace(
      /_No entries yet\. Drop a screenshot into `images\/` to get started\._/,
      table
    );
  } else {
    // Append row to existing table
    content = content.trimEnd() + "\n" + entry + "\n";
  }

  await writeFile(reportPath, content, "utf-8");
  console.log(`[writer] Updated master report: ${reportPath}`);
}
