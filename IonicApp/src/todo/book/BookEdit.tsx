import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { BookContext } from './BookProvider';
import { getLogger } from '../../core';
import { BookProps } from './BookProps';

const log = getLogger('ItemEdit');


interface BookEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const BookEdit: React.FC<BookEditProps> = ({history, match}) => {
    const {items, saving, savingError, saveItem } = useContext(BookContext);
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [startedReading, setstartedReading] = useState('');
    const [finishedReading, setfinishedReading] = useState(false);
    const [item, setItem] = useState<BookProps>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const item = items?.find(it => it._id === routeId);
        setItem(item);
        if (item) {
            setTitle(item.title);
            setGenre(item.genre);
            setstartedReading(item.startedReading);
            setfinishedReading(item.finishedReading);
        }
    }, [match.params.id, items]);

    const handleSave = () => {
        log('entered handleSave');
        const editedItem = item ? {...item, title, genre, startedReading, finishedReading } : { title, genre, startedReading, finishedReading };
        console.log(editedItem);
        saveItem && saveItem(editedItem).then(() => {history.goBack()});
    };

     return (
     <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Edit book</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={handleSave}>Save</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonItem>
                <IonLabel>ID:  </IonLabel>
                <IonInput hidden={item === undefined}  placeholder="id" value={match.params.id} readonly/>
            </IonItem>
            <IonItem>
                <IonLabel>Title:  </IonLabel>
                <IonInput placeholder="title" value={title} onIonChange={e => setTitle(e.detail.value || '')}/>
            </IonItem>
            <IonItem>
                <IonLabel>Genre:  </IonLabel>
                <IonInput placeholder="genre" value={genre} onIonChange={e => setGenre(e.detail.value || '')}/>
            </IonItem>
            <IonItem>
                <IonLabel>Started Reading: </IonLabel>
                <IonInput placeholder="started reading" value={startedReading} onIonChange={e => setstartedReading(e.detail.value || '')}/>
            </IonItem>
            <IonItem>
                <IonLabel>Finished Reading: </IonLabel>
                <IonInput placeholder="finishedReading" value={finishedReading.toString()} onIonChange={e => setfinishedReading((e.detail.value === 'true') || false)}/>
            </IonItem>
            <IonLoading isOpen={saving}/>
            {savingError && (
                <div>{savingError?.message || 'Failed to save book'}</div>
            )}
        </IonContent>
     </IonPage>
    );
};


export default BookEdit;