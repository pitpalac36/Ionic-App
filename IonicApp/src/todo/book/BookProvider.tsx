import React, { useCallback, useContext, useEffect, useReducer } from "react";
import { BookProps } from "./BookProps";
import PropTypes from 'prop-types';
import { getItems, createItem, editItem, createWebSocket } from "./BookApi";
import { getLogger } from '../../core';
import { AuthContext } from "../auth";

const log = getLogger('BookProvider');

export type saveItemFunction = (item : any) => Promise<any>;

export interface ItemsState {
    items? : BookProps[],
    fetching: boolean,
    fetchingError? : Error | null,
    saving: boolean,
    savingError? : Error | null,
    saveItem? : saveItemFunction
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
            return {...state, items: payload.error, fetching: false};
        case SAVE_ITEM_STARTED:
            return {...state, savingError: null, saving: true};
        case SAVE_ITEM_SUCCEEDED:
            const items = [...(state.items || [])]
            const item = payload.item;
            const index = items.findIndex(it => it._id === item._id);
            if (index === -1) {
                items.splice(items.length, 0, item);
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

export const BookProvider: React.FC<BookProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError, saving, savingError } = state;
    useEffect(getBooksEffect, [token]);
    useEffect(ws, [token])
    const saveBook = useCallback<saveItemFunction>(saveBookCallback, [token]);
    const value  = {items, fetching, fetchingError, saving, savingError, saveItem: saveBook };
    return (
        <BookContext.Provider value={value}>
        {children}
        </BookContext.Provider>
    );

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
                try {
                    log('fetchBooks started');
                    dispatch({type: FETCH_ITEMS_STARTED});
                    const items = await getItems(token);
                    log('fetchBooks successful');
                    if (!canceled) {
                        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}})
                    }
                } catch (error) {
                    log('fetchBooks failed');
                    dispatch({type: FETCH_ITEMS_FAILED, payload: {error: error}});
                }
            }
        }
    }


    async function saveBookCallback(item: BookProps) {
        try {
            log('saveBook started');
            dispatch({ type: SAVE_ITEM_STARTED });
            const updatedItem = await (item._id ? editItem(token, item) : createItem(token, item))
            log('saveBook successful');
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: updatedItem}});
        }
        catch(error) {
            log('saveBook failed');
            dispatch({type: SAVE_ITEM_FAILED, payload: {error : error}});
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
