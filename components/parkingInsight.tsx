import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WS_BASE_URL } from '../config';

interface ParkingData {
  total_spots: number;
  occupied_spots: number;
  available_spots: number;
  occupancy_rate: number;
  last_updated: string;
}

const ParkingInsight: React.FC = () => {
  const [parkingData, setParkingData] = useState<ParkingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(`${WS_BASE_URL}/ws/parking-status`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🚗 Parking status WebSocket connected');
        setIsConnected(true);
        setError(null);
        setLoading(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📊 Received parking update:', data);
          setParkingData(data);
          setError(null);
        } catch (err) {
          console.error('Error parsing parking data:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting in 5s...');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setError('Unable to connect');
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    
    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  if (loading && !parkingData) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#00B8D4" />
          <Text style={styles.loadingText}>Connecting to parking system...</Text>
        </View>
      </View>
    );
  }

  if (error && !parkingData) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.errorCard]}>
          <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={connectWebSocket}>
            <Text style={styles.retryButtonText}>Reconnect</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getAvailabilityColor = (rate: number) => {
    if (rate < 50) return '#10B981'; // Green
    if (rate < 80) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getStatusText = (available: number) => {
    if (available === 0) return 'Full';
    if (available < 10) return 'Limited';
    if (available < 30) return 'Filling Up';
    return 'Available';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="car-sport" size={28} color="#00B8D4" />
            <Text style={styles.title}>Live Parking Status</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={[styles.liveBadge, !isConnected && styles.disconnectedBadge]}>
              <View style={[styles.liveIndicator, !isConnected && styles.disconnectedIndicator]} />
              <Text style={[styles.liveText, !isConnected && styles.disconnectedText]}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </Text>
            </View>
          </Animated.View>
        </View>

        {parkingData && (
          <>
            {/* Main Stats */}
            <View style={styles.mainStats}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{parkingData.available_spots}</Text>
                <Text style={styles.statLabel}>Available</Text>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                  {parkingData.occupied_spots}
                </Text>
                <Text style={styles.statLabel}>Occupied</Text>
                <Ionicons name="car" size={24} color="#EF4444" />
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${parkingData.occupancy_rate}%`,
                      backgroundColor: getAvailabilityColor(parkingData.occupancy_rate),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {parkingData.occupancy_rate.toFixed(1)}% Occupied
              </Text>
            </View>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    getAvailabilityColor(parkingData.occupancy_rate) + '20',
                  borderColor: getAvailabilityColor(parkingData.occupancy_rate),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getAvailabilityColor(parkingData.occupancy_rate) },
                ]}
              >
                {getStatusText(parkingData.available_spots)}
              </Text>
            </View>

            {/* Additional Info */}
            <View style={styles.footer}>
              <View style={styles.infoRow}>
                <Ionicons name="grid-outline" size={16} color="#8A9BA8" />
                <Text style={styles.infoText}>
                  Total Capacity: {parkingData.total_spots} spots
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="analytics-outline" size={16} color="#8A9BA8" />
                <Text style={styles.infoText}>
                  Based on unique plate detections
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#8A9BA8" />
                <Text style={styles.infoText}>
                  Updated: {new Date(parkingData.last_updated).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  disconnectedBadge: {
    borderColor: '#6B7280',
  },
  disconnectedIndicator: {
    backgroundColor: '#6B7280',
  },
  disconnectedText: {
    color: '#6B7280',
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8A9BA8',
    marginBottom: 8,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    backgroundColor: '#374151',
    marginHorizontal: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#1F2937',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: '#8A9BA8',
    textAlign: 'center',
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#8A9BA8',
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingText: {
    color: '#8A9BA8',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00B8D4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ParkingInsight;
