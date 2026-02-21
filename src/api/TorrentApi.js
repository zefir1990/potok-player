import LibtorrentModule from '../../modules/libtorrent';
import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';

// The module's typed events can be listened to via an EventEmitter
const emitter = new EventEmitter(LibtorrentModule ?? NativeModulesProxy.Libtorrent);

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
     * Subscribes to torrent progress events.
     *
     * @param {function} callback A callback function receiving progress events `(event: { progress: number, state: string })`
     * @returns {object} A subscription object with a `.remove()` method.
     */
    addProgressListener(callback) {
        return emitter.addListener('onTorrentProgress', callback);
    }
}

// Export a singleton instance
export default new TorrentApi();
