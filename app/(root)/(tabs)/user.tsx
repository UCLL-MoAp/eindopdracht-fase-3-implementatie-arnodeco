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

const avatars: { name: string; source: ImageSourcePropType }[] = [
  {
    name: "default",
    source: require("../../../assets/images/avatars/default.png"),
  },
  {
    name: "luffy",
    source: require("../../../assets/images/avatars/luffy.png"),
  },
  {
    name: "ironman",
    source: require("../../../assets/images/avatars/ironman.png"),
  },
  {
    name: "starwars",
    source: require("../../../assets/images/avatars/starwars.png"),
  },
  {
    name: "spiderman",
    source: require("../../../assets/images/avatars/spiderman.png"),
  },
  {
    name: "mario",
    source: require("../../../assets/images/avatars/mario.png"),
  },
  {
    name: "aang",
    source: require("../../../assets/images/avatars/aang.png"),
  },
  {
    name: "mickey",
    source: require("../../../assets/images/avatars/mickey.png"),
  },
  {
    name: "minion",
    source: require("../../../assets/images/avatars/minion.png"),
  },
  {
    name: "olaf",
    source: require("../../../assets/images/avatars/olaf.png"),
  },
  {
    name: "walle",
    source: require("../../../assets/images/avatars/walle.png"),
  },
  {
    name: "pirate",
    source: require("../../../assets/images/avatars/pirate.png"),
  },
];

const user = () => {
  const user = auth.currentUser;
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height - insets.bottom;

  const itemSize =
    Platform.OS === "web"
      ? (screenWidth - 60) / 10
      : (screenWidth - 40) / 3 - 10;

  const getAvatarByName = (name: string | null | undefined) => {
    const avatar = avatars.find((a) => a.name === name);
    return avatar ? avatar.source : avatars[0].source;
  };

  const [displayNameInput, setDisplayNameInput] = useState(
    user?.displayName ?? ""
  );
  const [photoURL, setPhotoURL] = useState<ImageSourcePropType>(
    getAvatarByName(user?.photoURL)
  );

  const router = useRouter();

  const [isEditable, setIsEditable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastSavedPhotoName, setLastSavedPhotoName] = useState<string>(
    user?.photoURL || "default"
  );

  useEffect(() => {
    const avatarSource = getAvatarByName(user?.photoURL);
    setPhotoURL(avatarSource);
    setLastSavedPhotoName(user?.photoURL || "default");
  }, [user?.photoURL]);

  const handleToggleEdit = () => {
    setIsEditable((prev) => !prev);
    setIsVisible((prev) => !prev);
  };

  const handleSettings = async () => {
    router.push("/(root)/(modals)/settings");
  };

  const handleSave = async () => {
    const selectedAvatarName = avatars.find(
      (avatar) => avatar.source === photoURL
    )?.name;

    if (!selectedAvatarName) return;

    alert("Saved!");

    await updateProfile(auth.currentUser!, {
      displayName: displayNameInput,
      photoURL: selectedAvatarName,
    });
    setLastSavedPhotoName(selectedAvatarName);
    setIsEditable(false);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setDisplayNameInput(auth.currentUser?.displayName ?? "");
    setPhotoURL(getAvatarByName(lastSavedPhotoName));
    setIsEditable(false);
    setIsVisible(false);
  };

  const handleAvatarSelect = (avatar: {
    name: string;
    source: ImageSourcePropType;
  }) => {
    setPhotoURL(avatar.source);
    setIsModalVisible(false);
  };

  const [isVisible, setIsVisible] = useState(false);

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
              source={photoURL}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                top: -90,
              }}
              resizeMode="contain"
            />
            {/* Camera icon when in edit mode */}
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
              data={avatars}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
                  <Image
                    source={item.source}
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

        <View className="mb-6" style={{ top: -50 }}>
          <Text className={`${isEditable ? "text-white" : "text-zinc-500"}`}>
            Display Name
          </Text>
          <TextInput
            className={`bg-transparent ${
              isEditable ? "text-white" : "text-zinc-500"
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
