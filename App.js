import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import * as FileSystem from 'expo-file-system';
import TorrentApi from './src/api/TorrentApi';

export default function App() {
  const [status, setStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [files, setFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);

  const [magnetLink, setMagnetLink] = useState('magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent');

  useEffect(() => {
    // Listen for torrent progress using the new API abstraction
    const subscription = TorrentApi.addProgressListener((event) => {
      console.log(`[App.js] Torrent Progress Event: State -> ${event.state}, Progress -> ${event.progress.toFixed(2)}%`);
      setStatus(event.state);
      setProgress(event.progress);
      if (event.files) {
        setFiles(event.files);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDownload = async () => {
    try {
      setStatus('Starting...');
      setIsDownloading(true);

      const savePath = FileSystem.documentDirectory + 'downloads';
      console.log('Saving to:', savePath);
      console.log(`[App.js] Triggering download using TorrentApi for magnet: ${magnetLink}`);

      await TorrentApi.download(magnetLink, savePath);
      console.log('[App.js] TorrentApi.download() promise resolved successfully!');
      setIsDownloading(false);
    } catch (e) {
      setStatus('Error: ' + e.message);
      setIsDownloading(false);
    }
  };

  const handleStop = async () => {
    try {
      await TorrentApi.stop();
      setIsDownloading(false);
      setStatus('Stopped');
      setFiles([]);
      setVideoUrl(null);
    } catch (e) {
      console.error(e);
      setStatus('Error stopping: ' + e.message);
    }
  };

  const handlePlay = async (file) => {
    if (file.downloaded < file.length) {
      alert(`Please wait for ${file.name} to finish downloading first!`);
      return;
    }
    try {
      const url = await TorrentApi.getFileUrl(file.name);
      setVideoUrl(url);
    } catch (err) {
      alert("Failed to load video: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>
        React Native libtorrent Test
      </Text>

      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.status}>Progress: {progress.toFixed(2)}%</Text>

      <View style={{ marginTop: 20 }}>
        <TextInput
          style={styles.input}
          onChangeText={setMagnetLink}
          value={magnetLink}
          placeholder="Enter magnet link..."
          editable={!isDownloading}
        />
        {isDownloading ? (
          <Button title="Stop Download" onPress={handleStop} color="red" />
        ) : (
          <Button title="Start Download" onPress={handleDownload} />
        )}
      </View>

      {files.length > 0 && (
        <View style={styles.filesContainer}>
          <Text style={styles.filesTitle}>Torrent Contents:</Text>
          {files.map((file, i) => (
            <View key={i} style={styles.fileRow}>
              <Text style={styles.fileItem}>
                📄 {file.name} - {(file.downloaded / 1024 / 1024).toFixed(2)} MB / {(file.length / 1024 / 1024).toFixed(2)} MB
              </Text>
              {file.name.endsWith('.mp4') && (
                <Button
                  title="Play"
                  onPress={() => handlePlay(file)}
                  disabled={file.downloaded < file.length}
                />
              )}
            </View>
          ))}
        </View>
      )}

      {videoUrl && (
        <View style={styles.videoContainer}>
          <video src={videoUrl} controls autoPlay style={{ width: '100%', maxWidth: 500 }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  status: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 4
  },
  filesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  filesTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4
  },
  fileItem: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  videoContainer: {
    marginTop: 20,
    alignItems: 'center',
  }
});
