import { createStore } from 'redux';

export default
(reducer) => {
  const hasWindow = typeof window === 'object' && window;
  const store = createStore(
    reducer,
    hasWindow && window.__PRELOADED_STATE__ || undefined,
    hasWindow && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() || undefined,
  );

  if (hasWindow && window.__PRELOADED_STATE__) {
    delete window.__PRELOADED_STATE__;
  }

  return store;
};
