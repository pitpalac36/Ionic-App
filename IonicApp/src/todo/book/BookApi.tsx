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

export const getItems: (token: string) => Promise<BookProps[]> = token => {
    //return withLogs(axios.get(`${baseUrl}/books`, authConfig(token)), 'getItems');
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
    });
    return withLogs(result, 'getItems');
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
      });
    });
    return withLogs(result, 'updateItem');
}

export const createWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${url}`);
    ws.onopen = () => {
      log('web socket onopen');
      ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
      log('web socket onclose');
    };
    ws.onerror = error => {
      log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
      log('web socket onmessage');
      onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
  }