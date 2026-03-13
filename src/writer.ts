import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { AnalysisResult } from './analyze.js'

const MASTER_REPORT = 'README__tribal-knowledge.md'

/**
 * Generates a markdown filename from the image filename.
 * tribal__screenshot--2026-03-11__1773265603682.png → tribal__screenshot--2026-03-11__1773265603682.md
 */
export function mdFilenameFromImage(imagePath: string): string {
	const base = path.basename(imagePath, path.extname(imagePath))
	return `${base}.md`
}

/**
 * Extracts the first section heading from the verbatim text.
 * Falls back to the topic if no clear heading is found.
 */
function firstSectionHeading(analysis: AnalysisResult): string {
	const lines = analysis.verbatim.split('\n')
	for (const line of lines) {
		const trimmed = line.trim()
		if (trimmed && /\w+.*\(\d+:\d+/.test(trimmed)) {
			return trimmed
		}
	}
	for (const line of lines) {
		const trimmed = line.trim()
		if (trimmed && trimmed.length > 3) {
			return trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed
		}
	}
	return analysis.topic
}

/**
 * Formats a human-readable date: "Mar 11 2026 - 03:47 PM (MST)"
 */
function formatDate(date: Date): string {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const mon = months[date.getMonth()]
	const dd = String(date.getDate()).padStart(2, '0')
	const yyyy = date.getFullYear()
	let hours = date.getHours()
	const ampm = hours >= 12 ? 'PM' : 'AM'
	hours = hours % 12 || 12
	const hh = String(hours).padStart(2, '0')
	const mm = String(date.getMinutes()).padStart(2, '0')
	return `${mon} ${dd} ${yyyy} - ${hh}:${mm} ${ampm} (MST)`
}

/**
 * Builds structured markdown matching the ideal setup format.
 */
function buildMarkdown(analysis: AnalysisResult, imageFile: string): string {
	const now = new Date()
	const lines: string[] = []

	lines.push(`# ${analysis.topic}`)
	lines.push('')
	lines.push(`**Source:** Screenshot — \`${imageFile}\``)
	lines.push(`**Date:** ${formatDate(now)}`)
	lines.push(`**Image:** \`images/done/${imageFile}\``)
	lines.push('')
	lines.push('---')
	lines.push('')
	lines.push(analysis.verbatim)
	lines.push('')

	if (analysis.summary) {
		lines.push('---')
		lines.push('')
		lines.push('## Summary')
		lines.push('')
		lines.push(analysis.summary)
		lines.push('')
	}

	if (analysis.keyTakeaways.length > 0) {
		lines.push('## Key Takeaways')
		lines.push('')
		for (const takeaway of analysis.keyTakeaways) {
			lines.push(`- ${takeaway}`)
		}
		lines.push('')
	}

	if (analysis.actionItems.length > 0) {
		lines.push('## Action Items')
		lines.push('')
		for (const item of analysis.actionItems) {
			lines.push(`- [ ] ${item}`)
		}
		lines.push('')
	}

	return lines.join('\n')
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
	const filename = mdFilenameFromImage(imagePath)
	const filePath = path.join(outputDir, filename)
	const imageFile = path.basename(imagePath)
	const markdown = buildMarkdown(analysis, imageFile)

	await writeFile(filePath, markdown, 'utf-8')
	console.log(`[writer] Wrote: ${filePath}`)

	const heading = firstSectionHeading(analysis)
	return { filePath, heading }
}

/**
 * Appends an entry to the README__tribal-knowledge.md index.
 * Replaces the "No entries yet" placeholder on first run.
 */
export async function updateMasterReport(
	outputDir: string,
	analysis: AnalysisResult,
	imagePath: string,
	mdPath: string
): Promise<void> {
	const reportPath = path.join(outputDir, MASTER_REPORT)
	const mdFile = path.basename(mdPath)
	const imgFile = path.basename(imagePath)
	const now = new Date()
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const dateStr = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')} ${now.getFullYear()}`

	const entry = `| \`${mdFile}\` | ${analysis.topic} | ${dateStr} | \`${imgFile}\` |`

	let content: string
	try {
		content = await readFile(reportPath, 'utf-8')
	} catch {
		content = `# Tribal Knowledge\n\n## Index\n\n_No entries yet. Drop a screenshot into \`images/\` to get started._\n`
	}

	if (content.includes('_No entries yet')) {
		const table = [
			'| File | Topic | Date | Source Image |',
			'|------|-------|------|--------------|',
			entry
		].join('\n')
		content = content.replace(
			/_No entries yet\.[^_]*_/,
			table
		)
	} else {
		content = content.trimEnd() + '\n' + entry + '\n'
	}

	await writeFile(reportPath, content, 'utf-8')
	console.log(`[writer] Updated master report: ${reportPath}`)
}
