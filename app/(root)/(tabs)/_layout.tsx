import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Slot, Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../firebase";
import { Platform, TouchableOpacity, View, Text, Image } from "react-native";
import { getAvatarUrl } from "@/app/api/userInfoService";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const currentUser = auth.currentUser;
  const [avatarName, setAvatarName] = useState<string>(
    currentUser?.photoURL || "default"
  );

  useEffect(() => {
    // Listen for sign-in / sign-out changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // If no user, redirect to /login
      if (!currentUser) {
        router.replace("/signin");
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (Platform.OS === "web") {
    return (
      <>
        {/* Navbar */}
        <View className="flex-row items-center justify-between h-16 bg-black px-7 py-12">
          {/* Left Section: Logo and Navigation Items */}
          <View className="flex-row items-center space-x-10">
            <TouchableOpacity onPress={() => router.push("/")}>
              <Image
                source={require("../../../assets/images/logo-rerun.png")}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/list")}>
              <FontAwesome name="list" size={36} color="white" />
              <Text className="text-white">List</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/friends")}>
              <FontAwesome name="users" size={36} color="white" />
              <Text className="text-white">Friends</Text>
            </TouchableOpacity>
          </View>

          {/* Right Section: Search Icon */}
          <TouchableOpacity className="flex items-center" onPress={() => router.push("/user")}>

            <Image
              source={getAvatarUrl(avatarName)}
              style={{ width: 50, height: 50 }}
              className="rounded-full"
              resizeMode="contain"
            />
            <Text className="text-white">User</Text>
          </TouchableOpacity>
        </View>

        {/* Page Content */}
        <View className="flex-1">
          <Slot />
        </View>
      </>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarStyle: {
          height: 70 + insets.bottom,
          backgroundColor: "black",
          borderColor: "transparent",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../../assets/images/rerun_small.png")}
              className="w-8 h-8"
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "List",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="users" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "User",
          tabBarIcon: ({ }) => (
            <Image
              source={getAvatarUrl(avatarName)}
              className="w-9 h-9 rounded-full"
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
