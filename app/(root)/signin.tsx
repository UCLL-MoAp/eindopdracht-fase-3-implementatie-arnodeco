import {
  View,
  Text,
  TextInput,
  Alert,
  Button,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "expo-router";

const signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  // Handle Sign-Up
  const handleSignUp = async () => {
    try {
      router.push("/signup");
    } catch (error) {
      // Alert.alert('Sign-Up Error', error.message);
    }
  };

  // Handle Sign-In
  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      Alert.alert("Logged in", `Welcome back ${userCredential.user.email}`);
      router.replace("/");
    } catch (error) {
      Alert.alert("Sign-In Error", "Check your credentials and try again.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={{ flex: 1, width: "100%", height: "100%" }}
      resizeMode="cover"
      className="flex-1 justify-center items-center"
    >
      <SafeAreaView className="flex-1 w-full items-center">
        <Image
          source={require("../../assets/images/logo-rerun.png")}
          style={{ width: 250, height: 160, marginBottom: 40, marginTop: 80 }}
          resizeMode="contain"
        />
        {/* Form Section */}
        <View className="w-4/5">
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

          {/* Password Input */}
          <Text className="text-left mb-2">Password</Text>
          <TextInput
            className="bg-white p-5 rounded-2xl shadow"
            placeholder="Enter Password"
            placeholderTextColor="black"
            value={password}
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
          />

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => router.push("/forgotpassword")}>
            <Text className="text-customPurple text-m font-semibold text-center mt-4 mb-4">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View className="w-4/5 space-y-4 mt-8">
          <TouchableOpacity
            onPress={handleSignIn}
            className="bg-customPurple p-4 rounded-full items-center"
          >
            <Text className="text-white text-lg font-bold">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignUp}
            className="items-center"
            style={{ marginTop: 10 }}
          >
            <Text className="text-customPurple text-lg font-bold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default signin;
