import { View, Text, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons'
import { auth } from '../../../firebase';
import { updateProfile, signOut } from 'firebase/auth';

const user = () => {

    const user = auth.currentUser;
    const [displayNameInput, setDisplayNameInput] = useState(user?.displayName ?? '');

    const [isEditable, setIsEditable] = useState(false);

    const handleToggleEdit = () => {
        setIsEditable((prev) => !prev);
        setIsVisible((prev) => !prev);
    };

    const handleSettings = () => { };

    const handleSave = async () => {
        alert("Saved!");
        await updateProfile(auth.currentUser!, {
            displayName: displayNameInput,
        });
        setIsEditable(false);
        setIsVisible(false);
    };

    const handleCancel = () => {
        setDisplayNameInput(auth.currentUser?.displayName ?? '');
        setIsEditable(false);
        setIsVisible(false);
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    const [isVisible, setIsVisible] = useState(false);

    return (
        <SafeAreaView className='bg-pink-950 h-full'>
            <FontAwesome className="text-right mb-10 mx-5" color={"white"} size={28} name="cog" onPress={handleSettings} />

            <View className="bg-customBg p-5 rounded-lg">

                <View className="flex-row justify-between items-center px-5 py-3">
                    <Image
                        source={require('../../../assets/images/luffy.png')}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                        resizeMode="contain" />
                    {!isVisible && (<FontAwesome className="text-right m-3" color={"white"} size={28} name="edit" onPress={handleToggleEdit} />)}

                    {isVisible && (
                        <View className="flex-row justify-between items-center px-5 py-3">
                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-transparent m-10">
                                <Text className="text-white text-center">Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCancel}
                                className="bg-transparent">
                                <Text className="text-white text-center">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View className="mb-5">
                    <Text className='text-zinc-500'>Display Name</Text>
                    <TextInput
                        className="bg-transparent text-zinc-500 text-xl rounded-lg pb-0 mb-2 border-b-2 border-zinc-500"
                        editable={isEditable}
                        value={displayNameInput}
                        onChangeText={setDisplayNameInput}
                        placeholder="Name"
                        placeholderTextColor="#9CA3AF" />
                </View>

                <View className="mb-5">
                    <Text className='text-zinc-500'>E-mail</Text>
                    <TextInput
                        className="bg-transparent text-zinc-500 text-xl rounded-lg pb-0 mb-2 border-b-2 border-zinc-500"
                        value={user?.email ?? "E-mail"}
                        placeholder="Mail"
                        placeholderTextColor="#9CA3AF" />
                </View>

                <View className="mb-5">
                    <Text className='text-zinc-500'>User Id</Text>
                    <TextInput
                        className="bg-transparent text-zinc-500 text-xl rounded-lg pb-0 mb-2 border-b-2 border-zinc-500"
                        editable={isEditable}
                        value={user?.uid ?? "ID"}
                        placeholder="Phone"
                        placeholderTextColor="#9CA3AF" />
                </View>

                <Link href={"/"} className="font-bold text-center mt-10 text-zinc-500 text-lg underline">Change Password</Link>
                <Link onPress={handleLogout} href={"../../signin"} className="font-bold text-center mt-10 text-zinc-500 text-lg underline">Logout</Link>
            </View>
        </SafeAreaView>
    )
}

export default user