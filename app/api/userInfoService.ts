// src/firebase/userInfo.ts
import { ImageSourcePropType } from 'react-native';
import { db } from '../../firebase';
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    serverTimestamp,
    Timestamp,
    updateDoc,
} from 'firebase/firestore';

interface UserInfo {
    userId: string;
    username: string;
    profilePicture?: string;
    timestamp?: string;
}

// Add user info when user registers
export async function addUserInfo(userId: string, username: string, profilePicture?: string) {
    const userDoc = doc(db, 'userInfo', userId);
    await setDoc(userDoc, {
        userId,
        username,
        profilePicture,
        timestamp: serverTimestamp(),
    });
}

// Update profile picture
export async function updateProfilePicture(userId: string, profilePictureUrl: string) {
    const userDoc = doc(db, 'userInfo', userId);
    await updateDoc(userDoc, {
        profilePicture: profilePictureUrl
    });
}

export const updateUserInfo = async (
    userId: string,
    avatarName: string,
    displayName: string
  ) => {
    try {
      const userRef = doc(db, 'userInfo', userId);
      
      // Check if the document exists
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        // If document doesn't exist, create it with initial data
        await setDoc(userRef, {
          userId,
          username: displayName,
          profilePicture: avatarName,
        });
      } else {
        // If document exists, update only the necessary fields
        await setDoc(userRef, {
          username: displayName,
          profilePicture: avatarName,
        }, { merge: true }); // Using merge: true to only update specified fields
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      throw error;
    }
  };

// Get user info by ID
export async function getUserInfo(userId: string): Promise<UserInfo | null> {
    const userDoc = doc(db, 'userInfo', userId);
    const docSnap = await getDoc(userDoc);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    const timestamp = data.timestamp instanceof Timestamp
        ? data.timestamp.toDate().toLocaleString()
        : '';
        
    return {
        ...data,
        timestamp,
    } as UserInfo;
}

// Search users by username
export async function searchUsers(searchQuery: string): Promise<UserInfo[]> {
    const usersRef = collection(db, 'userInfo');
    const q = query(
        usersRef,
        where('username', '>=', searchQuery),
        where('username', '<=', searchQuery + '\uf8ff')
    );
    
    const snapshot = await getDocs(q);
    const users: UserInfo[] = [];
    
    snapshot.forEach((doc) => {
        const data = doc.data();
        users.push(data as UserInfo);
    });
    
    return users;
}

const avatars: { name: string; source: ImageSourcePropType }[] = [
    {
      name: "default",
      source: require("../../assets/images/avatars/default.png"),
    },
    {
      name: "luffy",
      source: require("../../assets/images/avatars/luffy.png"),
    },
    {
      name: "ironman",
      source: require("../../assets/images/avatars/ironman.png"),
    },
    {
      name: "starwars",
      source: require("../../assets/images/avatars/starwars.png"),
    },
    {
      name: "spiderman",
      source: require("../../assets/images/avatars/spiderman.png"),
    },
    {
      name: "mario",
      source: require("../../assets/images/avatars/mario.png"),
    },
    {
      name: "aang",
      source: require("../../assets/images/avatars/aang.png"),
    },
    {
      name: "mickey",
      source: require("../../assets/images/avatars/mickey.png"),
    },
    {
      name: "minion",
      source: require("../../assets/images/avatars/minion.png"),
    },
    {
      name: "olaf",
      source: require("../../assets/images/avatars/olaf.png"),
    },
    {
      name: "walle",
      source: require("../../assets/images/avatars/walle.png"),
    },
    {
      name: "pirate",
      source: require("../../assets/images/avatars/pirate.png"),
    },
  ];
  
  export function getAvatarUrl(avatarName: string): ImageSourcePropType {
    // Find the avatar object by name
    const avatar = avatars.find((avatar) => avatar.name === avatarName);
  
    // If an avatar is found, return the source; otherwise, return the default avatar
    return avatar
      ? avatar.source
      : avatars.find((avatar) => avatar.name === "default")!.source;
  }