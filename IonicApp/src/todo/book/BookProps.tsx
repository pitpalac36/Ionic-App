
export interface BookProps {
    _id?: string;
    title: string;
    genre: string;
    startedReading: string;
    finishedReading: boolean;
    latitude?: number;
    longitude?: number;
}