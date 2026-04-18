import type { Episode, Shownote } from './types'

export type SearchRow = {
    e_id: number
    e_title: string
    e_link: string
    pubDate: string
    s_id: number | null
    s_title: string | null
    s_link: string | null
}

/** Aggregate flat SQL result rows into episodes with nested shownotes (order preserved by query order). */
export function aggregateEpisodesFromRows(rows: SearchRow[]): Episode[] {
    const episodeMap = new Map<number, Episode>()

    for (const e of rows) {
        if (episodeMap.has(e.e_id)) {
            if (e.s_id === null) {
                continue
            }
            const episode = episodeMap.get(e.e_id)!
            const shownote: Shownote = {
                title: e.s_title,
                link: e.s_link,
            }
            episode.shownotes.push(shownote)
        } else {
            const episode: Episode = {
                title: e.e_title,
                link: e.e_link,
                pubDate: e.pubDate,
                shownotes: [],
            }
            if (e.s_id !== null) {
                episode.shownotes.push({
                    title: e.s_title,
                    link: e.s_link,
                })
            }
            episodeMap.set(e.e_id, episode)
        }
    }

    return Array.from(episodeMap.values())
}
