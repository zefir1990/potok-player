import LibtorrentModule from '../../modules/libtorrent';

class TorrentApi {
    /**
     * Starts downloading a torrent from a magnet link.
     *
     * @param {string} magnetUri The magnet link.
     * @param {string} savePath The absolute directory path where files should be saved.
     * @returns {Promise<string>} A promise that resolves when the download completes or fails.
     */
    async download(magnetUri, savePath) {
        try {
            const result = await LibtorrentModule.download(magnetUri, savePath);
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Stops the currently active torrent download.
     * @returns {Promise<string>}
     */
    async stop() {
        try {
            return await LibtorrentModule.stop();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves the blob URL for a specific downloaded file (Web WebTorrent only).
     * @param {string} fileName The name of the file
     * @returns {Promise<string>}
     */
    async getFileUrl(fileName) {
        if (!LibtorrentModule.getFileUrl) {
            throw new Error("getFileUrl is not supported on this platform.");
        }
        return await LibtorrentModule.getFileUrl(fileName);
    }

    /**
     * Subscribes to torrent progress events.
     *
     * @param {function} callback A callback function receiving progress events `(event: { progress: number, state: string })`
     * @returns {object} A subscription object with a `.remove()` method.
     */
    addProgressListener(callback) {
        return LibtorrentModule.addListener('onTorrentProgress', callback);
    }
}

// Export a singleton instance
export default new TorrentApi();
