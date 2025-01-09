import { db } from '../../firebase';
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    serverTimestamp,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';

export interface FriendData {
    userId: string;
    timestamp?: string;
}

// Add a friend
export async function addFriend(userId: string, friendId: string) {
    const friendDoc = doc(db, 'users', userId, 'friends', friendId);
    await setDoc(friendDoc, {
        userId: friendId,
        timestamp: serverTimestamp(),
    });
}

// Remove a friend
export async function removeFriend(userId: string, friendId: string) {
    const friendDoc = doc(db, 'users', userId, 'friends', friendId);
    await deleteDoc(friendDoc);
}

// Get all friends for a user
export async function getFriends(userId: string): Promise<FriendData[]> {
    const friendsRef = collection(db, 'users', userId, 'friends');
    const snapshot = await getDocs(friendsRef);
    const friends: FriendData[] = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toLocaleString()
            : '';

        friends.push({
            ...data,
            timestamp,
        } as FriendData);
    });

    return friends;
}

// Check if users are friends
export async function checkFriendship(userId: string, friendId: string): Promise<boolean> {
    const friendDoc = doc(db, 'users', userId, 'friends', friendId);
    const docSnap = await getDoc(friendDoc);
    return docSnap.exists();
}