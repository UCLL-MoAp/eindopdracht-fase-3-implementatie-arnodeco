import { FontAwesome } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Image, Platform, Alert, TextInput, TouchableOpacity } from "react-native";
import MovieCards from "../../../components/movieCards";
import MovieCard from "../../../components/movieCard";

import * as WebBrowser from 'expo-web-browser';
import CustomText from "@/components/customText";


// tmdb api key: 4dfdd77affe188954f92111d9496afbd
// tmdb api read acces token: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZGZkZDc3YWZmZTE4ODk1NGY5MjExMWQ5NDk2YWZiZCIsIm5iZiI6MTczNjAyMjMxNy41MjEsInN1YiI6IjY3Nzk5OTJkNWFjMWJkODI2MTY2YzZjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KIpBE5bGrQeH3Sx4dTrFzsLPOY5BxVlFHVaGrKzakds
// tmdb top rated movies: https://api.themoviedb.org/3/movie/top_rated?api_key=4dfdd77affe188954f92111d9496afbd&language=en-US&page=1


const API_URL = "http://www.omdbapi.com/?i=tt3896198&apikey=c2435df5&type=series";

export default function Index() {

  const [recommendedMovies, setRecommendedMovies] = useState<typeof MovieCard[]>([]);
  const [mostWatchedMovies, setMostWatchedMovies] = useState<typeof MovieCard[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<typeof MovieCard[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<typeof MovieCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("")
  const [searchResults, setSearchResults] = useState<typeof MovieCard[]>([]);
  const [searchPage, setSearchPage] = useState<number>(1);


  const handleSearchInputChange = (text: string) => {

    setSearchInput(text);
    setSearchPage(1);
    searchMovies(searchInput, 1);
  };

  const performSearch = () => {
    setSearchActive(true);
  };

  const fetchMovies = async (
    type: string,
    category: string,
    time: string,
    setState: React.Dispatch<React.SetStateAction<any[]>>
  ): Promise<void> => {
    try {

      // Trending api and top_rated api differs -> type and category switch places and time is no parameter for top_rated so empty string while /week for this weeks trending api
      const response = await fetch(`https://api.themoviedb.org/3/${type}/${category}${time}?api_key=4dfdd77affe188954f92111d9496afbd&language=en-US&page=1`);
      const data = await response.json();


      if (response.ok && data.results) {
        setState(data.results);
      } else {
        Alert.alert("Error", data.status_message || "Failed to fetch movies");
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      Alert.alert("Error", "Unable to fetch movies.");
    }
  };

  const searchMovies = async (
    title: string,
    page: number
  ): Promise<void> => {
    try {

      const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=4dfdd77affe188954f92111d9496afbd&query=${title}&language=en-US&page=${page}`);
      const data = await response.json();

      if (data.results) {
        const filteredResults = data.results.filter(
          (item: { media_type: string; }) => item.media_type === "movie" || item.media_type === "tv"
        )

        if (response.ok && filteredResults) {
          setSearchResults(filteredResults);

        }
      } else {
        Alert.alert("Error", data.status_message || "Failed to search movies/series");
      }
    } catch (error) {
      console.error("Error searching movies/series:", error);
      Alert.alert("Error", "Unable to search for movies/series.");
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMovies("movie", "top_rated", "", setRecommendedMovies),
        fetchMovies("tv", "top_rated", "", setMostWatchedMovies),
        fetchMovies("trending", "movie", "/week", setTrendingMovies),
        fetchMovies("trending", "tv", "/week", setTrendingSeries),
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }


  return (

    <ScrollView className={`bg-customBg ${Platform.OS === "web" ? "p-10 lg:px-20 xl:px-32 2xl:px-52 3xl:px-72" : ""}`}>
      <StatusBar hidden={true} />

      {Platform.OS != "web" ? (
        <View className="flex-row justify-between items-center px-5 py-3">
          <TouchableOpacity onPress={() => setSearchActive(false)} >
            <Image
              source={require('../../../assets/images/logo-rerun.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain" />
          </TouchableOpacity>
          <FontAwesome className="text-right m-3" color={"white"} size={28} name="search" onPress={performSearch} />
        </View>

      ) : (<>
        <TextInput
          className="bg-transparent text-white mx-3 p-1 text-base mb-10 mt-5 border-b-2 border-zinc-500 xl:text-3xl lg:text-2xl md:text-xl sm:text-base xl:-p3 lg:p-2 md:p-1 sm:p-1"
          value={searchInput}
          placeholder="Search..."
          placeholderTextColor="#9CA3AF"
          onChangeText={(text) => {
            handleSearchInputChange(text)
            performSearch();
          }} />
      </>)}
      {!searchActive && (
        <>
          <View className="mb-5">
            <CustomText className={`m-3 w-90% border-b-2 border-b-white text-white text-2xl ${Platform.OS === "web" ? "3xl:text-5xl 2xl:text-4xl xl:text-3xl lg:text-2xl 3xl:mb-8 mb-0" : "text-2xl"}`}>Highest Rated Movies</CustomText>
            <MovieCards movies={recommendedMovies} />
          </View>

          <View className="mb-5">
            <CustomText className={`m-3 w-90% border-b-2 border-b-white text-white text-2xl ${Platform.OS === "web" ? "3xl:text-5xl 2xl:text-4xl xl:text-3xl lg:text-2xl mb-8" : "text-2xl"}`}>Highest Rated Series</CustomText>
            <MovieCards movies={mostWatchedMovies} />
          </View>

          <View className="mb-5">
            <CustomText className={`m-3 w-90% border-b-2 border-b-white text-white text-2xl ${Platform.OS === "web" ? "3xl:text-5xl 2xl:text-4xl xl:text-3xl lg:text-2xl mb-8" : "text-2xl"}`}>Trending Movies This Week</CustomText>
            <MovieCards movies={trendingMovies} />
          </View>

          <View className="mb-5">
            <CustomText className={`m-3 w-90% border-b-2 border-b-white text-white text-2xl ${Platform.OS === "web" ? "3xl:text-5xl 2xl:text-4xl xl:text-3xl lg:text-2xl mb-8" : "text-2xl"}`}>Trending Series This Week</CustomText>
            <MovieCards movies={trendingSeries} />
          </View>
        </>
      )}
      {searchActive && (
        Platform.OS != "web" ? (
          <>
            <TextInput
              className="bg-transparent text-white text-xl rounded-lg pb-0 mx-3 mb-10 border-b-2 border-zinc-500"
              value={searchInput}
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              onChangeText={handleSearchInputChange} />
            <CustomText className={`m-3 w-90% border-b-2 border-b-white text-white text-2xl"}`}>Results for "{searchInput}"</CustomText>
            <MovieCards movies={searchResults} />
            <TouchableOpacity onPress={() => {
              const nextPage = searchPage + 1;
              setSearchPage(nextPage);
              searchMovies(searchInput, nextPage);
            }}><CustomText className="text-white text-center">Next Page</CustomText></TouchableOpacity>

          </>) : <>
          <CustomText className={`m-3 w-90% border-b-2 border-b-white text-white ${Platform.OS === "web" ? "xl:text-5xl lg:text-4xl md:text-3xl sm:text-2xl mb-8" : "text-2xl"}`}>Results for "{searchInput}"</CustomText>
          <MovieCards movies={searchResults} />
          <TouchableOpacity onPress={() => {
            const nextPage = searchPage + 1;
            setSearchPage(nextPage);
            searchMovies(searchInput, nextPage);
          }}><Text className="text-white text-center font-bold">Next Page</Text></TouchableOpacity>
        </>
      )}
    </ScrollView>

  );
}
