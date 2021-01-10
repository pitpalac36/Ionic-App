import { createAnimation, IonItem, IonLabel, IonModal } from "@ionic/react";
import React, { useEffect, useState } from "react";
import {BookProps} from "./BookProps";

interface BookPropsExtended extends BookProps {
    onEdit: (_id? : string) => void;
}

const Book: React.FC<BookPropsExtended> = ({_id, title, genre, startedReading, finishedReading, latitude, longitude, webViewPath, onEdit}) => {

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        document.getElementById("image")!.addEventListener('mouseenter', () => {
            setShowModal(true);
        });
    }, [document.getElementById("image")]);

    useEffect(() => {
        document.getElementById("item")!.addEventListener('click', () => {
            onEdit(_id);
        });
    }, [document.getElementById("item")]);

    const enterAnimation = (baseEl: any) => {

        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
    
        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);
    
        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }
    
    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <IonItem id="item">
            <IonLabel>{_id}</IonLabel>
            <IonLabel>{title}</IonLabel>
            <IonLabel>{genre}</IonLabel>
            <IonLabel>{startedReading}</IonLabel>
            <IonLabel>{finishedReading.toString()}</IonLabel>
            <IonLabel>{latitude}</IonLabel>
            <IonLabel>{longitude}</IonLabel>
            {webViewPath && (<img id="image" src={webViewPath} width={'100px'} height={'100px'} onClick={() => {
                setShowModal(true);
            }} />)}

            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation} backdropDismiss={true} onDidDismiss={() => setShowModal(false)}>
                <img id="image" src={webViewPath} />
            </IonModal>

            {!webViewPath && (<img src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'} />)}
        </IonItem>
    )
};


export default Book;