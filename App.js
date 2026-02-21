import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import LibtorrentModule from './modules/libtorrent';
import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';
import * as FileSystem from 'expo-file-system';

// The module's typed events can be listened to via an EventEmitter
const emitter = new EventEmitter(LibtorrentModule ?? NativeModulesProxy.Libtorrent);

export default function App() {
  const [status, setStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Listen for torrent progress
    const subscription = emitter.addListener('onTorrentProgress', (event) => {
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
      // A small test magnet link (e.g., Ubuntu or a public domain track)
      // Here using Ubuntu 22.04 Desktop as a famous reliable test seed:
      const magnet = 'magnet:?xt=urn:btih:209c8226b299b308beaf2b9cd3fb49212dbd13ec&dn=ubuntu-22.04.3-desktop-amd64.iso';

      const savePath = FileSystem.documentDirectory + 'downloads';
      console.log('Saving to:', savePath);

      await LibtorrentModule.download(magnet, savePath);
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
  }
});
