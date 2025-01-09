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
import { useFocusEffect } from "expo-router";

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

  useFocusEffect(
    useCallback(() => {
      loadFriendsActivity()
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
    <View
      style={{
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2b3e",
      }}
    >
      <Image
        source={
          item.profilePicture
            ? getAvatarUrl(item.profilePicture)
            : getAvatarUrl("default")
        }
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {item.username}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#fff",
            marginTop: 4,
          }}
        >
          Rated {item.movieTitle} {item.rating} Stars
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#666",
            marginTop: 4,
          }}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1b2e",
        }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1a1b2e",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          marginTop: 60,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          Friends recent activity
        </Text>
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          style={{ padding: 8 }}
        >
          <FontAwesome name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => `${item.id}-${item.id}`}
        style={{
          flex: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            marginTop: 85,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <TextInput
              style={{
                flex: 1,
                height: 40,
                backgroundColor: "#f5f5f5",
                borderRadius: 20,
                paddingHorizontal: 16,
                marginRight: 8,
                color: "black",
              }}
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
              style={{ padding: 8 }}
            >
              <FontAwesome name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={searchResults}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                }}
                onPress={() => handleAddFriend(item.userId)}
              >
                <Image
                  source={
                    item.profilePicture
                      ? getAvatarUrl(item.profilePicture)
                      : getAvatarUrl("default")
                  }
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 16,
                  }}
                >
                  {item.username}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.userId}
          />
        </View>
      </Modal>
    </View>
  );
}
