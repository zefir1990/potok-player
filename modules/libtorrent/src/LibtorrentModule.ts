import { NativeModule, requireNativeModule } from 'expo';

import { LibtorrentModuleEvents } from './Libtorrent.types';

declare class LibtorrentModule extends NativeModule<LibtorrentModuleEvents> {
  download(magnetUri: string, savePath: string): Promise<string>;
}

export default requireNativeModule<LibtorrentModule>('Libtorrent');
