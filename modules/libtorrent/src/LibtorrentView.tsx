import { requireNativeView } from 'expo';
import * as React from 'react';

import { LibtorrentViewProps } from './Libtorrent.types';

const NativeView: React.ComponentType<LibtorrentViewProps> =
  requireNativeView('Libtorrent');

export default function LibtorrentView(props: LibtorrentViewProps) {
  return <NativeView {...props} />;
}
