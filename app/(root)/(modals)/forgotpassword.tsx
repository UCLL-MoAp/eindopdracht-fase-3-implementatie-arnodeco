import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  ImageBackground,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [webAlertVisible, setWebAlertVisible] = useState(false);
  const [webAlertMessage, setWebAlertMessage] = useState("");
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (!email) {
      showAlert("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showAlert("Password reset email sent! Please check your inbox.", true);
    } catch (error) {
      showAlert("Something went wrong. Verify that your email is correct.");
    }
  };

  const showAlert = (message: string, success = false) => {
    if (Platform.OS === "web") {
      // Show custom alert on web
      setWebAlertMessage(message);
      setWebAlertVisible(true);
    } else {
      Alert.alert(success ? "Success" : "Error", message, [
        {
          text: "OK",
          onPress: success ? () => router.push("/signin") : undefined,
        },
      ]);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/background.png")}
      style={{ flex: 1, width: "100%", height: "100%" }}
      resizeMode="cover"
      className="flex-1 justify-center items-center"
    >
      <View className="absolute left-5 top-16 z-10">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="black" size={32} />
        </TouchableOpacity>
      </View>
      <SafeAreaView className="flex-1 w-full items-center">
        <View className="mt-60 items-center">
          <Text className="text-black text-2xl mb-6 font-bold">
            Forgot Password?
          </Text>
          <Text className="text-black font-semibold text-m">
            Enter your email address below to reset your password
          </Text>
        </View>

        {/* Form Section */}
        <View className="w-4/5 mt-10">
          {/* Email Input */}
          <Text className="text-left mb-2">Email</Text>
          <TextInput
            className="bg-white p-5 rounded-2xl shadow mb-6"
            placeholder="Enter Email"
            placeholderTextColor="black"
            value={email}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
          />
        </View>

        {/* Button Section */}
        <View className="w-4/5 space-y-4 mt-2">
          {/* Reset Password Button */}
          <TouchableOpacity
            onPress={handlePasswordReset}
            className="bg-customPurple p-4 rounded-full items-center"
          >
            <Text className="text-white text-lg font-bold">Submit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Custom Web Alert */}
      {Platform.OS === "web" && webAlertVisible && (
        <Modal
          transparent={true}
          visible={webAlertVisible}
          animationType="fade"
        >
          <TouchableWithoutFeedback onPress={() => setWebAlertVisible(false)}>
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="bg-white p-6 rounded-lg w-80">
                <Text className="text-center text-xl text-black">
                  {webAlertMessage}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setWebAlertVisible(false);
                    if (webAlertMessage.includes("Password reset email sent")) {
                      router.push("/signin");
                    }
                  }}
                  className="mt-4 bg-customPurple p-2 rounded"
                >
                  <Text className="text-center text-white">OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </ImageBackground>
  );
};

export default ForgotPassword;
