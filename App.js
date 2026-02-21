import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import * as FileSystem from 'expo-file-system';
import TorrentApi from './src/api/TorrentApi';

export default function App() {
  const [status, setStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);

  const [magnetLink, setMagnetLink] = useState('magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big%20Buck%20Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337');

  useEffect(() => {
    // Listen for torrent progress using the new API abstraction
    const subscription = TorrentApi.addProgressListener((event) => {
      console.log(`[App.js] Torrent Progress Event: State -> ${event.state}, Progress -> ${event.progress.toFixed(2)}%`);
      setStatus(event.state);
      setProgress(event.progress);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDownload = async () => {
    try {
      setStatus('Starting...');

      const savePath = FileSystem.documentDirectory + 'downloads';
      console.log('Saving to:', savePath);
      console.log(`[App.js] Triggering download using TorrentApi for magnet: ${magnetLink}`);

      await TorrentApi.download(magnetLink, savePath);
      console.log('[App.js] TorrentApi.download() promise resolved successfully!');
    } catch (e) {
      setStatus('Error: ' + e.message);
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
        />
        <Button title="Start Download" onPress={handleDownload} />
      </View>
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
  }
});
