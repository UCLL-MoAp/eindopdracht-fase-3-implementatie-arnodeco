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
import { getAvatarUrl } from "@/app/api/userInfoService";

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

  const imageUrl = getAvatarUrl(user?.photoURL || "default");

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
