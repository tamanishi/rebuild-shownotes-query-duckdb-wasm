export type HighlightSegment =
    | { kind: 'text'; value: string }
    | { kind: 'mark'; value: string }

/** Escape a string for use inside a RegExp constructor. */
export function escapeRegExpLiteral(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Split text into alternating plain / highlight segments for case-insensitive keyword matching.
 * When keyword is empty, returns a single text segment.
 */
export function splitForHighlight(text: string, keyword: string): HighlightSegment[] {
    if (!keyword) {
        return [{ kind: 'text', value: text }]
    }

    const escaped = escapeRegExpLiteral(keyword)
    const re = new RegExp(escaped, 'gi')
    const segments: HighlightSegment[] = []
    let lastIndex = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(text)) !== null) {
        if (m.index > lastIndex) {
            segments.push({ kind: 'text', value: text.slice(lastIndex, m.index) })
        }
        segments.push({ kind: 'mark', value: m[0] })
        lastIndex = m.index + m[0].length
    }

    if (lastIndex < text.length) {
        segments.push({ kind: 'text', value: text.slice(lastIndex) })
    }

    return segments
}
