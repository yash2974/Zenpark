import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { API_ENDPOINTS } from '../config';

interface PlateData {
  id: number;
  plate: string;
  confidence: number;
  timestamp: string;
  approved: boolean; // ✅ Add this
}


export default function PlateDetection() {
  const [plates, setPlates] = useState<PlateData[]>([]);
  const [wsActive, setWsActive] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    const ws = new WebSocket(API_ENDPOINTS.plateDetection);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data: PlateData = JSON.parse(event.data);
      setPlates((prev) => [data, ...prev]);
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    if (wsActive) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [wsActive]);

  const handleReload = () => {
    setPlates([]);            // Clear list
    setWsActive(false);       // Disconnect
    setTimeout(() => setWsActive(true), 500); // Reconnect after a short pause
  };

  const renderItem = ({ item }: { item: PlateData }) => (
    <View style={styles.card}>
      <Text style={styles.label}>License Plate</Text>
      <Text style={[
        styles.value,
        { color: item.approved ? '#3B82F6' : '#EF4444' } // 🔵 blue if approved, 🔴 red otherwise
      ]}>
        {item.approved?item.plate:item.plate+" (Not Approved)"}
      </Text>
  
      <Text style={styles.label}>Confidence</Text>
      <Text style={styles.value}>{item.confidence.toFixed(2)}</Text>
  
      <Text style={styles.label}>Detected At</Text>
      <Text style={styles.value}>{item.timestamp}</Text>
    </View>
  );
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Live Plate Detections</Text>

      <TouchableOpacity style={styles.button} onPress={handleReload}>
        <Text style={styles.buttonText}>Reload</Text>
      </TouchableOpacity>

      <FlatList
        data={plates}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 10,
    letterSpacing: 0.8,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  value: {
    fontSize: 16,
    color: '#F0F9FF',
    fontWeight: '500',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00B8D4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00B8D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
