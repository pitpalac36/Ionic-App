import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonLabel, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { BookContext } from './BookProvider';
import { getLogger } from '../core';
import { BookProps } from './BookProps';

const log = getLogger('ItemEdit');


interface BookEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const BookEdit: React.FC<BookEditProps> = ({history, match}) => {
    const {items, saving, savingError, saveItem } = useContext(BookContext);
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [firstPublished, setFirstPublished] = useState('');
    const [translated, setTranslated] = useState(false);
    const [item, setItem] = useState<BookProps>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const item = items?.find(it => it._id === routeId);
        setItem(item);
        if (item) {
            setTitle(item.title);
            setGenre(item.genre);
            setFirstPublished(item.firstPublished);
            setTranslated(item.translated);
        }
    }, [match.params.id, items]);

    const handleSave = () => {
        log('entered handleSave');
        const editedItem = item ? {...item, title, genre, firstPublished, translated } : { title, genre, firstPublished, translated };
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
            <IonInput hidden={item == undefined}  placeholder="id" value={match.params.id} readonly/>
            <IonInput placeholder="title" value={title} onIonChange={e => setTitle(e.detail.value || '')}/>
            <IonInput placeholder="genre" value={genre} onIonChange={e => setGenre(e.detail.value || '')}/>
            <IonInput placeholder="first published" value={firstPublished} onIonChange={e => setFirstPublished(e.detail.value || '')}/>
            <IonInput placeholder="translated" value={translated.toString()} onIonChange={e => setTranslated((e.detail.value === 'true') || false)}/>
            <IonLoading isOpen={saving}/>
            {savingError && (
                <div>{savingError?.message || 'Failed to save book'}</div>
            )}
        </IonContent>
     </IonPage>
    );
};


export default BookEdit;