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
    seasonsProgress: number,
    episodesProgress: number,
    dateAdded?: string;
    lastUpdated?: string;
}

export async function addToSeriesWatchlist(userId: string, series: SeriesData) {
    const docRef = doc(db, 'users', userId, 'seriesWatchlist', series.seriesId);
    await setDoc(docRef, {
        ...series,
        seasonsProgress: series.seasonsProgress || 1,
        episodesProgress: series.episodesProgress ?? 0,
        dateAdded: serverTimestamp(),
        lastUpdated: serverTimestamp(),
    });
}

export async function getSeriesWatchlist(userId: string): Promise<SeriesData[]> {
    const colRef = collection(db, 'users', userId, 'seriesWatchlist');
    const snapshot = await getDocs(colRef);
    const result: SeriesData[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // handle Firestore Timestamp conversion
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
        } as SeriesData);
    });
    return result;
}

export async function updateSeriesProgress(
    userId: string,
    seriesId: string,
    newSeasonProgress: number,
    newEpisodeProgress: number,
) {
    const docRef = doc(db, 'users', userId, 'seriesWatchlist', seriesId);
    await updateDoc(docRef, {
        seasonsProgress: newSeasonProgress,
        episodesProgress: newEpisodeProgress,
        lastUpdated: serverTimestamp(),
    });
}

export async function removeFromSeriesWatchlist(userId: string, seriesId: string) {
    const docRef = doc(db, 'users', userId, 'seriesWatchlist', seriesId);
    await deleteDoc(docRef);
}
