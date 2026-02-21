import { registerWebModule, NativeModule } from 'expo';

import { LibtorrentModuleEvents } from './Libtorrent.types';

class LibtorrentModule extends NativeModule<LibtorrentModuleEvents> {
  // WebTorrent client instance
  private client: any = null;

  async download(magnetUri: string, savePath: string): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('WebTorrent cannot be run outside of a browser environment');
    }

    // Load the minified webtorrent module to bypass node polyfill requirements.
    // UMD bundle will return the constructor.
    const WT = require('webtorrent/dist/webtorrent.min.js');
    const WebTorrent = WT.default || WT;
    if (!this.client) {
      this.client = new WebTorrent();
    }

    return new Promise((resolve, reject) => {
      console.log(`[LibtorrentModule.web.ts] download() called with magnetUri: ${magnetUri}`);
      this.emit('onTorrentProgress', { progress: 0, state: 'Starting WebTorrent...' });

      console.log('[LibtorrentModule.web.ts] Calling webtorrent client.add()...');

      // Inject default public WebSocket trackers for WebTorrent.
      // This allows magnet links with only UDP trackers to still attempt 
      // finding WebRTC peers on the web.
      const opts = {
        announce: [
          'wss://tracker.btorrent.xyz',
          'wss://tracker.openwebtorrent.com',
          'wss://tracker.fastcast.nz'
        ]
      };

      this.client.add(magnetUri, opts, (torrent: any) => {
        console.log(`[LibtorrentModule.web.ts] Torrent added. Name: ${torrent.name}, InfoHash: ${torrent.infoHash}`);

        torrent.on('warning', (err: Error) => {
          console.warn('[LibtorrentModule.web.ts] Torrent warning:', err);
        });
        torrent.on('download', (bytes: number) => {
          console.log(`[LibtorrentModule.web.ts] Downloaded chunk of ${bytes} bytes. Total Progress: ${(torrent.progress * 100).toFixed(2)}%, Speed: ${(torrent.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s`);
          this.emit('onTorrentProgress', {
            progress: torrent.progress * 100,
            state: `Downloading (${(torrent.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s)`
          });
        });

        torrent.on('done', () => {
          console.log('[LibtorrentModule.web.ts] Torrent download DONE event fired!');
          this.emit('onTorrentProgress', { progress: 100, state: 'Finished' });

          // Trigger browser downloads for all files
          torrent.files.forEach((file: any) => {
            file.getBlobURL((err: Error | null, url: string | undefined) => {
              if (err || !url) {
                console.error('Failed to get blob URL', err);
                return;
              }
              const a = document.createElement('a');
              a.download = file.name;
              a.href = url;
              a.textContent = 'Download ' + file.name;
              a.click(); // Trigger native browser save prompt
            });
          });

          resolve('Success');
        });

        torrent.on('error', (err: Error) => {
          console.error('[LibtorrentModule.web.ts] Torrent error event:', err);
          reject(err);
        });
      });

      this.client.on('error', (err: Error) => {
        console.error('[LibtorrentModule.web.ts] WebTorrent client error event:', err);
        reject(err);
      });
    });
  }
};

export default registerWebModule(LibtorrentModule, 'LibtorrentModule');
