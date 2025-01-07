import { View, Text, TextInput, Alert, Button } from 'react-native'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useRouter } from 'expo-router';


const signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    // Handle Sign-Up
    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert('User created', `Welcome ${userCredential.user.email}`);
        } catch (error) {
            // Alert.alert('Sign-Up Error', error.message);
        }
    };

    // Handle Sign-In
    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            Alert.alert('Logged in', `Welcome back ${userCredential.user.email}`);
            router.replace("/")
        } catch (error) {
            // Alert.alert('Sign-In Error', error.message);
        }
    };

    return (
        <View >
            <Text>Firebase Email/Password Auth</Text>

            <TextInput

                placeholder="Email"
                value={email}
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
            />

            <TextInput

                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
            />

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Button title="Sign Up" onPress={handleSignUp} />
                <View style={{ width: 20 }} />
                <Button title="Sign In" onPress={handleSignIn} />
            </View>
        </View>
    );
}

export default signin