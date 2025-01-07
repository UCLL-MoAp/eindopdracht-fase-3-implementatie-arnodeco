import { db } from '../../firebase';
import {
    doc,
    setDoc,
    updateDoc,
    getDoc,
    getDocs,
    collection,
    serverTimestamp,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';

interface MovieData {
    movieId: string;
    movieTitle: string,
    posterUrl: string;
    length: string;
    length_minutes: number;
    progress?: string;
    dateAdded?: string;
    lastUpdated?: string;
}

export async function addToWatchlist(userId: string, movie: MovieData) {
    const docRef = doc(db, 'users', userId, 'watchlist', movie.movieId);
    await setDoc(docRef, {
        ...movie,
        progress: movie.progress ?? 0,
        dateAdded: serverTimestamp(),
        lastUpdated: serverTimestamp(),
    });
}

export async function getWatchlist(userId: string): Promise<MovieData[]> {
    const colRef = collection(db, 'users', userId, 'watchlist');
    const snapshot = await getDocs(colRef);
    const result: MovieData[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Safely handle Firestore Timestamp conversion
        const dateAdded =
            data.dateAdded instanceof Timestamp
                ? data.dateAdded.toDate().toLocaleString()
                : '';
        const lastUpdated =
            data.lastUpdated instanceof Timestamp
                ? data.lastUpdated.toDate().toLocaleString()
                : '';

        result.push({
            ...data,
            dateAdded,
            lastUpdated,
        } as MovieData);
    });
    return result;
}

export async function updateProgress(
    userId: string,
    movieId: string,
    newProgress: number
) {
    const docRef = doc(db, 'users', userId, 'watchlist', movieId);
    await updateDoc(docRef, {
        progress: newProgress,
        lastUpdated: serverTimestamp(),
    });
}

export async function removeFromWatchlist(userId: string, movieId: string) {
    const docRef = doc(db, 'users', userId, 'watchlist', movieId);
    await deleteDoc(docRef);
}
