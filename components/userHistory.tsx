import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  TouchableOpacity 
} from "react-native";
import { getAuth } from "firebase/auth";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS } from '../config';

interface HistoryEntry {
  id: number;
  plate: string;
  timestamp: string;
  approved: boolean;
  confidence: number;
}

export default function UserHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const fetchHistory = async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      // Fetch user's vehicle plates from backend
      const userResponse = await fetch(API_ENDPOINTS.getUser(user.uid));
      const userData = await userResponse.json();
      
      if (!userData.vehicle || userData.vehicle.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Fetch history for user's vehicles
      const historyResponse = await fetch(
        API_ENDPOINTS.userHistory(user.uid)
      );
      
      if (!historyResponse.ok) {
        throw new Error("Failed to fetch history");
      }
      
      const historyData = await historyResponse.json();
      setHistory(historyData.history || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Unable to load history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.plateContainer}>
          <Ionicons 
            name={item.approved ? "checkmark-circle" : "close-circle"} 
            size={24} 
            color={item.approved ? "#10B981" : "#EF4444"} 
          />
          <Text style={styles.plateNumber}>{item.plate}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.approved ? '#10B98120' : '#EF444420' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.approved ? '#10B981' : '#EF4444' }
          ]}>
            {item.approved ? 'Approved' : 'Unapproved'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#8A9BA8" />
          <Text style={styles.infoText}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="analytics-outline" size={16} color="#8A9BA8" />
          <Text style={styles.infoText}>
            Confidence: {(item.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00B8D4" />
        <Text style={styles.loadingText}>Loading your parking history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={80} color="#8A9BA8" />
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptyDescription}>
          Your parking entry history will appear here once you start using the parking facility
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchHistory}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="time" size={28} color="#00B8D4" />
          <Text style={styles.headerTitle}>Parking History</Text>
        </View>
        <Text style={styles.headerSubtitle}>{history.length} entries</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00B8D4"]}
            tintColor="#00B8D4"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1F',
    paddingHorizontal: 40,
  },
  header: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A9BA8',
    marginLeft: 40,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#8A9BA8',
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingText: {
    color: '#8A9BA8',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#8A9BA8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#00B8D4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#00B8D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B8D4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});