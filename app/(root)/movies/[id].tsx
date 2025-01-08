import { View, Text, ScrollView, StatusBar, Image, Alert, Pressable, Dimensions, Platform, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import MovieCards from '@/components/movieCards';
import MovieCard from '@/components/movieCard';
import { addToWatchlist } from '@/app/api/watchListService';
import { auth } from '@/firebase';
import { addToSeriesWatchlist } from '@/app/api/seriesWatchListService';

type Genre = {
    id: number;
    name: string;
};

type MovieOrSeries = {
    id: number;
    title?: string; // For movies
    name?: string; // For series
    vote_average?: number;
    vote_count?: number;
    poster_path?: string;
    overview?: string;
    release_date?: string; // For movies
    first_air_date?: string; // For series
    runtime?: string,
    runtime_minutes: number
    number_of_episodes?: number[],
    number_of_seasons?: number,
    genres?: Genre[]
};

type Provider = {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
};

type CountryProviders = {
    link: string;
    flatrate?: Provider[];
    buy?: Provider[];
    rent?: Provider[];
    ads?: Provider[];
};

type ProcessedData = {
    link: string;
    flatrate: { logo_path: string; provider_name: string }[];
};

type Season = {
    episode_count: number,
    season_number: number
}


const Movie = () => {
    const { id, type } = useLocalSearchParams();
    const [data, setData] = useState<MovieOrSeries | null>(null);
    const [providers, setProviders] = useState<ProcessedData | null>(null);

    const user = auth.currentUser;

    const userCountry = "US"

    const [recommendedMovies, setRecommendedMovies] = useState<typeof MovieCard[]>([]);

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const insets = useSafeAreaInsets();

    const posterWidth = screenWidth * (Platform.OS === 'web' ? 0.3 : 0.6);
    const posterAspectRatio = 2 / 3;

    const router = useRouter();

    const extractData = (response: any): MovieOrSeries => {

        const release_date = response.release_date || response.first_air_date;
        const release_year = release_date.slice(0, 4)

        const runtime =
            response.runtime
                ? `${Math.floor(response.runtime / 60)}h ${response.runtime % 60}m`
                : response.number_of_seasons
                    ? `Seasons: ${response.number_of_seasons} | Episodes: ${response.number_of_episodes}`
                    : 'N/A';

        const episodesPerSeason = response?.seasons
            .filter((season: Season) => season.season_number > 0) // Exclude "Specials" or invalid seasons
            .map((season: Season) => season.episode_count);

        return {
            id: response.id,
            title: response.title || response.name,
            vote_average: response.vote_average,
            vote_count: response.vote_count,
            poster_path: response.poster_path,
            overview: response.overview,
            release_date: release_year,
            runtime: runtime,
            runtime_minutes: response.runtime,
            number_of_seasons: response.number_of_seasons,
            number_of_episodes: episodesPerSeason,
            genres: response.genres || []
        };
    };

    const fetchMovieOrSerieData = async (type: string, id: string): Promise<void> => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/${type}/${id}?api_key=4dfdd77affe188954f92111d9496afbd&language=en-US`
            );
            const json = await response.json();
            if (response.ok) {
                const extractedData = extractData(json);
                setData(extractedData);
            } else {
                Alert.alert('Error', json.status_message || `Failed to fetch ${type}`);
            }
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            Alert.alert('Error', `Unable to fetch ${type}.`);
        }
    };

    const fetchProviders = async (movieId: string, type: string, country: string): Promise<void> => {
        const url = `https://api.themoviedb.org/3/${type}/${movieId}/watch/providers?api_key=4dfdd77affe188954f92111d9496afbd`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data.results || !data.results.US) {
                console.error("US data not available in the API response.");
            }

            const countryData: CountryProviders | undefined = data.results?.[country];

            if (!countryData) {
                console.warn(`No streaming options available for country: ${country}`);
                setProviders(null);
                return;
            }

            setProviders({
                link: countryData.link,
                flatrate: (countryData.flatrate || []).map((provider: Provider) => ({
                    logo_path: provider.logo_path,
                    provider_name: provider.provider_name,
                }))
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchRecommendedMovies = async (
        type: string,
        category: string,
        id: string,
        setState: React.Dispatch<React.SetStateAction<any[]>>
    ): Promise<void> => {
        try {

            // Trending api and top_rated api differs -> type and category switch places and time is no parameter for top_rated so empty string while /week for this weeks trending api
            const response = await fetch(`https://api.themoviedb.org/3/${type}/${id}/${category}?api_key=4dfdd77affe188954f92111d9496afbd&language=en-US&page=1`);
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

    const handleAddToList = async () => {
        if (type == "movie") {
            const movieToAdd = {
                movieId: data?.id.toString() ?? "",
                movieTitle: data?.title ?? "",
                posterUrl: data?.poster_path
                    ? `https://image.tmdb.org/t/p/w300${data?.poster_path}` //Image width/size (w300 in the uri) is smaller for performance gains
                    : 'https://via.placeholder.com/400?text=No_Poster',
                length: data?.runtime ?? "",
                length_minutes: data?.runtime_minutes!,
                progress: "0"
            }
            try {
                await addToWatchlist(user!.uid, movieToAdd);
                console.log("Added movie to list:", movieToAdd.movieTitle)
            } catch (error) {
                console.error('Error adding sample movie:', error);
            }
        }
        else if (type == "tv") {
            const seriesToAdd = {
                seriesId: data?.id.toString() ?? "",
                seriesTitle: data?.title ?? "",
                posterUrl: data?.poster_path
                    ? `https://image.tmdb.org/t/p/w300${data?.poster_path}` //Image width/size (w300 in the uri) is smaller for performance gains
                    : 'https://via.placeholder.com/400?text=No_Poster',
                runtime: data?.runtime ?? "",
                seasons: data?.number_of_seasons ?? 0,
                episodesPerSeason: data?.number_of_episodes ?? [],
                seasonsProgress: 1,
                episodesProgress: 0,
            }
            console.log("Series Info:", seriesToAdd)
            try {
                await addToSeriesWatchlist(user!.uid, seriesToAdd);
                console.log("Added movie to list:", seriesToAdd.seriesTitle)
            } catch (error) {
                console.error('Error adding sample movie:', error);
            }
        }
    }


    useEffect(() => {
        fetchRecommendedMovies(type as string, "recommendations", id as string, setRecommendedMovies)
    }, []);


    useEffect(() => {
        fetchMovieOrSerieData(type as string, id as string);
    }, [id]);

    useEffect(() => {
        if (data?.id) {
            fetchProviders(data.id.toString(), type as string, userCountry);
        }
    }, [data]);

    useEffect(() => {
        const updateWidth = () => {
            setScreenWidth(Dimensions.get('window').width);
        };

        if (Platform.OS === 'web') {
            window.addEventListener('resize', updateWidth);
        }

        return () => {

            if (Platform.OS === 'web') {
                window.removeEventListener('resize', updateWidth);
            }
        };
    }, []);

    return (
        <SafeAreaProvider>
            <ScrollView className="flex-1 bg-customBg px-4" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
                {/* Header Logo */}
                <View className="flex-row justify-start py-3">
                    <TouchableOpacity onPress={() => router.push('/')} >
                        <Image
                            source={require('../../../assets/images/logo-rerun.png')}
                            style={{ width: 100, height: 100 }}
                            resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Movie Poster */}
                <View className="items-center my-4">
                    <View
                        style={{
                            width: posterWidth,
                            aspectRatio: posterAspectRatio,
                        }}
                    >
                        <Image
                            source={{
                                uri: data?.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${data?.poster_path}`
                                    : 'https://via.placeholder.com/400?text=No_Poster',
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 12,
                                resizeMode: 'cover',
                            }}
                        />
                    </View>
                    <TouchableOpacity className="absolute bottom-0 bg-black/60 rounded-md px-5 py-5" onPress={handleAddToList}>
                        <Text className="text-white font-bold text-xs">+ Add to list</Text>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <View className="items-center mb-2">
                    <Text className="text-white text-2xl font-bold">{data?.title}</Text>
                    <Text className="text-gray-400 text-sm">{`${data?.release_date} • ${data?.runtime}`}</Text>
                </View>

                {/* Genres */}
                <View className="flex-row justify-center my-2">
                    <View className="flex-row justify-center my-2 flex-wrap">
                        {data?.genres &&
                            data.genres.map((genre, index) => (
                                <View key={genre.id || index} className="bg-white/10 px-3 py-1 rounded-full mx-1 my-1">
                                    <Text className="text-white text-xs">{genre.name}</Text>
                                </View>
                            ))}
                    </View>
                </View>

                {/* Overview */}
                <View className="px-4 my-4">
                    <Text className="text-white text-sm text-center">{data?.overview}</Text>
                </View>

                {/* Rating */}
                <View className="items-center my-4">
                    <View className="flex-row justify-center mb-2">
                        {[...Array(10)].map((_, index) => (
                            <FontAwesome
                                key={index}
                                name={index < Math.floor(data?.vote_average || 0) ? 'star' : 'star-o'}
                                size={24}
                                color="gold"
                            />
                        ))}
                    </View>
                    <Text className="text-gray-400 text-sm">{data?.vote_count} Reviews</Text>
                </View>

                {/* Providers */}
                {providers ? (
                    providers.flatrate.length > 0 ? (
                        <View className="px-4 my-4">
                            <Text className="text-white text-lg font-bold text-center">Streaming Options for {userCountry}</Text>
                            <View className="flex-row flex-wrap justify-center mt-2">
                                {providers.flatrate.map((provider, index) => (
                                    <View key={index} className="m-2 items-center">
                                        <Image
                                            className="w-16 h-16 rounded-lg"
                                            source={{
                                                uri: `https://image.tmdb.org/t/p/w500${provider.logo_path}`,
                                            }}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View className="px-4 my-4">
                            <Text className="text-white text-lg font-bold text-center">
                                No streaming options available for {userCountry}.
                            </Text>
                        </View>
                    )
                ) : (
                    <View className="px-4 my-4">
                        <Text className="text-white text-lg font-bold text-center">
                            Unable to fetch streaming options. Please try again later.
                        </Text>
                    </View>
                )}

                <View>
                    <Text className="font-bold text-2xl m-3 w-90% border-b-2 border-b-white text-white">Recommendations</Text>
                    <MovieCards movies={recommendedMovies} />
                </View>
            </ScrollView>
        </SafeAreaProvider>
    );
};

export default Movie;
