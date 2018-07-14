import cloneDeep from 'lodash/cloneDeep';
import SimpleSchema from 'simpl-schema';
import objectPath from 'object-path';

const mapOfActions = {};

/**
 * @param  {Object} rawSchemaObject
 * @return {[Object]}
 */
const parseSchemaObject = (rawSchemaObject) => {
  if (!rawSchemaObject) {
    return null;
  }

  return new SimpleSchema(rawSchemaObject);
};

export
/**
 * Register an action.
 * @param  {string}          options.type
 * @param  {Object}          options.schema    Optional schema. If not provided, reducer will run without validating the action payload.
 * @param  {string|[string]} options.scopePath Optional path for the scope. If provided, the state will be the reduced scope.
 * @param  {Function}        options.reducer
 */
const registerAction = ({
  type,
  schema,
  scopePath,
  reducer,
}) => {
  if (typeof type !== 'string') {
    throw new Error(`Action type must be a string. ${typeof type} received.`);
  }

  if (type.length === 0) {
    throw new Error('Action type must not be empty.');
  }

  if (type in mapOfActions) {
    throw new Error(`Action type '${type}' already exists.`);
  }

  if (typeof reducer !== 'function') {
    throw new Error(`Action reducer must be a function. ${typeof reducer} received.`);
  }

  const solidSchema = parseSchemaObject(schema);

  mapOfActions[type] = {
    type,
    schema: solidSchema,
    scopePath,
    reducer,
  };
};

export
/**
 * @param  {string} type
 * @return {Object}
 */
const getAction = (type) => {
  if (!(type in mapOfActions)) {
    throw new Error(`Action not found: ${type}`);
  }

  const action = mapOfActions[type];

  return action;
};

export
/**
 * Find the reducer for the given action.
 * If the reducer has schema defined, the action must pass the schema
 * validation.
 *
 * @param  {string}    options.type
 * @return {Function}
 */
const getReducerForAction = ({type, ...payload}) => {
  const {
    schema,
    scopePath,
    reducer,
  } = getAction(type);

  if (schema) {
    try {
      const cleanedPayload = schema.clean(payload);

      schema.validate(cleanedPayload);
    } catch (error) {
      error.message = `Invalid action: ${type}. ${error.message}`;
      throw error;
    }
  }

  return scopePath
  ? (state, action) => {
    const nextState = cloneDeep(state);
    const scopedState = objectPath.get(state, scopePath, {});
    const nextScopedState = reducer(scopedState, action);

    objectPath.set(nextState, scopePath, nextScopedState);

    return nextState;
  }
  : reducer;
};

export
const actionSpecificReducer = (state, action) => {
  const reducer = getReducerForAction(action);

  if (!reducer) {
    return state;
  }

  const nextState = reducer(state, action);

  return nextState;
};
