import axios from 'axios';
import { getLogger } from '../core';
import { BookProps } from './BookProps';

const log = getLogger('itemApi');

const baseUrl = 'localhost:3000';


interface MessageData {
    event: string;
    payload: {
        item: BookProps;
    }
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getItems: () => Promise<BookProps[]> = () => {
    return axios.get(`http://${baseUrl}/books`).then((res) => {
        console.log('getItems successful');
        return Promise.resolve(res.data);
    }).catch((err) => {
        console.log('getItems failed');
        return Promise.reject(err);
    })
}

export const createItem: (book: BookProps) => Promise<BookProps[]> = book => {
    return axios.post(`http://${baseUrl}/book`, book, config).then((res) => {
        console.log('createItem successful');
        return Promise.resolve(res.data);
    }).catch((err) => {
        console.log('createItem failed');
        return Promise.reject(err);
    })
}

export const editItem: (book: BookProps) => Promise<BookProps[]> = book => {
    return axios.put(`http://${baseUrl}/book/${book._id}`, book, config).then((res) => {
        console.log('editItem successful');
        return Promise.resolve(res.data);
    }).catch((err) => {
        console.log('editItem failed');
        return Promise.reject(err);
    })
}

export const createWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
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