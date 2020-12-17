import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { BookProps } from "./BookProps";
import PropTypes from 'prop-types';
import { getItems, createItem, editItem, createWebSocket, syncData } from "./BookApi";
import { getLogger } from '../../core';
import { AuthContext } from "../auth";
import { Plugins } from "@capacitor/core";

const log = getLogger('BookProvider');
const { Storage } = Plugins;

export type saveItemFunction = (item : any) => Promise<any>;

export interface ItemsState {
    items? : BookProps[],
    fetching: boolean,
    fetchingError? : Error | null,
    saving: boolean,
    savingError? : Error | null,
    saveItem? : saveItemFunction,
    connectedNetwork?: boolean,
    setSavedOffline?: Function,
    savedOffline?: boolean
};

interface ActionProps {
    type: string,
    payload? : any
};

const initialState: ItemsState = {
    fetching: false,
    saving: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState = 
(state, {type, payload}) => {
    switch(type) {
        case FETCH_ITEMS_STARTED:
            return {...state, fetching: true, fetchingError: null};
        case FETCH_ITEMS_SUCCEEDED:
            return {...state, items: payload.items, fetching: false};
        case FETCH_ITEMS_FAILED:
            return {...state, items: payload.items, fetching: false};
        case SAVE_ITEM_STARTED:
            return {...state, savingError: null, saving: true};
        case SAVE_ITEM_SUCCEEDED:
            const items = [...(state.items || [])]
            const item = payload.item;            
            const index = items.findIndex(it => it._id === item._id);
            if (index === -1) {
                items.splice(0, 0, item);
            } else {
                items[index] = item;
            }
            return {...state, items: items, saving: false};
        case SAVE_ITEM_FAILED:
            return {...state, savingError: payload.error, saving: false};
        default:
            return state;
    }
};

export const BookContext = React.createContext<ItemsState>(initialState);

interface BookProviderProps {
    children: PropTypes.ReactNodeLike
}

const {Network} = Plugins;

export const BookProvider: React.FC<BookProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);

    const [connectedNetworkStatus, setConnectedNetworkStatus] = useState<boolean>(false);
    Network.getStatus().then(status => setConnectedNetworkStatus(status.connected));
    const [savedOffline, setSavedOffline] = useState<boolean>(false);
    useEffect(networkEffect, [token, setConnectedNetworkStatus]);

    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError, saving, savingError } = state;
    useEffect(getBooksEffect, [token]);
    useEffect(ws, [token])
    const saveBook = useCallback<saveItemFunction>(saveBookCallback, [token]);
    const value  = {
        items, 
        fetching, 
        fetchingError, 
        saving, 
        savingError, 
        saveItem: saveBook, 
        connectedNetworkStatus, 
        savedOffline, 
        setSavedOffline 
    };
    return (
        <BookContext.Provider value={value}>
        {children}
        </BookContext.Provider>
    );

    function networkEffect() {
        console.log("network effect");
        let canceled = false;
        Network.addListener('networkStatusChange', async (status) => {
            if (canceled) return;
            const connected = status.connected;
            if (connected) {
                console.log("networkEffect - SYNC data");
                await syncData(token);
            }
            setConnectedNetworkStatus(status.connected);
        });
        return () => {
            canceled = true;
        }
    }

    function getBooksEffect() {
        let canceled = false;
        fetchBooks();
        return () => {
            canceled = true;
        }

        async function fetchBooks() {
            let canceled = false;
            fetchBooks();
            return () => {
                canceled = true;
            }

            async function fetchBooks() {
                if (!token?.trim()) return;
                if (!navigator?.onLine) {
                    let storageKeys = Storage.keys();
                    const books = await storageKeys.then(async function (storageKeys) {
                        const saved = [];
                        for (let i = 0; i < storageKeys.keys.length; i++) {
                            if (storageKeys.keys[i] !== "token") {
                                const book = await Storage.get({key : storageKeys.keys[i]});
                                if (book.value != null)
                                    var parsedBook = JSON.parse(book.value);
                                saved.push(parsedBook);
                            }
                        }
                        return saved;
                    });
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: books}});
                } else {
                    try {
                        log('fetchBooks started');
                        dispatch({type: FETCH_ITEMS_STARTED});
                        const items = await getItems(token);
                        log('fetchBooks successful');
                        if (!canceled) {
                            dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}})
                        }
                    } catch (error) {
                        let storageKeys = Storage.keys();
                        const books = await storageKeys.then(async function (storageKeys) {
                            const saved = [];
                            for (let i = 0; i < storageKeys.keys.length; i++) {
                                if (storageKeys.keys[i] !== "token") {
                                    const book = await Storage.get({key : storageKeys.keys[i]});
                                    if (book.value != null)
                                        var parsedBook = JSON.parse(book.value);
                                    saved.push(parsedBook);
                                }
                            }
                            return saved;
                        });
                        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: books}});
                    }
                }
                
            }
        }
    }


    async function saveBookCallback(item: BookProps) {
        try {
            if (navigator.onLine) {
                log('saveBook started');
                dispatch({ type: SAVE_ITEM_STARTED });
                const updatedItem = await (item._id ? editItem(token, item) : createItem(token, item))
                log('saveBook successful');
                dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: updatedItem}});
            }
            
            else {
                console.log('saveBook offline');
                log('saveBook failed');
                item._id = (item._id == undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : item._id;
                await Storage.set({
                    key: item._id!,
                    value: JSON.stringify({
                      _id: item._id,
                      title: item.title,
                      genre: item.genre,
                      startedReading: item.startedReading,
                      finishedReading: item.finishedReading,
                      latitude: item.latitude,
                      longitude: item.longitude
                      })
                  });
                dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item : item}});
                setSavedOffline(true);
            }
        }
        catch(error) {
            log('saveBook failed');
            await Storage.set({
                key: String(item._id),
                value: JSON.stringify(item)
            })
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item : item}});
        }
    }

    function ws() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
          closeWebSocket = createWebSocket(token, message => {
            if (canceled) {
              return;
            }
            const { type, payload: item } = message;
            log(`ws message, item ${type}`);
            if (type === 'created' || type === 'updated') {
              dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
            }
          });
        }
        return () => {
          log('wsEffect - disconnecting');
          canceled = true;
          closeWebSocket?.();
        }
    }
}
