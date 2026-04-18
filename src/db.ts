import * as duckdb from '@duckdb/duckdb-wasm'

const MANUAL_BUNDLES = {
    mvp: {
        mainModule: 'https://duckdb-assets.tamanishi.net/duckdb-eh.wasm',
        mainWorker: 'https://duckdb-assets.tamanishi.net/duckdb-browser-eh.worker.js',
    },
}

let db: duckdb.AsyncDuckDB | null = null
let conn: duckdb.AsyncDuckDBConnection | null = null

let cachedWorkerUrl: string | null = null
let cachedWasmUrl: string | null = null

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

async function createWorker(url: string) {
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const text = await response.text()
        const blob = new Blob([text], { type: 'application/javascript' })
        const worker = new Worker(URL.createObjectURL(blob))
        return worker
    } catch (error) {
        console.error('Worker creation failed:', error)
        throw new Error('Failed to initialize Web Worker')
    }
}

async function cacheFile(url: string, fileName: string): Promise<string> {
    // Safari + OPFS can stall in some environments; prefer direct fetch URL for stability.
    if (isSafari) {
        return url
    }

    try {
        const root = await navigator.storage.getDirectory()
        try {
            const fileHandle = await root.getFileHandle(fileName)
            const file = await fileHandle.getFile()
            const objectUrl = URL.createObjectURL(file)
            return objectUrl
        } catch {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
            }
            const blob = await response.blob()
            const fileHandle = await root.getFileHandle(fileName, { create: true })
            if (isSafari) {
                const worker = new Worker('/static/worker.js')
                worker.postMessage({ fileName, blob })
                worker.onmessage = function (event: MessageEvent) {
                    if (!event.data.success) {
                        console.error('Failed to write file in Safari:', event.data.error)
                    }
                }
            } else {
                const writable = await fileHandle.createWritable()
                await writable.write(blob)
                await writable.close()
            }
            const objectUrl = URL.createObjectURL(blob)
            const cacheResponse = await fetch(objectUrl)
            if (!cacheResponse.ok) {
                throw new Error(`Failed to fetch WASM file: ${cacheResponse.statusText}`)
            }
            return objectUrl
        }
    } catch (error) {
        console.error('Failed to cache file:', error)
        return url
    }
}

export async function initDB(): Promise<duckdb.AsyncDuckDBConnection> {
    if (typeof window === 'undefined') {
        throw new Error('Cannot initialize DB on server side')
    }
    if (conn) return conn

    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)

    const [workerUrl, wasmUrl] = await Promise.all([
        cacheFile(bundle.mainWorker!, 'duckdb-worker.js'),
        cacheFile(bundle.mainModule!, 'duckdb-wasm.wasm'),
    ])

    cachedWorkerUrl = workerUrl
    cachedWasmUrl = wasmUrl

    const worker = await createWorker(cachedWorkerUrl)
    const logger = new duckdb.ConsoleLogger()

    db = new duckdb.AsyncDuckDB(logger, worker)

    try {
        const response = await fetch(cachedWasmUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch WASM file: ${response.statusText}`)
        }
        const wasmBlob = await response.blob()
        const arrayBuffer = await wasmBlob.arrayBuffer()
        const wasmFile = new Blob([arrayBuffer], { type: 'application/wasm' })
        const wasmUrlBlob = URL.createObjectURL(wasmFile)
        await db.instantiate(wasmUrlBlob, bundle.pthreadWorker)
    } catch (error) {
        console.error('Failed to instantiate DuckDB:', error)
        throw error
    }

    conn = await db.connect()

    const episodesUrl = import.meta.env.PROD
        ? 'https://raw.githubusercontent.com/tamanishi/check-rebuild-feed/refs/heads/main/Episodes.parquet'
        : new URL('/static/episodes.parquet', window.location.origin).toString()

    const shownotesUrl = import.meta.env.PROD
        ? 'https://raw.githubusercontent.com/tamanishi/check-rebuild-feed/refs/heads/main/Shownotes.parquet'
        : new URL('/static/shownotes.parquet', window.location.origin).toString()

    await conn.query(`
        CREATE TABLE Episodes AS SELECT * FROM read_parquet('${episodesUrl}');
        CREATE TABLE Shownotes AS SELECT * FROM read_parquet('${shownotesUrl}');
    `)

    return conn
}

export function getConn(): duckdb.AsyncDuckDBConnection | null {
    return conn
}

export async function cleanupDB() {
    if (conn) await conn.close()
    if (db) await db.terminate()

    if (isSafari) {
        if (cachedWorkerUrl) URL.revokeObjectURL(cachedWorkerUrl)
        if (cachedWasmUrl) URL.revokeObjectURL(cachedWasmUrl)
        cachedWorkerUrl = null
        cachedWasmUrl = null
    }
}
