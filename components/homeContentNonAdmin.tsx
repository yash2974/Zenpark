import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import ParkingInsight from './parkingInsight';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeContentNonAdmin = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require('../images/dark.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to Zenpark</Text>
        <Text style={styles.subtitle}>Your Smart Parking Solution</Text>
      </View>

      {/* Live Parking Availability */}
      <ParkingInsight />

      {/* Quick Info Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color="#10B981" />
          </View>
          <Text style={styles.infoTitle}>Secure Parking</Text>
          <Text style={styles.infoDescription}>
            Your vehicle is protected with 24/7 surveillance
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={32} color="#FFD700" />
          </View>
          <Text style={styles.infoTitle}>Quick Entry</Text>
          <Text style={styles.infoDescription}>
            Automated license plate recognition for fast access
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={32} color="#00B8D4" />
          </View>
          <Text style={styles.infoTitle}>Real-Time Updates</Text>
          <Text style={styles.infoDescription}>
            Live parking availability at your fingertips
          </Text>
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={24} color="#F59E0B" />
          <Text style={styles.tipsTitle}>Parking Tips</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Ensure your vehicle is registered for quick approval
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Check parking availability before arrival to save time
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Keep your license plate clean for better detection
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#111827',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A9BA8',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  infoDescription: {
    fontSize: 14,
    color: '#8A9BA8',
    lineHeight: 20,
    fontWeight: '500',
  },
  tipsSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  tipCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00B8D4',
  },
  tipText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default HomeContentNonAdmin;
