import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert("Error", "No user is logged in or email is not available.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/user"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred.");
      }
      console.error("Error updating password:", error);
    }
  };

  return (
    <SafeAreaView className="bg-pink-950 h-full p-5">
      <TouchableOpacity onPress={() => router.back()}>
        <ChevronLeft color="white" size={32} style={{ margin: 15 }} />
      </TouchableOpacity>

      <View className="bg-customBg p-6 rounded-lg mt-5">
        <Text className="text-white text-2xl font-semibold mb-5 text-center">
          Change Password
        </Text>

        {/* Current Password */}
        <View className="mb-6">
          <Text className="text-zinc-500">Current Password</Text>
          <TextInput
            secureTextEntry
            className="bg-transparent text-white text-xl rounded-lg pb-2 mb-2 border-b-2 border-zinc-500"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* New Password */}
        <View className="mb-6">
          <Text className="text-zinc-500">New Password</Text>
          <TextInput
            secureTextEntry
            className="bg-transparent text-white text-xl rounded-lg pb-2 mb-2 border-b-2 border-zinc-500"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Confirm Password */}
        <View className="mb-6">
          <Text className="text-zinc-500">Confirm Password</Text>
          <TextInput
            secureTextEntry
            className="bg-transparent text-white text-xl rounded-lg pb-2 mb-2 border-b-2 border-zinc-500"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handlePasswordChange}
          className="bg-pink-700 rounded-lg py-3 mt-5"
        >
          <Text className="text-center text-white font-semibold text-lg">
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;
