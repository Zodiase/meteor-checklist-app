import _createStore from './createStore';
import initialState from './initial-state';
import {
  actionSpecificReducer,
} from './actions';

const reducer = (state = initialState, action) => {
  if (action.type.indexOf('@@') === 0) {
    return state;
  }

  return actionSpecificReducer(state, action);
};

let globalStore = null;

export
const createStore = () => _createStore(reducer);

export
const getGlobalStore = () => globalStore;
export
const setGlobalStore = (store) => globalStore = store;
