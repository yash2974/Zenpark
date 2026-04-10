import React, {  useEffect } from "react";
import { Button, View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS } from '../config';

interface Approval {
  _id: string;
  name: string;
  email: string;
  organization: string;
  mobileNumber: string;
  registrationNumber: string;
}




export default function Approvals() {
  
const [loading, setLoading] = React.useState(true);
const [approvals, setApprovals] = React.useState<Approval[]>([]);
const [refreshing, setRefreshing] = React.useState(false);

const fetchApprovals = async () => {
  try {
    setRefreshing(true);
    const response = await fetch(API_ENDPOINTS.pendingApprovals(1, 10));
    const json = await response.json();
    setApprovals(json.approvals);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    Alert.alert("Error", "Failed to fetch approvals");
  } finally {
    setRefreshing(false);
  }
  
};

const handleAccept = (id: string) => async () => {
  try {
    const response = await fetch(API_ENDPOINTS.approveUser(id), {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      Alert.alert("Error", errorData.detail || "Failed to approve user");
      return;
    }

    Alert.alert("Success", "User approved successfully");
    fetchApprovals(); // refresh list
  } catch (error) {
    console.error("Approval error:", error);
    Alert.alert("Error", "Something went wrong");
  }


};

const handleReject = (id: string) => async () => {
  try {
    const response = await fetch(API_ENDPOINTS.rejectUser(id), {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      Alert.alert("Error", errorData.detail || "Failed to reject user");
      return;
    }

    Alert.alert("Success", "User rejected successfully");
    fetchApprovals(); // refresh list
  } catch (error) {
    console.error("Approval error:", error);
    Alert.alert("Error", "Something went wrong");
  }


};

  
  useEffect(() => {
    fetchApprovals();  
  },[]);

  console.log("State Approvals:", approvals);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="people" size={28} color="#F59E0B" />
          <Text style={styles.headerTitle}>User Approvals</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {loading ? "Loading..." : `${approvals.length} pending requests`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B8D4" />
          <Text style={styles.loadingText}>Loading approvals...</Text>
        </View>
      ) : approvals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={80} color="#10B981" />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>No pending user approvals at the moment</Text>
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
              {/* User Info */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {item.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.organization}>{item.organization}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="mail" size={16} color="#8A9BA8" />
                  <Text style={styles.detailText}>{item.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="call" size={16} color="#8A9BA8" />
                  <Text style={styles.detailText}>{item.mobileNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="card" size={16} color="#8A9BA8" />
                  <Text style={styles.detailText}>{item.registrationNumber}</Text>
                </View>
              </View>
  
              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAccept(item._id)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Accept</Text>
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
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  organization: {
    fontSize: 14,
    color: "#8A9BA8",
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: "#D1D5DB",
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '500',
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
  noDataText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    opacity: 0.8,
  },
  
});
