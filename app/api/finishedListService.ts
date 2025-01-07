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
    rating?: number;
    dateAdded?: string;
    dateFinished?: string;
}

export async function addToFinishedlist(userId: string, movie: MovieData) {
    const docRef = doc(db, 'users', userId, 'finishedlist', movie.movieId);
    await setDoc(docRef, {
        ...movie,
        rating: movie.rating ?? 0,
        dateFinished: serverTimestamp(),
    });
}

export async function getFinishedlist(userId: string): Promise<MovieData[]> {
    const colRef = collection(db, 'users', userId, 'finishedlist');
    const snapshot = await getDocs(colRef);
    const result: MovieData[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        const dateFinished =
            data.dateFinished instanceof Timestamp
                ? data.dateFinished.toDate().toLocaleString()
                : '';

        result.push({
            ...data,
            dateFinished,
        } as MovieData);
    });
    return result;
}

export async function updateRating(
    userId: string,
    movieId: string,
    newRating: number
) {
    const docRef = doc(db, 'users', userId, 'finishedlist', movieId);
    await updateDoc(docRef, {
        rating: newRating
    });
}

export async function removeFromFinishedlist(userId: string, movieId: string) {
    const docRef = doc(db, 'users', userId, 'finishedlist', movieId);
    await deleteDoc(docRef);
}
