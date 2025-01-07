import { View, Text, Image, TouchableOpacity, FlatList, Modal } from 'react-native'
import Slider from '@react-native-community/slider';
import React, { useCallback, useEffect, useState } from 'react'
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getWatchlist, removeFromWatchlist, updateProgress } from '@/app/api/watchListService';
import { auth } from '@/firebase';
import { addToFinishedlist, getFinishedlist, removeFromFinishedlist, updateRating } from '@/app/api/finishedListService';

const list = () => {
    const [selectedCategory, setSelectedCategory] = useState('watching');

    const handleSearch = () => { };
    const router = useRouter();

    const user = auth.currentUser;

    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [finishedList, setFinishedList] = useState<any[]>([]);
    const [currentRating, setCurrentRating] = useState(0);
    const [currentProgress, setCurrentProgress] = useState(0);
    let currentProgressHours = `${Math.floor(currentProgress / 60)}h ${currentProgress % 60}m`

    const [containerHeight, setContainerHeight] = useState<number | null>(null);

    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

    const loadLists = async () => {
        try {
            const watchtListData = await getWatchlist(user?.uid!);
            setWatchlist(watchtListData);
            console.log("Watchlist data:", watchtListData)

            const finishedListData = await getFinishedlist(user?.uid!);
            setFinishedList(finishedListData)
            console.log("Finished list data:", finishedListData)


        } catch (error) {
            console.error('Error loading watchlist:', error);
        } finally {
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadLists();
            }
        }, [user])
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

    const handleRemoveFromWatchlist = async (movieId: string) => {
        try {
            await removeFromWatchlist(user?.uid!, movieId)
            loadLists();
        }
        catch (error) {
            console.error('Error removing from watchlist:', error)
        }
    }

    const handleRemoveFromFinishedlist = async (movieId: string) => {
        try {
            await removeFromFinishedlist(user?.uid!, movieId)
            loadLists();
        }
        catch (error) {
            console.error('Error removing from watchlist:', error)
        }
    }

    const handleUpdateProgress = async (movieId: string, newProgress: number) => {
        try {
            await updateProgress(user?.uid!, movieId, newProgress)
            loadLists()
        } catch (error) {
            console.error('Error updating progress:', error)
        }
    }

    const handleUpdateRating = async (movieId: string, rating: number) => {
        try {
            await updateRating(user?.uid!, movieId, rating)
            loadLists()
        } catch (error) {
            console.error('Error updating rating:', error)
        }
    }



    const displayedList = selectedCategory === 'watching' ? watchlist : finishedList;

    const togglePopup = (movie: any | null) => {
        setSelectedMovie(movie);
        if (movie) {
            setCurrentRating(movie.rating || 0);
            setCurrentProgress(movie.progress || 0);
        }
    };

    const handleSave = async () => {
        if (selectedMovie) {
            if (selectedCategory === 'watching') {
                await handleUpdateProgress(selectedMovie.movieId, selectedMovie.progress || 0);
            } else {
                await handleUpdateRating(selectedMovie.movieId, currentRating);
            }
            togglePopup(null);
        }
    };

    const renderMovieItem = ({ item }: { item: any }) => (
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

                <Text className="text-white text-lg font-bold mb-2">{item.movieTitle}</Text>

                <Text className="text-gray-400 mb-2">
                    {selectedCategory === 'watching' ? (
                        `Progress: ${Math.floor(item.progress / 60)}h ${item.progress % 60}m / ${item.length}`
                    ) : (
                        <View className="items-start mt-1">
                            <Text className="text-gray-400">{item.length}</Text>
                            <View className="flex-row mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FontAwesome
                                        key={star}
                                        name={item.rating >= star ? 'star' : 'star-o'}
                                        size={16} // Adjust size as needed
                                        color="gold"
                                        style={{ marginRight: 4 }} // Add spacing between stars
                                    />
                                ))}
                            </View>
                        </View>
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

            {selectedMovie && (
                <Modal
                    transparent
                    visible={!!selectedMovie}
                    animationType="fade"
                    onRequestClose={() => togglePopup(null)}
                >
                    <View className="flex-1 bg-black/50 justify-center items-center">
                        <View className="bg-customBg p-4 rounded-lg w-4/5 items-center">
                            <Text className="text-white text-lg font-bold mb-4">{selectedMovie.movieTitle}</Text>
                            {selectedCategory === 'watching' ? (
                                <>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={0}
                                        maximumValue={selectedMovie.length_minutes}
                                        value={Number(selectedMovie.progress) || 0}
                                        onValueChange={(value) => {
                                            setSelectedMovie({
                                                ...selectedMovie,
                                                progress: Math.round(value),
                                            });
                                        }}
                                        minimumTrackTintColor="#FFFFFF"
                                        maximumTrackTintColor="#888"
                                    />
                                    <Text className="text-gray-400 mb-4">{`Progress: ${Math.floor(
                                        selectedMovie.progress / 60
                                    )}h ${selectedMovie.progress % 60}m / ${selectedMovie.length}`}</Text>
                                    <TouchableOpacity
                                        className="bg-indigo-500 rounded-lg py-2 px-4 w-full mb-4"
                                        onPress={async () => {
                                            console.log('Mark as Finished');
                                            await handleAddToFinished(selectedMovie);
                                            togglePopup(null);
                                        }}
                                    >
                                        <Text className="text-white font-bold text-center">Finished</Text>
                                    </TouchableOpacity>
                                </>
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
                                            await handleRemoveFromWatchlist(selectedMovie.movieId);
                                        } else {
                                            await handleRemoveFromFinishedlist(selectedMovie.movieId);
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

            <View className="flex-row justify-between items-center px-5 py-3">
                <TouchableOpacity onPress={() => router.push('/')} >
                    <Image
                        source={require('../../../assets/images/logo-rerun.png')}
                        style={{ width: 100, height: 100 }}
                        resizeMode="contain" />
                </TouchableOpacity>
                <FontAwesome className="text-right m-3" color={"white"} size={28} name="search" onPress={handleSearch} />
            </View>


            <View className="flex-row justify-center m-5 border-b-2 border-b-slate-500">
                <TouchableOpacity
                    className={`px-5 py-2 mx-2 rounded-lg bg-transparent'
                        }`}
                    onPress={() => setSelectedCategory('watching')}
                >
                    <Text
                        className={`text-white text-xl px-2 font-bold ${selectedCategory === 'watching' ? 'border-b-2 border-b-purple-300' : 'border-b-0'
                            }`}
                    >
                        Watching
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`px-5 py-2 mx-2 rounded-lg bg-transparent'
                        }`}
                    onPress={() => setSelectedCategory('finished')}
                >
                    <Text
                        className={`text-white text-xl px-2 font-bold ${selectedCategory === 'finished' ? 'border-b-2 border-b-purple-300' : 'border-b-0'
                            }`}
                    >
                        Finished
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={displayedList}
                renderItem={renderMovieItem}
                keyExtractor={(item) => item.movieId.toString()}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                ListEmptyComponent={
                    <Text className="text-center text-gray-400 mt-5">
                        No items in this category.
                    </Text>
                }
            />
        </View>
    );
}

export default list


