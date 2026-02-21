export type TorrentProgressEvent = {
  progress: number;
  state: string;
  files?: Array<{ name: string; length: number; downloaded: number; }>;
};

export type LibtorrentModuleEvents = {
  onTorrentProgress: (event: TorrentProgressEvent) => void;
};
