import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonLoading, IonPage, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { BookContext } from './BookProvider';
import { getLogger } from '../../core';
import { BookProps } from './BookProps';
import {MyMap} from '../../core/MyMap';
import {useMyLocation} from '../../core/useMyLocation';
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

    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
    const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);

    const location = useMyLocation();
    const {latitude : lat, longitude : lng} = location.position?.coords || {};

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
            setLatitude(item.latitude);
            setLongitude(item.longitude);
        }
    }, [match.params.id, items]);

    useEffect(() => {
        if (latitude === undefined && longitude === undefined) {
            setCurrentLatitude(lat);
            setCurrentLongitude(lng);
        } else {
            setCurrentLatitude(latitude);
            setCurrentLongitude(longitude);
        }
    }, [lat, lng, longitude, latitude]);

    const handleSave = () => {
        log('entered handleSave');
        const editedItem = item ? {...item, title, genre, startedReading, finishedReading, latitude: latitude, longitude: longitude } : { title, genre, startedReading, finishedReading, latitude: latitude, longitude: longitude };
        console.log(editedItem);
        saveItem && saveItem(editedItem).then(() => {history.goBack()});
    };

    function setLocation() {
        setLatitude(currentLatitude);
        setLongitude(currentLongitude);
    }

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
                    <IonSelectOption value="gothic horror">gothic horror</IonSelectOption>
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

            <IonItem>
                <IonLabel>Show us where you got the book from!</IonLabel>
                <IonButton onClick={setLocation}>Set location</IonButton>
            </IonItem>

            {lat && lng &&
                <MyMap
                   lat={currentLatitude}
                   lng={currentLongitude}
                   onMapClick={log('onMap')}
                   onMarkerClick={log('onMarker')}
                />
            }

            <IonLoading isOpen={saving}/>
            {savingError && (
                <div>{savingError?.message || 'Failed to save book'}</div>
            )}
        </IonContent>
     </IonPage>
    );

    function log(source: string) {
        return (e: any) => {
        setCurrentLatitude(e.latLng.lat());
        setCurrentLongitude(e.latLng.lng());
        console.log(source, e.latLng.lat(), e.latLng.lng());
        }
    }
};




export default BookEdit;