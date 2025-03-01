self.onmessage = async function(event: MessageEvent) {
    const { fileName, blob } = event.data
    try {
        const root = await navigator.storage.getDirectory()
        const fileHandle = await root.getFileHandle(fileName, { create: true })
        if (fileHandle.createSyncAccessHandle) {
            const accessHandle = await fileHandle.createSyncAccessHandle()
            const arrayBuffer = await blob.arrayBuffer()
            await accessHandle.write(new Uint8Array(arrayBuffer))
            await accessHandle.close()
            self.postMessage({ success: true })
        } else {
            throw new Error('createSyncAccessHandle is not supported')
        }
    } catch (error) {
        console.error('Error in worker:', error)
        self.postMessage({ success: false, error: (error as Error).message })
    }
}
