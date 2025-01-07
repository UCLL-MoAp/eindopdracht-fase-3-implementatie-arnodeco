import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../../firebase';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen for sign-in / sign-out changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // If no user, you can redirect to /login
      if (!currentUser) {
        router.replace('/signin');
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Optional: show a loading screen while we check auth
  if (loading) {
    return (
      // Could be a splash or activity indicator
      <></>
    );
  }

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: 'white',
      tabBarStyle: {
        height: 70 + insets.bottom,
        backgroundColor: "black",
        borderColor: "transparent"
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'User',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
