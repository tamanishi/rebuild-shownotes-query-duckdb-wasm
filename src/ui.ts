import { DateTime } from 'luxon'
import type { Episode, Shownote } from './types'
import { splitForHighlight } from './highlight'

function createHighlightedText(text: string, keyword: string): DocumentFragment {
    const fragment = document.createDocumentFragment()
    for (const seg of splitForHighlight(text, keyword)) {
        if (seg.kind === 'mark') {
            const mark = document.createElement('mark')
            mark.textContent = seg.value
            fragment.appendChild(mark)
        } else {
            fragment.appendChild(document.createTextNode(seg.value))
        }
    }
    return fragment
}

export function renderResults(episodes: Episode[], keywordValue: string) {
    const container = document.getElementById('search-results')
    if (!container) return

    container.textContent = ''

    if (episodes.length === 0) {
        const p = document.createElement('p')
        p.className = 'text-gray-500 mt-4'
        p.textContent = keywordValue ? 'No results found.' : 'No data available.'
        container.appendChild(p)
        return
    }

    const docFrag = document.createDocumentFragment()

    episodes.forEach((episode) => {
        const div = document.createElement('div')
        div.className = 'my-3'

        const h2 = document.createElement('h2')
        h2.className = 'text-xl text-blue-400 inline-block'
        const a = document.createElement('a')
        a.className = 'hover:underline'
        a.href = episode.link
        a.target = '_blank'

        const divTitle = document.createElement('div')
        divTitle.appendChild(createHighlightedText(episode.title, keywordValue))
        a.appendChild(divTitle)
        h2.appendChild(a)
        div.appendChild(h2)

        const pubDateStr = DateTime.fromISO(episode.pubDate).toFormat('yyyy/LL/dd')
        const span = document.createElement('span')
        span.className = 'ml-2 text-gray-400'
        span.textContent = `(${pubDateStr})`
        div.appendChild(span)

        if (episode.shownotes.length > 0) {
            const ul = document.createElement('ul')
            ul.className = 'list-inside list-disc'
            episode.shownotes.forEach((sn: Shownote) => {
                if (!sn.title) return
                const li = document.createElement('li')
                li.className = 'whitespace-nowrap mx-3 marker:text-blue-400'

                const snA = document.createElement('a')
                snA.className = 'inline-block text-blue-400 hover:underline'
                snA.href = sn.link || '#'
                snA.target = '_blank'

                const snDiv = document.createElement('div')
                snDiv.appendChild(createHighlightedText(sn.title, keywordValue))
                snA.appendChild(snDiv)

                li.appendChild(snA)
                ul.appendChild(li)
            })
            div.appendChild(ul)
        }

        docFrag.appendChild(div)
    })

    container.appendChild(docFrag)
}

export function renderError(message: string) {
    const container = document.getElementById('search-results')
    if (!container) return

    container.textContent = ''

    const p = document.createElement('p')
    p.className = 'text-red-500 font-bold'
    p.textContent = message
    container.appendChild(p)
}
