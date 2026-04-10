import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { getAuth } from 'firebase/auth';
import { API_ENDPOINTS } from '../config';
const auth = getAuth();

const type = [
    { label: '4 Wheeler', value: 'fourwheeler' },
    { label: '2 Wheeler', value: 'twowheeler' },
  ];
const AddVehicle = () => {
    const uid = auth.currentUser?.uid;
    const navigation = useNavigation();

    const [vehicleNumber, setVehicleNumber] = useState('');
    const [rcNumber, setRcNumber] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('');


    const handleSubmit = async () => {
        console.log(uid)
    if (!vehicleNumber || !rcNumber || !licenseNumber || !vehicleType) {
      Alert.alert('Please fill all fields');
      return;
    }
  
    try {
      const response = await fetch(API_ENDPOINTS.registerVehicle(uid!), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_number: vehicleNumber,
          rc_number: rcNumber,
          license_number: licenseNumber,
          vehicle_type: vehicleType,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        Alert.alert(data.detail || 'Registration failed');
        return;
      }
  
      Alert.alert('Vehicle sent for approval successfully');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Network error');
    }
  };
  
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Vehicle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. DL01AB1234"
          placeholderTextColor="#999"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RC Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter RC Number"
          placeholderTextColor="#999"
          value={rcNumber}
          onChangeText={setRcNumber}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Driver’s License</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter License Number"
          placeholderTextColor="#999"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />
      </View>

      <View style={styles.inputGroup}>
      <Dropdown
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        data={type}
        labelField="label"
        valueField="value"
        placeholder="Select Vehicle Type"
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        value={vehicleType}
        onChange={(item) => setVehicleType(item.value)}

        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Vehicle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1F',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00B8D4',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00B8D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dropdown: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
    color: '#fff',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  
  dropdownContainer: {
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 0,
    paddingVertical: 4,
  },
  
  placeholderStyle: {
    color: '#888888',
    fontSize: 16,
  },
  
  selectedTextStyle: {
    color: '#ffffff',
    fontSize: 16,
  },
  
  itemTextStyle: {
    color: '#ffffff',
    fontSize: 15,
  },
  
  
});

export default AddVehicle;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

