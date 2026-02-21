export type TorrentProgressEvent = {
  progress: number;
  state: string;
};

export type LibtorrentModuleEvents = {
  onTorrentProgress: (event: TorrentProgressEvent) => void;
};
