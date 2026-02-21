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

        const getFiles = () => {
          if (!torrent.files) return [];
          return torrent.files.map((f: any) => ({
            name: f.name,
            length: f.length,
            downloaded: f.downloaded
          }));
        };

        torrent.on('warning', (err: Error) => {
          console.warn('[LibtorrentModule.web.ts] Torrent warning:', err);
        });
        torrent.on('download', (bytes: number) => {
          console.log(`[LibtorrentModule.web.ts] Downloaded chunk of ${bytes} bytes. Total Progress: ${(torrent.progress * 100).toFixed(2)}%, Speed: ${(torrent.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s`);
          this.emit('onTorrentProgress', {
            progress: torrent.progress * 100,
            state: `Downloading (${(torrent.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s)`,
            files: getFiles()
          });
        });

        torrent.on('done', () => {
          console.log('[LibtorrentModule.web.ts] Torrent download DONE event fired!');
          this.emit('onTorrentProgress', { progress: 100, state: 'Finished', files: getFiles() });

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

  async stop(): Promise<string> {
    if (this.client) {
      console.log('[LibtorrentModule.web.ts] Stopping WebTorrent and destroying client...');
      this.client.destroy((err: Error | undefined) => {
        if (err) console.error('Error destroying WebTorrent client:', err);
      });
      this.client = null; // nullify to allow re-initialization on next download

      this.emit('onTorrentProgress', { progress: 0, state: 'Stopped' });
    }
    return 'Stopped';
  }

  async getFileUrl(fileName: string): Promise<string> {
    if (!this.client || this.client.torrents.length === 0) {
      throw new Error("No active torrent");
    }
    const torrent = this.client.torrents[0];
    const file = torrent.files.find((f: any) => f.name === fileName);
    if (!file) throw new Error("File not found");

    return new Promise((resolve, reject) => {
      file.getBlobURL((err: Error | null, url: string | undefined) => {
        if (err || !url) {
          reject(err || new Error("Failed to create blob URL"));
        } else {
          resolve(url);
        }
      });
    });
  }

  async streamToElement(fileName: string, elementId: string): Promise<string> {
    if (!this.client || this.client.torrents.length === 0) {
      throw new Error("No active torrent");
    }
    const torrent = this.client.torrents[0];
    const file = torrent.files.find((f: any) => f.name === fileName);
    if (!file) throw new Error("File not found");

    return new Promise((resolve, reject) => {
      try {
        console.log(`[LibtorrentModule.web.ts] Wiring stream for ${fileName} to #${elementId}`);
        // Polyfill process.nextTick and setImmediate for readable-stream in render-media/videostream
        if (typeof process === 'undefined') {
          (window as any).process = { nextTick: (cb: any) => setTimeout(cb, 0) };
        } else if (!process.nextTick) {
          (process as any).nextTick = (cb: any) => setTimeout(cb, 0);
        }
        if (typeof setImmediate === 'undefined') {
          (window as any).setImmediate = (cb: any) => setTimeout(cb, 0);
        }

        const renderMedia = require('render-media');
        const elem = document.getElementById(elementId);
        if (!elem) throw new Error(`HTML element #${elementId} not found`);

        renderMedia.render(file, elem, { autoplay: true, controls: true }, (err: Error | null) => {
          if (err) {
            console.error('[LibtorrentModule.web.ts] Stream render error:', err);
            reject(err);
          } else {
            console.log(`[LibtorrentModule.web.ts] Stream wired to #${elementId} successfully`);
            resolve("Stream started");
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
};

export default registerWebModule(LibtorrentModule, 'LibtorrentModule');
