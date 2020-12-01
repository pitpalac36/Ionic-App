import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonList, IonListHeader, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { BookContext } from "./BookProvider";
import Book from "./Book";
import {add} from 'ionicons/icons';
import { AuthContext } from "../auth";
import { BookProps } from "./BookProps";
import { getLogger } from '../../core';

const log = getLogger('BookList');

const offset = 10;

const BookList : React.FC<RouteComponentProps> = ({history}) => {
    const { logout } = useContext(AuthContext)
    const {items, fetching, fetchingError} = useContext(BookContext);
    const [disableInfiniteScroll, setDisabledInfiniteScroll] = useState<boolean>(false);
    const [visibleItems, setVisibleItems] = useState<BookProps[] | undefined>([]);
    const [page, setPage] = useState(offset)

    useEffect(() => {
        log('filter effect');
        setPage(offset);
        fetchData();
    }, [items]);

    function fetchData() {
        setVisibleItems(items?.slice(0, page + offset));
        setPage(page + offset);
        if (items && page > items?.length) {
            setDisabledInfiniteScroll(true);
            setPage(items.length);
        } else {
            setDisabledInfiniteScroll(false);
        }
    }

    async function searchNext($event: CustomEvent<void>) {
        fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }
    
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Reading List</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="This might take a moment..."/>

                {
                    visibleItems &&(
                        
                        <IonList>
                            <IonListHeader>
                                <IonLabel>ID</IonLabel>
                                <IonLabel>Title</IonLabel>
                                <IonLabel>Genre</IonLabel>
                                <IonLabel>Started Reading</IonLabel>
                                <IonLabel>Reading finished</IonLabel>
                            </IonListHeader>
                            {Array.from(visibleItems).filter(each => each._id !== undefined).map(({_id, title, genre, startedReading, finishedReading}) => 
                            <Book key={_id} _id={_id} title={title} genre={genre} startedReading={startedReading} finishedReading={finishedReading || false}  onEdit={_id => history.push(`/api/items/book/${_id}`)} />)}
                        </IonList>
                    )
                }

                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {
                    fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                    )
                }

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/api/items/book')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>

                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={handleLogout}>
                        Logout
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );

    function handleLogout() {
        log("logout");
        logout?.();
    }
};


export default BookList;