import { describe, expect, it } from 'vitest'
import { aggregateEpisodesFromRows, type SearchRow } from './aggregateEpisodes'

describe('aggregateEpisodesFromRows', () => {
    it('returns empty array for empty input', () => {
        expect(aggregateEpisodesFromRows([])).toEqual([])
    })

    it('builds one episode with one shownote from a single join row', () => {
        const rows: SearchRow[] = [
            {
                e_id: 1,
                e_title: 'Ep 1',
                e_link: 'https://e1',
                pubDate: '2024-01-01T00:00:00.000Z',
                s_id: 10,
                s_title: 'Note A',
                s_link: 'https://n1',
            },
        ]
        const out = aggregateEpisodesFromRows(rows)
        expect(out).toHaveLength(1)
        expect(out[0]).toEqual({
            title: 'Ep 1',
            link: 'https://e1',
            pubDate: '2024-01-01T00:00:00.000Z',
            shownotes: [{ title: 'Note A', link: 'https://n1' }],
        })
    })

    it('merges multiple shownotes for the same episode', () => {
        const rows: SearchRow[] = [
            {
                e_id: 1,
                e_title: 'Ep',
                e_link: 'https://e',
                pubDate: '2024-01-01T00:00:00.000Z',
                s_id: 10,
                s_title: 'A',
                s_link: 'https://a',
            },
            {
                e_id: 1,
                e_title: 'Ep',
                e_link: 'https://e',
                pubDate: '2024-01-01T00:00:00.000Z',
                s_id: 11,
                s_title: 'B',
                s_link: 'https://b',
            },
        ]
        const out = aggregateEpisodesFromRows(rows)
        expect(out).toHaveLength(1)
        expect(out[0].shownotes).toEqual([
            { title: 'A', link: 'https://a' },
            { title: 'B', link: 'https://b' },
        ])
    })

    it('creates episode-only row when second row has null shownote (episode-only branch)', () => {
        const rows: SearchRow[] = [
            {
                e_id: 2,
                e_title: 'Only Ep',
                e_link: 'https://e2',
                pubDate: '2024-02-01T00:00:00.000Z',
                s_id: null,
                s_title: null,
                s_link: null,
            },
        ]
        const out = aggregateEpisodesFromRows(rows)
        expect(out).toHaveLength(1)
        expect(out[0].shownotes).toEqual([])
    })

    it('ignores duplicate episode-only row when episode already has shownotes', () => {
        const rows: SearchRow[] = [
            {
                e_id: 1,
                e_title: 'Ep',
                e_link: 'https://e',
                pubDate: '2024-01-01T00:00:00.000Z',
                s_id: 10,
                s_title: 'A',
                s_link: 'https://a',
            },
            {
                e_id: 1,
                e_title: 'Ep',
                e_link: 'https://e',
                pubDate: '2024-01-01T00:00:00.000Z',
                s_id: null,
                s_title: null,
                s_link: null,
            },
        ]
        const out = aggregateEpisodesFromRows(rows)
        expect(out).toHaveLength(1)
        expect(out[0].shownotes).toEqual([{ title: 'A', link: 'https://a' }])
    })

    it('keeps insertion order across different episodes', () => {
        const rows: SearchRow[] = [
            {
                e_id: 10,
                e_title: 'First',
                e_link: 'https://first',
                pubDate: '2024-01-01T00:00:00.000Z',
                s_id: null,
                s_title: null,
                s_link: null,
            },
            {
                e_id: 20,
                e_title: 'Second',
                e_link: 'https://second',
                pubDate: '2024-01-02T00:00:00.000Z',
                s_id: 1,
                s_title: 'S',
                s_link: 'https://s',
            },
        ]
        const out = aggregateEpisodesFromRows(rows)
        expect(out.map((e) => e.title)).toEqual(['First', 'Second'])
    })

    it('keeps shownote even when shownote title is null and s_id is present', () => {
        const rows: SearchRow[] = [
            {
                e_id: 1,
                e_title: 'Ep',
                e_link: 'https://e',
                pubDate: '2024-01-01T00:00:00.000Z',
                s_id: 99,
                s_title: null,
                s_link: 'https://n',
            },
        ]
        const out = aggregateEpisodesFromRows(rows)
        expect(out).toHaveLength(1)
        expect(out[0].shownotes).toEqual([{ title: null, link: 'https://n' }])
    })
})
