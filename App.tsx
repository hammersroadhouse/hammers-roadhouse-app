import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import PlayerScreen from "./screens/PlayerScreen";
import { ChatScreen } from "./screens/ChatScreen";
import ListenersScreen from "./screens/ListenersScreen";
import RecentlyPlayedScreen from "./screens/RecentlyPlayedScreen";
import { RequestScreen } from "./screens/RequestScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { AuthProvider, useAuthState } from "./hooks/authStore";
import { theme } from './lib/theme';
import { useState } from 'react';
import ProfileScreen from "./screens/ProfileScreen";
import { useNotifications } from "./hooks/useNotifications";

const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.COLORS.surface,
          borderTopColor: theme.COLORS.outline,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.COLORS.primary,
        tabBarInactiveTintColor: theme.COLORS.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Live" 
        component={PlayerScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="radio" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Listeners" 
        component={ListenersScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Request" 
        component={RequestScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="music-note-plus" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Played" 
        component={RecentlyPlayedScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  const { user, login } = useAuthState();
  const [showRegister, setShowRegister] = useState(false);

  // Enable push notifications
  useNotifications();

  if (!user) {
    return showRegister ? (
      <RegisterScreen
        onRegister={(userId, firstName, username, email) => login(userId, firstName, username, email)}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginScreen
        onLogin={(userId, firstName, username, email) => login(userId, firstName, username, email)}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return <MainTabs />;
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
  },
  loadingText: {
    ...theme.TYPOGRAPHY.body,
    color: theme.COLORS.onBackground,
    marginTop: theme.SPACING.md,
  },
});