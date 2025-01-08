import { View, Text, Image, TouchableOpacity, FlatList, Modal } from 'react-native'
import Slider from '@react-native-community/slider';
import React, { useCallback, useEffect, useState } from 'react'
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getWatchlist, removeFromWatchlist, updateProgress } from '@/app/api/watchListService';
import { auth } from '@/firebase';
import { addToFinishedlist, getFinishedlist, removeFromFinishedlist, updateRating } from '@/app/api/finishedListService';
import { getSeriesWatchlist, removeFromSeriesWatchlist, updateSeriesProgress } from '@/app/api/seriesWatchListService';

const list = () => {
    const [selectedContent, setSelectedContent] = useState('movies');
    const [selectedCategory, setSelectedCategory] = useState('watching');

    const handleSearch = () => { };
    const router = useRouter();

    const user = auth.currentUser;

    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [finishedList, setFinishedList] = useState<any[]>([]);
    const [currentRating, setCurrentRating] = useState(0);
    const [currentProgress, setCurrentProgress] = useState(0);

    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

    const [containerHeight, setContainerHeight] = useState<number | null>(null);

    const [selectedMovieOrSeries, setSelectedMovieOrSeries] = useState<any | null>(null);


    const loadLists = async () => {
        try {
            if (selectedContent === 'movies') {
                const movieWatchlist = await getWatchlist(user?.uid!);
                const movieFinishedList = await getFinishedlist(user?.uid!);
                setWatchlist(movieWatchlist);
                setFinishedList(movieFinishedList);
            } else {
                const seriesWatchlist = await getSeriesWatchlist(user?.uid!);
                console.log("SERIES LOADED:", seriesWatchlist)
                setWatchlist(seriesWatchlist);
                //setFinishedList([]); 
            }
        } catch (error) {
            console.error('Error loading lists:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadLists();
            }
        }, [user, selectedContent])
    );

    const handleAddToFinished = async (movie: any) => {
        const movieToAdd = {
            movieId: movie.movieId,
            movieTitle: movie.movieTitle,
            posterUrl: movie.posterUrl,
            length: movie.length,
            length_minutes: movie.length_minutes,
            rating: 0,
            dateAdded: movie.dateAdded
        }
        try {
            await addToFinishedlist(user?.uid!, movieToAdd);
            await removeFromWatchlist(user?.uid!, movie.movieId)
            loadLists();
        }
        catch (error) {
            console.error('Error adding to finished list:', error)
        }
    }

    const handleRemoveFromWatchlist = async (itemId: string) => {
        try {
            if (selectedContent === 'movies') {
                await removeFromWatchlist(user?.uid!, itemId);
            } else {
                await removeFromSeriesWatchlist(user?.uid!, itemId);
            }
            loadLists();
        } catch (error) {
            console.error('Error removing from watchlist:', error);
        }
    };

    const handleRemoveFromFinishedlist = async (itemId: string) => {
        try {
            if (selectedContent === "movies") {
                await removeFromFinishedlist(user?.uid!, itemId)
            }
            else {
                //await removeFromSeriesFinishedList(user?.uid!, itemId)
            }
            loadLists();
        }
        catch (error) {
            console.error('Error removing from watchlist:', error)
        }
    }

    const handleUpdateProgress = async (itemId: string, newProgress: number, seasonProgress?: number) => {
        try {
            if (selectedContent === 'movies') {
                await updateProgress(user?.uid!, itemId, newProgress);
            } else {
                await updateSeriesProgress(user?.uid!, itemId, selectedSeason || 1, selectedEpisode || 0);
            }
            loadLists();
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleUpdateRating = async (movieId: string, rating: number) => {
        try {
            await updateRating(user?.uid!, movieId, rating)
            loadLists()
        } catch (error) {
            console.error('Error updating rating:', error)
        }
    }

    const displayedList = selectedCategory === 'watching' ? watchlist : finishedList;

    const togglePopup = (item: any | null) => {
        setSelectedMovieOrSeries(item);
        if (item) {
            setCurrentRating(item.rating || 0);
            setCurrentProgress(item.progress || 0);
        }
    };

    const handleSave = async () => {
        if (selectedMovieOrSeries) {
            if (selectedCategory === 'watching') {
                await handleUpdateProgress(selectedMovieOrSeries.movieId || selectedMovieOrSeries.seriesId, selectedMovieOrSeries.progress || 0);
            } else {
                await handleUpdateRating(selectedMovieOrSeries.movieId, currentRating);
            }
            togglePopup(null);
        }
    };

    const renderMovieOrSeriesItem = ({ item }: { item: any }) => (
        <View className="flex-row my-3">

            <Image
                className="w-32 h-48 border border-white"
                source={{ uri: item.posterUrl }}
                resizeMode="cover"
            />

            <View
                className="ml-4 flex-1 relative"
            >

                <TouchableOpacity
                    style={{ alignSelf: 'flex-end', marginBottom: 4 }}
                    onPress={() => togglePopup(item)}
                >
                    <FontAwesome color={"white"} size={18} name="bars" />
                </TouchableOpacity>

                <Text className="text-white text-lg font-bold mb-2">{item.movieTitle || item.seriesTitle}</Text>

                <Text className="text-gray-400 mb-2">
                    {selectedContent === 'movies' ? (
                        selectedCategory === 'watching' ? (
                            `Progress: ${Math.floor(item.progress / 60)}h ${item.progress % 60}m / ${item.length}`
                        ) : (
                            <View className="items-start mt-1">
                                <Text className="text-gray-400">{item.length}</Text>
                                <View className="flex-row mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FontAwesome
                                            key={star}
                                            name={item.rating >= star ? 'star' : 'star-o'}
                                            size={16}
                                            color="gold"
                                            style={{ marginRight: 4 }}
                                        />
                                    ))}
                                </View>
                            </View>
                        )
                    ) : (
                        `Progress: Season ${item.seasonsProgress}, Episode ${item.episodesProgress}`
                    )}
                </Text>

                <View className="absolute bottom-0">
                    <Text className="text-gray-400 text-xs m-1">
                        {selectedCategory === 'watching'
                            ? `Last Updated: ${item.lastUpdated?.toString() || 'N/A'}`
                            : `Finished On: ${item.dateFinished?.toString() || 'N/A'}`}

                    </Text>
                    <Text className="text-gray-400 text-xs m-1">
                        Added To List: {item.dateAdded?.toString()}
                    </Text>
                </View>
            </View>

            {selectedMovieOrSeries && (
                <Modal
                    transparent
                    visible={!!selectedMovieOrSeries}
                    animationType="fade"
                    onRequestClose={() => togglePopup(null)}
                >
                    <View className="flex-1 bg-black/50 justify-center items-center">
                        <View className="bg-customBg p-4 rounded-lg w-4/5 items-center">
                            <Text className="text-white text-lg font-bold mb-4">{selectedMovieOrSeries.movieTitle || selectedMovieOrSeries.seriesTitle}</Text>
                            {selectedCategory === 'watching' ? (
                                selectedContent === 'movies' ? (
                                    <>
                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={selectedMovieOrSeries.length_minutes}
                                            value={Number(selectedMovieOrSeries.progress) || 0}
                                            onValueChange={(value) => {
                                                setSelectedMovieOrSeries({
                                                    ...selectedMovieOrSeries,
                                                    progress: Math.round(value),
                                                });
                                            }}
                                            minimumTrackTintColor="#FFFFFF"
                                            maximumTrackTintColor="#888"
                                        />
                                        <Text className="text-gray-400 mb-4">{`Progress: ${Math.floor(
                                            selectedMovieOrSeries.progress / 60
                                        )}h ${selectedMovieOrSeries.progress % 60}m / ${selectedMovieOrSeries.length}`}</Text>
                                        <TouchableOpacity
                                            className="bg-indigo-500 rounded-lg py-2 px-4 w-full mb-4"
                                            onPress={async () => {
                                                console.log('Mark as Finished');
                                                await handleAddToFinished(selectedMovieOrSeries);
                                                togglePopup(null);
                                            }}
                                        >
                                            <Text className="text-white font-bold text-center">Finished</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-white font-bold mb-2">Select a Season:</Text>
                                        <View className="flex-row flex-wrap justify-center mb-4">
                                            {selectedMovieOrSeries.episodesPerSeason.map((episodes: number, seasonIndex: number) => (
                                                <TouchableOpacity
                                                    key={seasonIndex}
                                                    className="bg-gray-700 px-3 py-1 rounded-full mx-1 mb-2"
                                                    onPress={() => setSelectedSeason(seasonIndex + 1)}
                                                >
                                                    <Text className="text-white text-sm">Season {seasonIndex + 1}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        {selectedSeason && (
                                            <>
                                                <Text className="text-white font-bold mb-2">Episodes in Season {selectedSeason}:</Text>
                                                <View className="flex-row flex-wrap justify-center mb-4">
                                                    {Array.from({ length: selectedMovieOrSeries.episodesPerSeason[selectedSeason - 1] }).map((_, episodeIndex) => (
                                                        <TouchableOpacity
                                                            key={episodeIndex}
                                                            className={`${selectedEpisode === episodeIndex + 1 ? 'bg-blue-500' : 'bg-gray-700'
                                                                } px-3 py-1 rounded-full mx-1 mb-2`}
                                                            onPress={() => setSelectedEpisode(episodeIndex + 1)}
                                                        >
                                                            <Text className="text-white text-sm">Ep {episodeIndex + 1}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </>
                                        )}
                                    </>
                                )
                            ) : (
                                <View className="flex-row justify-center mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} onPress={() => setCurrentRating(star)}>
                                            <FontAwesome
                                                name={currentRating >= star ? 'star' : 'star-o'}
                                                size={28}
                                                color="gold"
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity
                                className="bg-green-500 rounded-lg py-2 px-4 w-full mb-4"
                                onPress={handleSave}
                            >
                                <Text className="text-white font-bold text-center">Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => togglePopup(null)}
                                className="py-2"
                            >
                                <TouchableOpacity
                                    onPress={async () => {
                                        console.log('Removed from list');
                                        if (selectedCategory === 'watching') {
                                            await handleRemoveFromWatchlist(selectedMovieOrSeries.movieId || selectedMovieOrSeries.seriesId);
                                        } else {
                                            await handleRemoveFromFinishedlist(selectedMovieOrSeries.movieId || selectedMovieOrSeries.seriesId);
                                        }
                                        togglePopup(null);
                                    }}
                                >
                                    <Text className="text-red-500 text-sm">Remove from list</Text>
                                </TouchableOpacity>
                                <Text className="text-red-500 text-sm">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-customBg">
            {/* Header */}
            <View className="flex-row justify-between items-center px-5 py-3">
                <TouchableOpacity onPress={() => router.push('/')}>
                    <Image
                        source={require('../../../assets/images/logo-rerun.png')}
                        style={{ width: 100, height: 100 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            {/* Content Toggle: Movies / Series */}
            <View className="flex-row justify-center m-5">
                <TouchableOpacity
                    className={`px-5 py-2 mx-2 rounded-lg ${selectedContent === 'movies' ? 'bg-purple-300' : 'bg-transparent'}`}
                    onPress={() => setSelectedContent('movies')}
                >
                    <Text className="text-white text-xl font-bold">Movies</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`px-5 py-2 mx-2 rounded-lg ${selectedContent === 'series' ? 'bg-purple-300' : 'bg-transparent'}`}
                    onPress={() => setSelectedContent('series')}
                >
                    <Text className="text-white text-xl font-bold">Series</Text>
                </TouchableOpacity>
            </View>

            {/* Category Tabs: Watching / Finished */}
            <View className="flex-row justify-center m-5 border-b-2 border-b-slate-500">
                <TouchableOpacity
                    className={`px-5 py-2 mx-2 rounded-lg bg-transparent`}
                    onPress={() => setSelectedCategory('watching')}
                >
                    <Text
                        className={`text-white text-xl px-2 font-bold ${selectedCategory === 'watching' ? 'border-b-2 border-b-purple-300' : 'border-b-0'}`}
                    >
                        Watching
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`px-5 py-2 mx-2 rounded-lg bg-transparent`}
                    onPress={() => setSelectedCategory('finished')}
                >
                    <Text
                        className={`text-white text-xl px-2 font-bold ${selectedCategory === 'finished' ? 'border-b-2 border-b-purple-300' : 'border-b-0'}`}
                    >
                        Finished
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={displayedList}
                renderItem={renderMovieOrSeriesItem}
                keyExtractor={(item) => (item.movieId || item.seriesId).toString()}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ListEmptyComponent={
                    <Text className="text-center text-gray-400 mt-5">No items in this category.</Text>
                }
            />
        </View>
    );
}

export default list


