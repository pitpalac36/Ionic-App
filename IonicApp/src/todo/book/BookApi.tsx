import axios from 'axios';
import { authConfig, getLogger, withLogs } from '../../core';
import { BookProps } from './BookProps';

const log = getLogger('itemApi');

const baseUrl = 'localhost:3000/api/items';


interface MessageData {
  type: string;
  payload: BookProps;
}

export const getItems: (token: string) => Promise<BookProps[]> = token => {
    return withLogs(axios.get(`http://${baseUrl}/books`, authConfig(token)), 'getItems');
}

export const createItem: (token: string, book: BookProps) => Promise<BookProps[]> = (token, book) => {
    return withLogs(axios.post(`http://${baseUrl}/book`, book, authConfig(token)), 'createItem');
}

export const editItem: (token: string, book: BookProps) => Promise<BookProps[]> = (token, book) => {
    return withLogs(axios.put(`http://${baseUrl}/book/${book._id}`, book, authConfig(token)), 'updateItem');
}

export const createWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
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