import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig';
import { API_ENDPOINTS } from './config';
import Approvals from './components/approvals';
import Slider from './components/Slider';
import loginScreen from './components/loginScreen';
import HomeScreen from './components/homeScreen';
import SignupScreen from './components/signupScreen';
import AddVehicle from './components/addVehicle';
import VehicleApprovals from './components/vehicleApprovals';

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Slider" component={Slider} />
    <AuthStack.Screen name="loginScreen" component={loginScreen} />
    <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
  </AuthStack.Navigator>
);

interface HomeStackScreenProps {
  userData: any; 
}

const HomeStackScreen = ({ userData }: HomeStackScreenProps) => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen">
      {(props) => <HomeScreen {...props} userData={userData} />}
    </HomeStack.Screen>
    <HomeStack.Screen name="Approvals" component={Approvals} />
    <HomeStack.Screen name="VehicleApprovals" component={VehicleApprovals} />
    <HomeStack.Screen name="AddVehicle" component={AddVehicle} />
  </HomeStack.Navigator>
);

function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const response = await fetch(API_ENDPOINTS.getUser(user.uid));
          const data = await response.json();
          console.log("User data fetched in App:", data);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="HomeStack">
            {() => <HomeStackScreen userData={userData} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStackScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;