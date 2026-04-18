'use client'

import { initDB, cleanupDB } from './db'
import { prepareQuery, executeSearch, cleanupQuery } from './query'
import { renderResults, renderError } from './ui'

let isInitialized = false

export async function initialize() {
    const keywordInput = document.getElementById('keyword') as HTMLInputElement | null
    const loadingState = document.getElementById('loading-state')

    try {
        await initDB()
        await prepareQuery()
        isInitialized = true

        if (keywordInput) {
            keywordInput.disabled = false
        }
        if (loadingState) {
            loadingState.style.display = 'none'
        }

        await handleSearch()
    } catch (error) {
        console.error('Initialization failed:', error)
        renderError('An error occurred during initialization. Please try reloading.')

        if (loadingState) loadingState.style.display = 'none'
    }
}

export async function handleSearch() {
    if (!isInitialized) return

    const keywordInput = document.getElementById('keyword') as HTMLInputElement | null
    const keywordValue = keywordInput?.value || ''

    try {
        const episodes = await executeSearch(keywordValue)
        renderResults(episodes, keywordValue)
    } catch (error) {
        renderError('An error occurred during search.')
    }
}

export async function cleanup() {
    await cleanupQuery()
    await cleanupDB()
}

if (typeof window !== 'undefined') {
    window.search = handleSearch

    document.addEventListener('DOMContentLoaded', () => {
        initialize().catch(console.error)

        const keyword = document.getElementById('keyword')
        keyword?.addEventListener('input', () => {
            handleSearch().catch(console.error)
        })
    })

    window.addEventListener('beforeunload', () => {
        cleanup().catch(console.error)
    })
}

declare global {
    interface Window {
        search: typeof handleSearch
    }
}
