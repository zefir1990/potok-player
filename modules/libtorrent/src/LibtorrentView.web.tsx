import * as React from 'react';

import { LibtorrentViewProps } from './Libtorrent.types';

export default function LibtorrentView(props: LibtorrentViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
