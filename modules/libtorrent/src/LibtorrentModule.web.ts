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
      this.emit('onTorrentProgress', { progress: 0, state: 'Starting WebTorrent...' });

      this.client.add(magnetUri, (torrent: any) => {
        torrent.on('download', (bytes: number) => {
          this.emit('onTorrentProgress', {
            progress: torrent.progress * 100,
            state: `Downloading (${(torrent.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s)`
          });
        });

        torrent.on('done', () => {
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
          reject(err);
        });
      });

      this.client.on('error', (err: Error) => {
        reject(err);
      });
    });
  }
};

export default registerWebModule(LibtorrentModule, 'LibtorrentModule');
