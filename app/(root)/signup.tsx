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
} from "react-native";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "expo-router";

const signup = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  // Handle Sign-Up
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      Alert.alert(
        "User created",
        `User created with email: ${userCredential.user.email}`
      );
      router.push("/signin");
    } catch (error) {
      // Alert.alert('Sign-Up Error', error.message);
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
        {/* Header Section */}

        <Image
          source={require("../../assets/images/logo-rerun.png")}
          style={{ width: 190, height: 160, marginTop: 80 }}
          resizeMode="contain"
        />

        {/* Form Section */}
        <View className="w-4/5">
          {/* Name Input */}
          <Text className="text-left mb-2">Name</Text>
          <TextInput
            className="bg-white p-5 rounded-2xl shadow mb-8"
            placeholder="Enter Full Name"
            placeholderTextColor="black"
            value={name}
            autoCapitalize="none"
            onChangeText={(text) => setName(text)}
          />
          {/* Username Input */}
          <Text className="text-left mb-2">Username</Text>
          <TextInput
            className="bg-white p-5 rounded-2xl shadow mb-8"
            placeholder="Enter Username"
            placeholderTextColor="black"
            value={username}
            autoCapitalize="none"
            onChangeText={(text) => setUsername(text)}
          />
          {/* Email Input */}
          <Text className="text-left mb-2">Email</Text>
          <TextInput
            className="bg-white p-5 rounded-2xl shadow mb-8"
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
        </View>

        {/* Buttons */}
        <View className="w-4/5 space-y-4 mt-8">
          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-customPurple p-4 rounded-full items-center"
          >
            <Text className="text-white text-lg font-bold">Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default signup;
