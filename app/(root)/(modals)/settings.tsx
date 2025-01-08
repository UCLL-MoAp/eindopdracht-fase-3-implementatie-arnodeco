import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
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
  Home,
  List,
  Users,
  User,
} from "lucide-react-native";
import { auth } from "../../../firebase";
import { signOut } from "firebase/auth";

const settings = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const imageMap = {
    default: require("../../../assets/images/avatars/default.png"),
    luffy: require("../../../assets/images/avatars/luffy.png"),
    ironman: require("../../../assets/images/avatars/ironman.png"),
    starwars: require("../../../assets/images/avatars/starwars.png"),
    spiderman: require("../../../assets/images/avatars/spiderman.png"),
    mario: require("../../../assets/images/avatars/mario.png"),
    aang: require("../../../assets/images/avatars/aang.png"),
    mickey: require("../../../assets/images/avatars/mickey.png"),
    minion: require("../../../assets/images/avatars/minion.png"),
    olaf: require("../../../assets/images/avatars/olaf.png"),
    walle: require("../../../assets/images/avatars/walle.png"),
    pirate: require("../../../assets/images/avatars/pirate.png"),
  };
  // Get the image URL from the map
  const imageUrl =
    user?.photoURL && imageMap[user.photoURL as keyof typeof imageMap]
      ? imageMap[user.photoURL as keyof typeof imageMap]
      : "https://via.placeholder.com/150";

  console.log("User's photoURL:", user?.photoURL);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a1f]">
      {/* Header */}
      <View className="px-6 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="white" size={32} />
        </TouchableOpacity>
        <Text className="text-white text-4xl font-bold mt-4">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Account Section */}
        <Text className="text-white text-2xl mb-4">Account</Text>
        <TouchableOpacity className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <Image
              source={imageUrl}
              className="rounded-full"
              style={{ width: 60, height: 60 }}
            />
            <View className="ml-4">
              <Text className="text-white text-lg">{user?.displayName}</Text>
            </View>
          </View>
          <Link
            onPress={handleLogout}
            href={"../../signin"}
            className="font-semibold text-center text-white text-lg underline"
          >
            Logout
          </Link>
        </TouchableOpacity>

        {/* Settings Section */}
        <Text className="text-white text-2xl mb-4">Settings</Text>

        {/* Language Option */}
        <TouchableOpacity className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-200 rounded-full items-center justify-center">
              <Globe color="#000" size={24} />
            </View>
            <Text className="text-white text-lg ml-4">Language</Text>
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
            <Text className="text-white text-lg ml-4">Notifications</Text>
          </View>
          <Switch value={false} />
        </View>

        {/* Dark Mode Option */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-purple-200 rounded-full items-center justify-center">
              <Moon color="#000" size={24} />
            </View>
            <Text className="text-white text-lg ml-4">Dark Mode</Text>
          </View>
          <Switch value={true} />
        </View>

        {/* Help Option */}
        <TouchableOpacity className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-pink-200 rounded-full items-center justify-center">
              <HelpCircle color="#000" size={24} />
            </View>
            <Text className="text-white text-lg ml-4">Help</Text>
          </View>
          <ChevronRight color="gray" size={24} />
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity className="flex-row items-center mt-8">
          <Trash2 color="#ff4444" size={24} />
          <Text className="text-red-500 ml-2">Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default settings;
