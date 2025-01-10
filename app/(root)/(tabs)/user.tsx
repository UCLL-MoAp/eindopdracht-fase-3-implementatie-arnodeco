import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
  ImageSourcePropType,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { auth } from "../../../firebase";
import { updateProfile, signOut } from "firebase/auth";
import { updateUserInfo, getAvatarUrl } from "@/app/api/userInfoService";
import { updateRatingAvatarForAll } from "@/app/api/ratingsService";

const user = () => {
  const user = auth.currentUser;
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height - insets.bottom;

  const itemSize =
    Platform.OS === "web"
      ? (screenWidth - 60) / 10
      : (screenWidth - 40) / 3 - 10;

  const [displayNameInput, setDisplayNameInput] = useState(
    user?.displayName ?? ""
  );
  // Change the type to string for the avatar name
  const [avatarName, setAvatarName] = useState<string>(
    user?.photoURL || "default"
  );
  const [lastSavedAvatarName, setLastSavedAvatarName] = useState<string>(
    user?.photoURL || "default"
  );

  const router = useRouter();
  const [isEditable, setIsEditable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setAvatarName(user?.photoURL || "default");
    setLastSavedAvatarName(user?.photoURL || "default");
  }, [user?.photoURL]);

  const handleToggleEdit = () => {
    setIsEditable((prev) => !prev);
    setIsVisible((prev) => !prev);
  };

  const handleSettings = async () => {
    router.push("/(root)/(modals)/settings");
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      // First update Firestore
      await updateUserInfo(currentUser.uid, avatarName, displayNameInput);

      // Then update avatar in ratings db 
      await updateRatingAvatarForAll(currentUser.uid, avatarName)

      // Then update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: displayNameInput,
        photoURL: avatarName,
      });

      alert("Saved!");
      setLastSavedAvatarName(avatarName);
      setIsEditable(false);
      setIsVisible(false);

      router.push('../signin')
      router.push('/user')
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setDisplayNameInput(auth.currentUser?.displayName ?? "");
    setAvatarName(lastSavedAvatarName);
    setIsEditable(false);
    setIsVisible(false);
  };

  const handleAvatarSelect = (newAvatarName: string) => {
    setAvatarName(newAvatarName);
    setIsModalVisible(false);
  };

  // Available avatar names array for the modal
  const availableAvatars = [
    "default",
    "luffy",
    "ironman",
    "starwars",
    "spiderman",
    "mario",
    "aang",
    "mickey",
    "minion",
    "olaf",
    "walle",
    "pirate",
  ];

  return (
    <SafeAreaView className="bg-pink-950 h-full">
      <FontAwesome
        className="text-right mb-10 mr-10 mt-5"
        color={"white"}
        size={28}
        name="cog"
        onPress={handleSettings}
      />

      <View className="bg-customBg p-5 rounded-lg mt-10">
        <View className="flex-row justify-between items-center px-5 py-3">
          <View style={{ position: "relative" }}>
            <Image
              source={getAvatarUrl(avatarName)}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                top: -90,
              }}
              resizeMode="contain"
            />
            {isEditable && (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: "-15%",
                  left: "47%",
                  transform: [{ translateX: -20 }, { translateY: -20 }],
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 20,
                  padding: 8,
                }}
                onPress={() => setIsModalVisible(true)}
              >
                <FontAwesome name="camera" size={30} color="white" />
              </TouchableOpacity>
            )}
          </View>
          {!isVisible && (
            <FontAwesome
              className="text-right"
              style={{
                top: -40,
              }}
              color={"white"}
              size={28}
              name="edit"
              onPress={handleToggleEdit}
            />
          )}

          {isVisible && (
            <View
              className="flex-row justify-between items-center px-5 py-3"
              style={{ top: -40 }}
            >
              <TouchableOpacity
                onPress={handleSave}
                className="bg-transparent m-10"
              >
                <Text className="text-white text-center">Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancel}
                className="bg-transparent"
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Avatar Selection Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.8)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20, color: "white", marginBottom: 20 }}>
              Choose an Avatar
            </Text>
            <FlatList
              data={availableAvatars}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
                  <Image
                    source={getAvatarUrl(item)}
                    style={{
                      width: itemSize,
                      height: itemSize,
                      margin: 10,
                      borderRadius: itemSize / 2,
                    }}
                  />
                </TouchableOpacity>
              )}
              numColumns={3}
            />
            <TouchableOpacity
              style={{
                marginBottom: 100,
                padding: 10,
                paddingLeft: 20,
                paddingRight: 20,
                backgroundColor: "white",
                borderRadius: 10,
              }}
              onPress={() => setIsModalVisible(false)}
            >
              <Text
                style={{ fontSize: 16, color: "black", fontWeight: "bold" }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Rest of your component remains the same */}
        <View className="mb-6" style={{ top: -50 }}>
          <Text className={`${isEditable ? "text-white" : "text-zinc-500"}`}>
            Display Name
          </Text>
          <TextInput
            className={`bg-transparent ${isEditable ? "text-white" : "text-zinc-500"
              } text-xl rounded-lg pb-0 mb-2 border-b-2 border-zinc-500`}
            editable={isEditable}
            value={displayNameInput}
            onChangeText={setDisplayNameInput}
            placeholder="Name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="mb-6" style={{ top: -50 }}>
          <Text className="text-zinc-500">E-mail</Text>
          <TextInput
            className="bg-transparent text-zinc-500 text-xl rounded-lg pb-0 mb-2 border-b-2 border-zinc-500"
            value={user?.email ?? "E-mail"}
            placeholder="Mail"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="mb-6" style={{ top: -50 }}>
          <Text className="text-zinc-500">User Id</Text>
          <TextInput
            className="bg-transparent text-zinc-500 text-xl rounded-lg pb-0 mb-2 border-b-2 border-zinc-500"
            editable={isEditable}
            value={user?.uid ?? "ID"}
            placeholder="Phone"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Link
          href={"../(modals)/changepassword"}
          className="font-semibold text-center mt-2 text-white text-lg underline"
        >
          Change Password
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default user;
