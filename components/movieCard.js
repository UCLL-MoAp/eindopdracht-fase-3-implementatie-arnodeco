import { View, Text, Image, Pressable, Platform } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons'
import CustomText from "@/components/customText";

const MovieCard = ({ movie }) => {
    const rating = Number(movie.vote_average.toFixed(1));
    const release_date = movie.release_date || movie.first_air_date
    const release_year = release_date ? release_date.slice(0, 4) : "Not found"

    let type = "";

    if (movie.release_date) {
        type = "movie"
    }
    else if (movie.first_air_date) {
        type = "tv"
    }

    return (
        <Pressable onPress={() => router.push({
            pathname: '/movies/[id]',
            params: { id: movie.id, type: type },
        })}>
            <View style={{ borderRadius: 7, overflow: 'hidden' }} className={`relative m-2 flex flex-wrap rounded-lg  ${Platform.OS === "web" ? "3xl:h-132 3xl:w-88 h-96 w-64" : "h-96 w-64"}`}>
                <Image
                    //Image width/size (w300 in the uri) is smaller for performance gains
                    source={{
                        uri: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/400?text=No_Poster'
                    }}
                    className="w-full h-full"
                />
                <CustomText className="absolute top-0 p-1 bg-white text-black">{rating} <FontAwesome name="star" /></CustomText>
                <CustomText className="absolute top-0 right-0 p-1 bg-white text-black">{release_year}</CustomText>
                <View style={{ backgroundColor: 'rgba(71, 85, 105, 0.75)' }} className="absolute bottom-0 w-full p-1">
                    <CustomText className={`text-white text-center  ${Platform.OS === "web" ? "3xl:text-2xl 2xl:text-xl" : ""}`}>{movie.title || movie.name}</CustomText>
                </View>
            </View>
        </Pressable>
    )
}

export default MovieCard