import { getConn } from './db'
import * as duckdb from '@duckdb/duckdb-wasm'
import { aggregateEpisodesFromRows, type SearchRow } from './aggregateEpisodes'
import { escapeLikeKeyword } from './likeEscape'

export type { Episode, Shownote } from './types'

const queryStr = `
    -- (1) Get records where shownotes contain the keyword
    SELECT E.id AS e_id,
        E.title AS e_title,
        E.link AS e_link,
        E.pubDate,
        S.id AS s_id,
        S.title AS s_title,
        S.link AS s_link
    FROM Episodes E
    JOIN Shownotes S ON E.id = S.episodeId
    WHERE (S.title ILIKE '%' || ? || '%' ESCAPE '\\')
    UNION ALL
    -- (2) Get records where only episodes contain the keyword (no matching shownotes)
    SELECT E.id AS e_id,
        E.title AS e_title,
        E.link AS e_link,
        E.pubDate,
        NULL AS s_id,
        NULL AS s_title,
        NULL AS s_link
    FROM Episodes E
    WHERE (E.title ILIKE '%' || ? || '%' ESCAPE '\\')
    AND NOT EXISTS (
        SELECT 1 FROM Shownotes S
        WHERE S.episodeId = E.id
            AND (S.title ILIKE '%' || ? || '%' ESCAPE '\\')
    )
    ORDER BY E.pubDate DESC, e_id ASC, s_id ASC;
`

let stmt: duckdb.AsyncPreparedStatement | null = null

export async function prepareQuery() {
    const conn = getConn()
    if (!conn) throw new Error('DB Connection is null')
    if (!stmt) {
        stmt = await conn.prepare(queryStr)
    }
}

export async function executeSearch(keyword: string) {
    if (!stmt) {
        await prepareQuery()
    }
    if (!stmt) throw new Error('Failed to prepare statement')

    const escapedKeyword = escapeLikeKeyword(keyword)
    const episodes = await stmt.query(escapedKeyword, escapedKeyword, escapedKeyword)
    const results = episodes.toArray() as SearchRow[]
    return aggregateEpisodesFromRows(results)
}

export async function cleanupQuery() {
    if (stmt) {
        await stmt.close()
        stmt = null
    }
}
