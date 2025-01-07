import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { FontAwesome } from '@expo/vector-icons'
import { useRouter } from 'expo-router';

const friends = () => {
    const handleSearch = () => { };

    const router = useRouter();

    return (
        <ScrollView className="bg-customBg">
            <View className="flex-row justify-between items-center px-5 py-3">
                <TouchableOpacity onPress={() => router.push('/')} >
                    <Image
                        source={require('../../../assets/images/logo-rerun.png')}
                        style={{ width: 100, height: 100 }}
                        resizeMode="contain" />
                </TouchableOpacity>
                <FontAwesome className="text-right m-3" color={"white"} size={28} name="search" onPress={handleSearch} />
            </View>


            <View>
                <Text className="font-bold text-lg m-3 w-90% border-b-2 border-b-white text-white">Friends recent activity</Text>
                <ScrollView horizontal={true}>

                </ScrollView>
            </View>


        </ScrollView>

    )
}

export default friends