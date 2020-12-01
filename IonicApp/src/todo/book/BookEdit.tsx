import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { BookContext } from './BookProvider';
import { getLogger } from '../../core';
import { BookProps } from './BookProps';
import moment from 'moment';

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
                <IonSelect value={genre} onIonChange={e => setGenre(e.detail.value)}>
                    <IonSelectOption value="war">war</IonSelectOption>
                    <IonSelectOption value="crime">crime</IonSelectOption>
                    <IonSelectOption value="drama">drama</IonSelectOption>
                    <IonSelectOption value="romance">romance</IonSelectOption>
                    <IonSelectOption value="thriller">thriller</IonSelectOption>
                    <IonSelectOption value="comedy">comedy</IonSelectOption>
                    <IonSelectOption value="fantasy">fantasy</IonSelectOption>
                </IonSelect>
                
            </IonItem>
            <IonItem>
                <IonLabel>Started Reading: </IonLabel>
                <IonDatetime displayFormat="DD MMM YYYY" pickerFormat="DD MMM YYYY" value={startedReading} onBlur={e => setstartedReading((moment(e.target.value).format('DD MMM YYYY')) || moment(new Date()).format('DD MMM YYYY'))}/>
            </IonItem>
            <IonItem>
                <IonLabel>Finished Reading: </IonLabel>
                <IonToggle checked={finishedReading} onIonChange={e => setfinishedReading(e.detail.checked)}/>
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