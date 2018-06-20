import {
  createStore as _createStore,
  applyMiddleware,
  compose,
} from 'redux';

let globalStore = null;

export
const createStore = (reducer, options = {}) => {
  const {
    middlewares = [],
  } = options;

  const hasWindow = typeof window === 'object' && window;
  const initialState = hasWindow && window.__PRELOADED_STATE__ || undefined;
  const composeEnhancers = hasWindow && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const enhancer = composeEnhancers(applyMiddleware(...middlewares));

  const store = _createStore(
    reducer,
    initialState,
    enhancer,
  );

  if (hasWindow && window.__PRELOADED_STATE__) {
    delete window.__PRELOADED_STATE__;
  }

  return store;
};

export
const getGlobalStore = () => globalStore;
export
const setGlobalStore = (store) => globalStore = store;
