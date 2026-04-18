/** Escape `%`, `_`, and `\\` for DuckDB ILIKE ... ESCAPE '\\' */
export function escapeLikeKeyword(keyword: string): string {
    return keyword
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')
}
