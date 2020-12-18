import { IonItem, IonLabel } from "@ionic/react";
import React from "react";
import {BookProps} from "./BookProps";

interface BookPropsExtended extends BookProps {
    onEdit: (_id? : string) => void;
}

const Book: React.FC<BookPropsExtended> = ({_id, title, genre, startedReading, finishedReading, latitude, longitude, webViewPath, onEdit}) => {
    return (
        <IonItem onClick={ () => onEdit(_id) }>
            <IonLabel>{_id}</IonLabel>
            <IonLabel>{title}</IonLabel>
            <IonLabel>{genre}</IonLabel>
            <IonLabel>{startedReading}</IonLabel>
            <IonLabel>{finishedReading.toString()}</IonLabel>
            <IonLabel>{latitude}</IonLabel>
            <IonLabel>{longitude}</IonLabel>
            {webViewPath && (<img src={webViewPath} width={'100px'} height={'100px'}/>)}
            {!webViewPath && (<img src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
        </IonItem>
    )
};


export default Book;