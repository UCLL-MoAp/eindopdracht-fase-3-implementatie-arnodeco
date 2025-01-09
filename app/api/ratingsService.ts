// src/firebase/ratings.ts
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
    query,
    orderBy,
} from 'firebase/firestore';

export interface RatingData {
    movieId: string;
    movieTitle: string;
    rating: number;
    userName: string;
    avatarName: string,
    timestamp?: string;
}

// Add a rating for a movie
export async function addRating(userId: string, movieData: {
    movieId: string;
    movieTitle: string;
    rating: number;
    userName: string;
    avatarName: string
}) {
    const ratingDoc = doc(db, 'users', userId, 'ratings', movieData.movieId);
    await setDoc(ratingDoc, {
        ...movieData,
        timestamp: serverTimestamp(),
    });
}

// Get all ratings for a specific user
export async function getUserRatings(userId: string): Promise<RatingData[]> {
    const ratingsRef = collection(db, 'users', userId, 'ratings');
    const snapshot = await getDocs(ratingsRef);
    const ratings: RatingData[] = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toLocaleString()
            : '';

        ratings.push({
            ...data,
            timestamp,
        } as RatingData);
    });

    return ratings;
}

// Get friend's recent ratings
export async function getFriendsRatings(friendIds: string[]): Promise<RatingData[]> {
    if (friendIds.length === 0) return [];

    const ratings: RatingData[] = [];

    // Get ratings for each friend
    for (const friendId of friendIds) {
        const ratingsRef = collection(db, 'users', friendId, 'ratings');
        const q = query(
            ratingsRef,
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp instanceof Timestamp
                ? data.timestamp.toDate().toLocaleString()
                : '';

            ratings.push({
                ...data,
                timestamp,
            } as RatingData);
        });
    }

    // Sort all ratings by timestamp (most recent first)
    return ratings.sort((a, b) => {
        return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    });
}

// Update an existing rating
export async function updateRating(userId: string, movieId: string, newRating: number) {
    const ratingDoc = doc(db, 'users', userId, 'ratings', movieId);
    await setDoc(ratingDoc, {
        rating: newRating,
        timestamp: serverTimestamp(),
    }, { merge: true });
}

// Update avatar in db when user changes is (so friends activity page avatar stays up to date)
export async function updateRatingAvatarForAll(userId: string, newAvatar: string) {
    try {
        const ratingsCollection = collection(db, 'users', userId, 'ratings');
        const ratingsSnapshot = await getDocs(ratingsCollection);

        const updatePromises = ratingsSnapshot.docs.map((docSnapshot) => {
            const ratingDoc = doc(db, 'users', userId, 'ratings', docSnapshot.id);
            return setDoc(ratingDoc, { avatarName: newAvatar }, { merge: true });
        });

        // updates run concurrently -> more efficient
        await Promise.all(updatePromises);

        console.log(`Successfully updated avatarName to ${newAvatar} for all ratings of user ${userId}`);
    } catch (error) {
        console.error("Error updating avatarName for ratings:", error);
    }
}

// Delete a rating
export async function deleteRating(userId: string, movieId: string) {
    const ratingDoc = doc(db, 'users', userId, 'ratings', movieId);
    await deleteDoc(ratingDoc);
}