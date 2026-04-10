import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeContent from './homeContent';
import Profile from './profile';
import HomeContentNonAdmin from './homeContentNonAdmin';
import PlateDetection from './plateDetection';
import UserHistory from './userHistory';
import { Text } from 'react-native-gesture-handler';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Tab = createBottomTabNavigator();

type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  admin?: boolean;
  [key: string]: any;
};

const ProfileWrapper = ({ userData }: { userData: UserData | null }) => {
  return <Profile userData={userData} />;
};

const HomeScreen = ({ userData }: { userData: UserData | null }) => {
  console.log(userData?.admin)
  const handleSignout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  if (userData?.status==true) {
    if ((userData?.admin)==false) {
      return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';
        
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'History' || route.name === 'Plates') iconName = focused ? 'car' : 'car-outline';
            else iconName = focused ? 'person' : 'person-outline';
        
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: '#0A0F1F',
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 6,
            paddingTop: 4,
          },
          tabBarActiveTintColor: '#00B8D4',
          tabBarInactiveTintColor: '#8A9BA8',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            paddingBottom: 4,
          },
          headerShown: false,
        })}
        
        >
          <Tab.Screen name="Home" component={HomeContentNonAdmin} />
          <Tab.Screen name="History" component={UserHistory} />
          <Tab.Screen name="Profile">
            {() => <ProfileWrapper userData={userData} />}
          </Tab.Screen>
        </Tab.Navigator>
      );
    }
    else{
    return (
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
      
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'History' || route.name === 'Plates') iconName = focused ? 'car' : 'car-outline';
          else iconName = focused ? 'person' : 'person-outline';
      
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#0A0F1F',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#00B8D4',
        tabBarInactiveTintColor: '#8A9BA8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 4,
        },
        headerShown: false,
      })}
      
      >
        <Tab.Screen name="Home" component={HomeContent} />
        <Tab.Screen name="Plates" component={PlateDetection} />
        <Tab.Screen name="Profile">
          {() => <ProfileWrapper userData={userData} />}
        </Tab.Screen>
      </Tab.Navigator>
    );
    }}
  else{
    return (
      <View>
        <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 50 }}>
          Your account is not approved yet. Please contact the admin for more information.

        </Text>
        <TouchableOpacity style={styles.button} onPress={handleSignout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    )
};

}
export default HomeScreen;
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00B8D4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
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
})
