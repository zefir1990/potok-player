// Reexport the native module. On web, it will be resolved to LibtorrentModule.web.ts
// and on native platforms to LibtorrentModule.ts
export { default } from './src/LibtorrentModule';
export { default as LibtorrentView } from './src/LibtorrentView';
export * from  './src/Libtorrent.types';
