import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  ImageSourcePropType,
  RefreshControl,
  Platform,
  StyleSheet,
} from "react-native";
import { auth } from "@/firebase";
import { getFriends, addFriend } from "@/app/api/friendsService";
import { getFriendsRatings } from "@/app/api/ratingsService";
import {
  searchUsers,
  getUserInfo,
  getAvatarUrl,
} from "@/app/api/userInfoService";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import CustomText from "@/components/customText";

interface Activity {
  id: string;
  username: string;
  profilePicture?: string;
  movieTitle: string;
  rating: number;
  timestamp: string;
}

interface SearchResult {
  userId: string;
  username: string;
  profilePicture?: string;
}

export default function FriendsScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const avatarStyleWeb = Platform.OS === "web" ? { width: 50, height: 50 } : {};

  useFocusEffect(
    useCallback(() => {
      loadFriendsActivity();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriendsActivity();
  };

  const loadFriendsActivity = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const friendsList = await getFriends(currentUser.uid);
      const friendIds = friendsList.map((friend) => friend.userId);
      const ratings = await getFriendsRatings(friendIds);

      const activitiesWithUsernames = await Promise.all(
        ratings.map(async (rating) => {
          return {
            id: rating.movieId,
            profilePicture: rating.avatarName,
            username: rating?.userName || "Unknown User",
            movieTitle: rating.movieTitle,
            rating: rating.rating,
            timestamp: rating.timestamp || "",
          };
        })
      );
      setActivities(activitiesWithUsernames);
    } catch (error) {
      console.error("Error loading friends activity:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await addFriend(currentUser.uid, friendId);
      await addFriend(friendId, currentUser.uid);
      setSearchModalVisible(false);
      loadFriendsActivity();
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <View className="flex-row p-4 border-b border-[#2a2b3e]">
      <Image
        source={
          item.profilePicture
            ? getAvatarUrl(item.profilePicture)
            : getAvatarUrl("default")
        }
        className="w-[60px] h-[60px] rounded-full mr-5"
        style={avatarStyleWeb}
      />
      <View className="flex-1">
        <CustomText className="text-base text-white">{item.username}</CustomText>
        <Text className="text-m text-white mt-1">
          Rated <CustomText >{item.movieTitle}</CustomText>{" "}
          <CustomText className="text-yellow-500">{item.rating} Stars</CustomText>
        </Text>
        <CustomText className="text-sm text-gray-500 mt-1">{item.timestamp}</CustomText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#1a1b2e]">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1a1b2e]">
      {Platform.OS != "web" ? (
        <View className="flex-row justify-between items-center px-5 pt-3">
          <TouchableOpacity onPress={() => router.push("/")}>
            <Image
              source={require("../../../assets/images/logo-rerun.png")}
              className="w-[100px] h-[100px]"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
      <View
        className={`flex-1 bg-[#1a1b2e] ${Platform.OS === "web" ? "px-10 sm:px-20 md:px-40 lg:px-72" : ""
          }`}
      >
        <View className="flex-row justify-between items-center p-4 mt-0 border-b-2 border-b-white">
          <CustomText className="text-2xl text-white">
            Friends recent activity
          </CustomText>
          <TouchableOpacity
            onPress={() => setSearchModalVisible(true)}
            className="p-2"
          >
            <FontAwesome name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />

        <Modal
          visible={searchModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View
            className={`flex-1 ${Platform.OS === "web" ? "px-10 sm:px-20 md:px-40 lg:px-72" : ""
              }`}
          >
            <View className="flex-1 bg-white mt-[175px]">
              <View className="flex-row p-4 border-b border-gray-200">
                <TextInput
                  className="flex-1 h-10 bg-gray-100 rounded-full px-4 mr-2 text-black"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    handleSearch(text);
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setSearchModalVisible(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="p-2"
                >
                  <FontAwesome name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                  <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Image
                      source={
                        item.profilePicture
                          ? getAvatarUrl(item.profilePicture)
                          : getAvatarUrl("default")
                      }
                      className="w-14 h-14 rounded-full mr-3"
                      style={avatarStyleWeb}
                    />
                    <View className="flex-1">
                      <CustomText className="text-lg">
                        {item.username}
                      </CustomText>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddFriend(item.userId)}
                      className="bg-[#1a1b2e] px-4 py-3 rounded-lg"
                    >
                      <CustomText className="text-white">Add Friend</CustomText>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item.userId}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
