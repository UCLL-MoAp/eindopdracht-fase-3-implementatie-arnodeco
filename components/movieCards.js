import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import MovieCard from './movieCard'

const MovieCards = ({ movies, bool = true }) => {
    const isHorizon = bool;
    return (
        <View>
            {
                movies?.length > 0
                    ? (
                        isHorizon ? (<ScrollView horizontal>{movies.map((movie) => (<MovieCard key={movie.id} movie={movie} />))}</ScrollView>)
                            :
                            (<View className="flex-row flex-wrap justify-center">
                                {movies.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </View>)
                    ) :
                    (
                        <Text className='text-2xl font-medium m-5'>No movies found</Text>
                    )
            }
        </View>
    )
}

export default MovieCards