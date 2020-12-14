import axios from 'axios';
import { authConfig, getLogger, withLogs } from '../../core';
import { BookProps } from './BookProps';
import { Plugins} from '@capacitor/core';

const log = getLogger('itemApi');
const { Storage } = Plugins;

const url = 'localhost:3000';
const baseUrl = `http://${url}/api/items`;


interface MessageData {
  type: string;
  payload: BookProps;
}

const different = (book1: any, book2: any) => {
    if (book1.title === book2.title && book1.genre === book2.genre && book1.startedReading === book2.startedReading && book1.finishedReading === book2.finishedReading)
      return false;
    return true;
}

export const syncData: (token: string) => Promise<BookProps[]> = async token => {
  try {
    const { keys } = await Storage.keys();
    var result = axios.get(`${baseUrl}/books`, authConfig(token));
    result.then(async result => {
      keys.forEach(async i => {
        if (i !== 'token') {
          const bookOnServer = result.data.find((each: { _id: string; }) => each._id === i);
          const bookLocal = await Storage.get({key: i});

          alert('BOOK ON SERVER: ' + JSON.stringify(bookOnServer));
          alert('BOOK LOCALLY: ' + bookLocal.value!);

          if (bookOnServer !== undefined && different(bookOnServer, JSON.parse(bookLocal.value!))) {  // actualizare
            alert('UPDATE ' + bookLocal.value);
            axios.put(`${baseUrl}/book/${i}`, JSON.parse(bookLocal.value!), authConfig(token));
          } else if (bookOnServer === undefined){  // creare
            alert('CREATE' + bookLocal.value!);
            axios.post(`${baseUrl}/book`, JSON.parse(bookLocal.value!), authConfig(token));
          }
        }
        })
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  })
    return withLogs(result, 'syncItems');
  } catch (error) {
    throw error;
  }    
}

export const getItems: (token: string) => Promise<BookProps[]> = token => {  
  try {
    var result = axios.get(`${baseUrl}/books`, authConfig(token));
    result.then(async result => {
      for (const each of result.data) {
          await Storage.set({
            key: each._id!,
            value: JSON.stringify({
              _id: each._id,
              title: each.title,
              genre: each.genre,
              startedReading: each.startedReading,
              finishedReading: each.finishedReading
            })
          });
      }
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  })
    return withLogs(result, 'getItems');
  } catch (error) {
    throw error;
  }    
}

export const createItem: (token: string, book: BookProps) => Promise<BookProps[]> = (token, book) => {
    //return withLogs(axios.post(`${baseUrl}/book`, book, authConfig(token)), 'createItem');
    var result = axios.post(`${baseUrl}/book`, book, authConfig(token));
    result.then(async result => {
      var one = result.data;
      await Storage.set({
        key: one._id!,
        value: JSON.stringify({
          _id: one._id,
          title: one.title,
          genre: one.genre,
          startedReading: one.startedReading,
          finishedReading: one.finishedReading
          })
      });
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        alert('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  });
    return withLogs(result, 'createItem');
}

export const editItem: (token: string, book: BookProps) => Promise<BookProps[]> = (token, book) => {
    //return withLogs(axios.put(`${baseUrl}/book/${book._id}`, book, authConfig(token)), 'updateItem');
    var result = axios.put(`${baseUrl}/book/${book._id}`, book, authConfig(token));
    result.then(async result => {
      var one = result.data;
      await Storage.set({
        key: one._id!,
        value: JSON.stringify({
          _id: one._id,
          title: one.title,
          genre: one.genre,
          startedReading: one.startedReading,
          finishedReading: one.finishedReading
          })
      }).catch(err => {
        if (err.response) {
          alert('client received an error response (5xx, 4xx)');
        } else if (err.request) {
          alert('client never received a response, or request never left');
        } else {
          alert('anything else');
        }
    })
    });
    return withLogs(result, 'updateItem');
}

export const createWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${url}`);
    ws.onopen = () => {
      log('web socket onopen');
      ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = function (event) {
      console.log(event);
      log('web socket onclose');
    };
    ws.onerror = error => {
      log('web socket onerror', error);
      ws.close();
    };
    ws.onmessage = messageEvent => {
      log('web socket onmessage');
      onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
  }