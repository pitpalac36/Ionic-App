import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonList, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import React, { useContext } from "react";
import { RouteComponentProps } from "react-router";
import { BookContext } from "./BookProvider";
import Book from "./Book";
import {add} from 'ionicons/icons';


const BookList : React.FC<RouteComponentProps> = ({history}) => {
    const {items, fetching, fetchingError} = useContext(BookContext);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Reading List</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonLoading isOpen={fetching} message="This might take a moment..."/>

                {
                    items && (
                        <IonList>
                            {items.map(({_id, title, genre, firstPublished, translated}) => 
                            <Book key={_id} _id={_id} title={title} genre={genre} firstPublished={firstPublished} translated={translated || false}  onEdit={_id => history.push(`/book/${_id}`)} />)}
                        </IonList>
                    )
                }

                {
                    fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                    )
                }

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/book')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};


export default BookList;