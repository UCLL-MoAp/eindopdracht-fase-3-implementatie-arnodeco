import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  TextInput as WebTextInput,
} from "react-native";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebase";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import CustomText from "@/components/customText";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isWebAlertVisible, setWebAlertVisible] = useState(false); // Web alert state
  const [webAlertMessage, setWebAlertMessage] = useState(""); // Web alert message

  const handlePasswordChange = async () => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      const errorMsg = "No user is logged in or email is not available.";
      showAlert(errorMsg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const errorMsg = "Passwords do not match.";
      showAlert(errorMsg);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      const successMsg = "Password updated successfully!";
      showAlert(successMsg, true);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An unknown error occurred.";
      showAlert(errorMsg);
    }
  };

  const showAlert = (message: string, isSuccess = false) => {
    if (Platform.OS === "web") {
      // Show custom alert modal for web
      setWebAlertMessage(message);
      setWebAlertVisible(true);
    } else {
      // Native alert for mobile
      Alert.alert(isSuccess ? "Success" : "Error", message, [
        {
          text: "OK",
          onPress: isSuccess ? () => router.replace("/user") : undefined,
        },
      ]);
    }
  };

  return (
    <SafeAreaView className="bg-pink-950 h-full p-5">
      <View
        className={`flex-1 ${
          Platform.OS === "web" ? "px-10 sm:px-20 md:px-40 lg:px-72" : ""
        }`}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="white" size={32} style={{ margin: 15 }} />
        </TouchableOpacity>

        <View className="bg-customBg p-6 rounded-lg mt-5">
          <CustomText className="text-white text-2xl mb-5 text-center">
            Change Password
          </CustomText>

          {/* Current Password */}
          <View className="mb-6">
            <CustomText className="text-zinc-500">Current Password</CustomText>
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
            <CustomText className="text-zinc-500">New Password</CustomText>
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
            <CustomText className="text-zinc-500">Confirm Password</CustomText>
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
            className="bg-pink-800 rounded-lg py-3 mt-5"
          >
            <CustomText className="text-center text-white text-lg">
              Save Changes
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Web Alert */}
      {Platform.OS === "web" && isWebAlertVisible && (
        <Modal
          transparent={true}
          visible={isWebAlertVisible}
          animationType="fade"
        >
          <TouchableWithoutFeedback onPress={() => setWebAlertVisible(false)}>
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="bg-white p-6 rounded-lg w-80">
                <CustomText className="text-center text-xl">
                  {webAlertMessage}
                </CustomText>
                <TouchableOpacity
                  onPress={() => setWebAlertVisible(false)}
                  className="mt-4 bg-blue-500 p-2 rounded text-white"
                >
                  <CustomText className="text-center text-white">OK</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default ChangePassword;
