import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from "react-native";
import { auth } from '../firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ParkingInsight from './parkingInsight';
import { API_ENDPOINTS } from '../config';

const user = auth.currentUser;
if (user) {
  console.log("User ID:", user.uid);  
} else {
  console.log("No user is signed in");
}

export default function HomeContent({ navigation }: { navigation: any }) {
  const [stats, setStats] = useState({
    pendingUsers: 0,
    pendingVehicles: 0,
    totalDetections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch pending approvals count
      const userResponse = await fetch(API_ENDPOINTS.pendingApprovals(1, 1));
      const userData = await userResponse.json();
      
      // Fetch pending vehicle approvals count
      const vehicleResponse = await fetch(API_ENDPOINTS.unapprovedVehicles);
      const vehicleData = await vehicleResponse.json();
      
      setStats({
        pendingUsers: userData.total || 0,
        pendingVehicles: vehicleData.vehicles?.length || 0,
        totalDetections: 0, // This could be fetched from YOLO service
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentWrapper}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={require('../images/image.png')} style={styles.logo} />
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Zenpark Management</Text>
      </View>

      {/* Live Parking Status */}
      <ParkingInsight />

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
            <Ionicons name="person-add" size={32} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.pendingUsers}</Text>
            <Text style={styles.statLabel}>Pending Users</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
            <Ionicons name="car" size={32} color="#8B5CF6" />
            <Text style={styles.statValue}>{stats.pendingVehicles}</Text>
            <Text style={styles.statLabel}>Pending Vehicles</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]} 
          onPress={() => navigation.navigate('Approvals')}
        >
          <View style={styles.actionContent}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="people" size={28} color="#F59E0B" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>User Approvals</Text>
                <Text style={styles.actionDescription}>Review pending user requests</Text>
              </View>
            </View>
            {stats.pendingUsers > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pendingUsers}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={24} color="#8A9BA8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryAction]} 
          onPress={() => navigation.navigate('VehicleApprovals')}
        >
          <View style={styles.actionContent}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="car-sport" size={28} color="#8B5CF6" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Vehicle Approvals</Text>
                <Text style={styles.actionDescription}>Approve registered vehicles</Text>
              </View>
            </View>
            {stats.pendingVehicles > 0 && (
              <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.badgeText}>{stats.pendingVehicles}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={24} color="#8A9BA8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.tertiaryAction]} 
          onPress={() => Alert.alert("QR Code Scanner", "This feature is under development.")}
        >
          <View style={styles.actionContent}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#00B8D420' }]}>
                <Ionicons name="qr-code" size={28} color="#00B8D4" />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Scan QR Code</Text>
                <Text style={styles.actionDescription}>Manual entry verification</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#8A9BA8" />
          </View>
        </TouchableOpacity>
      </View>

      {/* System Status */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>YOLO Detection System</Text>
            </View>
            <Text style={styles.statusActive}>Active</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Database Connection</Text>
            </View>
            <Text style={styles.statusActive}>Connected</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Real-time Updates</Text>
            </View>
            <Text style={styles.statusActive}>Live</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
  },
  contentWrapper: {
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#111827',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A9BA8',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8A9BA8',
    textAlign: 'center',
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
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
  primaryAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  secondaryAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  tertiaryAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#00B8D4',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  actionDescription: {
    fontSize: 13,
    color: '#8A9BA8',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statusSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  statusText: {
    fontSize: 15,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  statusActive: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
  },
});
