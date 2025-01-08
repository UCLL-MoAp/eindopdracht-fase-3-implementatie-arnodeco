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

interface SeriesData {
    seriesId: string;
    seriesTitle: string,
    posterUrl: string,
    runtime: string,
    seasons: number,
    episodesPerSeason: number[],
    rating: number,
    dateAdded?: string,
    dateFinished?: string
}

export async function addToSeriesFinishedlist(userId: string, series: SeriesData) {
    const docRef = doc(db, 'users', userId, 'seriesFinishedlist', series.seriesId);
    await setDoc(docRef, {
        ...series,
        rating: series.rating ?? 0,
        dateFinished: serverTimestamp(),
    });
}

export async function getSeriesFinishedlist(userId: string): Promise<SeriesData[]> {
    const colRef = collection(db, 'users', userId, 'seriesFinishedlist');
    const snapshot = await getDocs(colRef);
    const result: SeriesData[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        const dateFinished =
            data.dateFinished instanceof Timestamp
                ? data.dateFinished.toDate().toLocaleString()
                : '';

        result.push({
            ...data,
            dateFinished,
        } as SeriesData);
    });
    return result;
}

export async function updateSeriesRating(
    userId: string,
    seriesId: string,
    newRating: number
) {
    const docRef = doc(db, 'users', userId, 'seriesFinishedlist', seriesId);
    await updateDoc(docRef, {
        rating: newRating
    });
}

export async function removeFromSeriesFinishedlist(userId: string, seriesId: string) {
    const docRef = doc(db, 'users', userId, 'seriesFinishedlist', seriesId);
    await deleteDoc(docRef);
}
