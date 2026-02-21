export type TorrentProgressEvent = {
  progress: number;
  state: string;
  files?: Array<{ name: string; length: number; downloaded: number; url?: string; }>;
};

export type LibtorrentModuleEvents = {
  onTorrentProgress: (event: TorrentProgressEvent) => void;
};
