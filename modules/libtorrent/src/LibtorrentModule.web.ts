import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './Libtorrent.types';

type LibtorrentModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class LibtorrentModule extends NativeModule<LibtorrentModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(LibtorrentModule, 'LibtorrentModule');
