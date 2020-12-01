import { IonItem, IonLabel } from "@ionic/react";
import React from "react";
import {BookProps} from "./BookProps";

interface BookPropsExtended extends BookProps {
    onEdit: (_id? : string) => void;
}

const Book: React.FC<BookPropsExtended> = ({_id, title, genre, startedReading, finishedReading, onEdit}) => {
    return (
        <IonItem onClick={ () => onEdit(_id) }>
            <IonLabel>{_id}</IonLabel>
            <IonLabel>{title}</IonLabel>
            <IonLabel>{genre}</IonLabel>
            <IonLabel>{startedReading}</IonLabel>
            <IonLabel>{finishedReading.toString()}</IonLabel>
        </IonItem>
    )
};


export default Book;