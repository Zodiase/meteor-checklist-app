import initialState from './initial-state';
import {
  actionSpecificReducer,
} from './actions';

export default
(state = initialState, action) => {
  if (action.type.indexOf('@@') === 0) {
    return state;
  }

  return actionSpecificReducer(state, action);
};
