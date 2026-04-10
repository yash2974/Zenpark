import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS } from '../config';

interface VehicleApproval {
  _id: string;
  uid: string;
  vehicle_number: string;
  rc_number: string;
  license_number: string;
  vehicle_type: string;
}

export default function VehicleApprovals() {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<VehicleApproval[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApprovals = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(API_ENDPOINTS.unapprovedVehicles);
      const json = await response.json();
      setApprovals(json.vehicles || []);
      console.log("Vehicle approvals fetched:", json.vehicles);
    } catch (error) {
      console.error("Error fetching vehicle approvals:", error);
      Alert.alert("Error", "Failed to load vehicle approvals.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = (id: string) => async () => {
    try {
      const response = await fetch(API_ENDPOINTS.approveVehicle(id), {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to approve vehicle");
        return;
      }

      Alert.alert("Success", "Vehicle approved successfully");
      fetchApprovals(); // refresh list
    } catch (error) {
      console.error("Vehicle approval error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleReject = (id: string) => async () => {
    try {
      const response = await fetch(API_ENDPOINTS.rejectVehicle(id), {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to reject vehicle");
        return;
      }

      Alert.alert("Success", "Vehicle rejected successfully");
      fetchApprovals(); // refresh list
    } catch (error) {
      console.error("Vehicle rejection error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const getVehicleIcon = (type: string) => {
    if (type === 'twowheeler') return 'bicycle';
    if (type === 'fourwheeler') return 'car-sport';
    return 'car';
  };

  const getVehicleLabel = (type: string) => {
    if (type === 'twowheeler') return '2 Wheeler';
    if (type === 'fourwheeler') return '4 Wheeler';
    return type;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="car-sport" size={28} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Vehicle Approvals</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {loading ? "Loading..." : `${approvals.length} pending requests`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B8D4" />
          <Text style={styles.loadingText}>Loading vehicle approvals...</Text>
        </View>
      ) : approvals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={80} color="#10B981" />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>No pending vehicle approvals at the moment</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchApprovals}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={approvals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Vehicle Header */}
              <View style={styles.cardHeader}>
                <View style={styles.vehicleIconContainer}>
                  <Ionicons 
                    name={getVehicleIcon(item.vehicle_type)} 
                    size={32} 
                    color="#8B5CF6" 
                  />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleNumber}>{item.vehicle_number}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{getVehicleLabel(item.vehicle_type)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="document-text" size={16} color="#8A9BA8" />
                  <Text style={styles.detailLabel}>RC Number:</Text>
                  <Text style={styles.detailValue}>{item.rc_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="card" size={16} color="#8A9BA8" />
                  <Text style={styles.detailLabel}>License:</Text>
                  <Text style={styles.detailValue}>{item.license_number}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleApprove(item._id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={handleReject(item._id)}
                >
                  <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={fetchApprovals}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1F",
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: '#8A9BA8',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#8A9BA8',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8B5CF620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  typeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#8A9BA8',
    fontSize: 14,
    marginLeft: 12,
    marginRight: 8,
    fontWeight: '600',
  },
  detailValue: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
