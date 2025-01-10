import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Moon,
  Globe,
  HelpCircle,
  Trash2,
  X,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import { auth, db } from "../../../firebase";
import { signOut, deleteUser } from "firebase/auth";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAvatarUrl } from "@/app/api/userInfoService";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const modalWidth =
    Platform.OS === "web"
      ? Math.min(400, windowWidth * 0.9)
      : windowWidth * 0.9;

  // Calculate video dimensions to maintain 16:9 aspect ratio
  const videoWidth =
    Platform.OS === "web"
      ? Math.min(800, windowWidth * 0.9)
      : windowWidth * 0.9;
  const videoHeight = videoWidth * (9 / 16);

  // YouTube video configuration
  const videoId = "5W3hqGExtn0"; // Replace with your actual video ID
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  // Load dark mode preference on component mount
  useEffect(() => {
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const darkModePreference = await AsyncStorage.getItem("darkMode");
      setDarkMode(
        darkModePreference === null ? true : darkModePreference === "true"
      );
    } catch (error) {
      console.error("Error loading dark mode preference:", error);
    }
  };

  const handleDarkModeToggle = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      await AsyncStorage.setItem("darkMode", newDarkMode.toString());
    } catch (error) {
      console.error("Error saving dark mode preference:", error);
    }
  };

  const handleDeleteAccountPress = () => {
    if (!user) {
      if (Platform.OS === "web") {
        setShowDeleteModal(true);
      } else {
        Alert.alert("Error", "No user is currently logged in");
      }
      return;
    }

    if (Platform.OS === "web") {
      setShowDeleteModal(true);
    } else {
      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: performAccountDeletion,
          },
        ]
      );
    }
  };

  const performAccountDeletion = async () => {
    if (!user) return;

    try {
      const userId = user.uid;

      // Delete from users collection
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);

      // Delete from userinfo collection
      const userinfoQuery = query(
        collection(db, "userinfo"),
        where("userId", "==", userId)
      );
      const userinfoSnapshot = await getDocs(userinfoQuery);
      userinfoSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete the user authentication
      await deleteUser(user);

      router.replace("../../signin");
    } catch (error) {
      console.error("Error deleting account:", error);
      if (Platform.OS === "web") {
        setShowDeleteModal(false);
      } else {
        Alert.alert("Error", "Failed to delete account. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const imageUrl = getAvatarUrl(user?.photoURL || "default");
  const backgroundColor = darkMode ? "#0a0a1f" : "#f0f0f5";
  const textColor = darkMode ? "white" : "black";

  return (
    <SafeAreaView className={`flex-1`} style={{ backgroundColor }}>
      {/* Header */}
      <View className="px-6 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={textColor} size={32} />
        </TouchableOpacity>
        <Text
          className={`text-4xl font-bold mt-4 mb-6`}
          style={{ color: textColor }}
        >
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Account Section */}
        <Text className={`text-2xl mb-4`} style={{ color: textColor }}>
          Account
        </Text>
        <TouchableOpacity className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <Image
              source={imageUrl}
              className="rounded-full"
              style={{ width: 60, height: 60 }}
            />
            <View className="ml-4">
              <Text className={`text-lg`} style={{ color: textColor }}>
                {user?.displayName}
              </Text>
            </View>
          </View>
          <Link
            onPress={handleLogout}
            href={"../../signin"}
            className="font-semibold text-center text-lg underline"
            style={{ color: textColor }}
          >
            Logout
          </Link>
        </TouchableOpacity>

        {/* Settings Section */}
        <Text className={`text-2xl mb-4`} style={{ color: textColor }}>
          Settings
        </Text>

        {/* Language Option */}
        <TouchableOpacity
          className="flex-row items-center justify-between mb-6"
          onPress={() => setShowLanguageModal(true)}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-200 rounded-full items-center justify-center">
              <Globe color="#000" size={24} />
            </View>
            <Text className={`text-lg ml-4`} style={{ color: textColor }}>
              Language
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-400 mr-2">English</Text>
            <ChevronRight color="gray" size={24} />
          </View>
        </TouchableOpacity>

        {/* Notifications Option */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-200 rounded-full items-center justify-center">
              <Bell color="#000" size={24} />
            </View>
            <Text className={`text-lg ml-4`} style={{ color: textColor }}>
              Notifications
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {/* Dark Mode Option */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-purple-200 rounded-full items-center justify-center">
              <Moon color="#000" size={24} />
            </View>
            <Text className={`text-lg ml-4`} style={{ color: textColor }}>
              Dark Mode
            </Text>
          </View>
          <Switch value={darkMode} onValueChange={handleDarkModeToggle} />
        </View>

        {/* Help Option */}
        <TouchableOpacity
          className="flex-row items-center justify-between mb-6"
          onPress={() => setShowHelpModal(true)}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-pink-200 rounded-full items-center justify-center">
              <HelpCircle color="#000" size={24} />
            </View>
            <Text className={`text-lg ml-4`} style={{ color: textColor }}>
              Help
            </Text>
          </View>
          <ChevronRight color="gray" size={24} />
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          className="flex-row items-center mt-16"
          onPress={handleDeleteAccountPress}
        >
          <Trash2 color="#ff4444" size={24} />
          <Text className="text-red-500 ml-2">Delete account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 justify-end">
          <View className={`rounded-t-3xl p-6`} style={{ backgroundColor }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-xl font-bold`}
                style={{ color: textColor }}
              >
                Select Language
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text className="text-blue-500">Close</Text>
              </TouchableOpacity>
            </View>
            <View className="mb-4">
              <TouchableOpacity
                className="py-3 px-4 bg-gray-100 rounded-lg mb-2"
                onPress={() => setShowLanguageModal(false)}
              >
                <Text className="text-black">English</Text>
              </TouchableOpacity>
              <Text className="text-gray-400 mt-2">
                English is the only supported language currently
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View
            className={`m-5 p-6 rounded-lg`}
            style={{
              backgroundColor,
              width: modalWidth,
            }}
          >
            <Text
              className={`text-xl font-bold mb-4`}
              style={{ color: textColor }}
            >
              Delete Account
            </Text>
            <Text className={`mb-6`} style={{ color: textColor }}>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </Text>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                className="px-4 py-2 rounded"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-blue-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-red-500 rounded"
                onPress={() => {
                  setShowDeleteModal(false);
                  performAccountDeletion();
                }}
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help Video Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHelpModal}
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <View
            className={`rounded-lg overflow-hidden`}
            style={{
              width: videoWidth,
              backgroundColor,
            }}
          >
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
              <Text
                className={`text-xl font-bold`}
                style={{ color: textColor }}
              >
                Help Guide
              </Text>
              <TouchableOpacity
                onPress={() => setShowHelpModal(false)}
                className="p-1"
              >
                <X color={textColor} size={24} />
              </TouchableOpacity>
            </View>

            {/* Video Container */}
            <View style={{ width: videoWidth, height: videoHeight }}>
              {Platform.OS === "web" ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <WebView
                  source={{ uri: embedUrl }}
                  style={{ flex: 1 }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  mediaPlaybackRequiresUserAction={false}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;
