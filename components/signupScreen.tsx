import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { API_ENDPOINTS } from '../config';

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Name, setName] = useState("");
  const [Organization, setOrganization] = useState("");
  const [RegistrationNumber, setRegistrationNumber] = useState("");
  const [MobileNumber, setMobileNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(false);
  const [Vehicle, setVehicle] = useState([]);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    const auth = getAuth();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Error", (error as any).message);
      return;
    }

    const uid = auth.currentUser?.uid;

    if (!email || !password || !Name || !Organization || !RegistrationNumber || !MobileNumber) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          name: Name,
          mobileNumber: MobileNumber,
          organization: Organization,
          vehicle: Vehicle,
          admin: false,
          registrationNumber: RegistrationNumber,
          email,
          status,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "User registered successfully!");
      } else {
        Alert.alert("Error", data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to send data to the server.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.title}>Create an Account</Text>

          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#8899A6" value={Name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Organization Name" placeholderTextColor="#8899A6" value={Organization} onChangeText={setOrganization} />
          <TextInput style={styles.input} placeholder="Registration Number" placeholderTextColor="#8899A6" value={RegistrationNumber} onChangeText={setRegistrationNumber} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Mobile Number" placeholderTextColor="#8899A6" value={MobileNumber} onChangeText={setMobileNumber} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8899A6" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8899A6" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#8899A6" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Send data for verification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#0A0F1F",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  form: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#1F2937",
    color: "#ffffff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  button: {
    backgroundColor: "#00B8D4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#00B8D4",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
