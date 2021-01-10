import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { createAnimation, IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../../core';
import AnimationDemo from './AnimationDemo';

const log = getLogger('Login');

interface LoginState {
  username?: string;
  password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
  const [state, setState] = useState<LoginState>({});
  const [showValidationError, setShowValidationError] = useState(false);
  const { username, password } = state;
  const handleLogin = () => {
    log('handleLogin...');
    //login?.(username, password);
    if(!username || !password) {setShowValidationError(true);}
        else{
            setShowValidationError(false);
            login?.(username, password);
        }
  };
  log('render');
  if (isAuthenticated) {
    return <Redirect to={{ pathname: '/' }} />
  }

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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-text-center">
        <IonInput
        required type="text"
          placeholder="Username"
          value={username}
          onIonChange={e => setState({
            ...state,
            username: e.detail.value || ''
          })}/>

        <IonInput
          required type="password"
          placeholder="Password"
          value={password}
          onIonChange={e => setState({
            ...state,
            password: e.detail.value || ''
          })}/>
        <IonLoading isOpen={isAuthenticating}/>
        <IonButton onClick={handleLogin}>Login</IonButton>

        {showValidationError && 
        <AnimationDemo 
        allMandatory="All fields are mandatory" 
        usernameMandatory = {username? "username : checked" : "enter username"}
        passwordMandatory = {showValidationError && password? "password : checked":"enter password"} 
        authFailed = {undefined}
        wrong = {undefined}
        />}

        {authenticationError && 
        <AnimationDemo
        allMandatory = "" 
        usernameMandatory = {undefined}
        passwordMandatory = {undefined} 
        authFailed = "Authentication failed"
        wrong = "Wrong credentials"
        />
        }
      </IonContent>
    </IonPage>
  );
};
