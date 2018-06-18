import {
  store as globalStateStore,
  getAction,
  registerAction,
} from '/imports/ui/redux-store';

registerAction({
  type: 'asyncTask.register',
  schema: {
    name: {
      type: String,
    },
    task: {
      type: Promise,
    },
    onReady: {
      type: Function,
      optional: true,
      defaultValue: null,
    },
    onError: {
      type: Function,
      optional: true,
      defaultValue: null,
    },
  },
  reducer: (state, {
    name,
    task,
    onReady,
    onError,
  }) => {
    task.then(onReady, onError);

    return {
      ...state,

      async: {
        ...state.async,

        [name]: {
          inProgress: true,
          initiatedOn: Date.now(),
        },
      },
    };
  },
});

registerAction({
  type: 'asyncTask.resolve',
  schema: {
    name: {
      type: String,
    },
    data: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    error: {
      type: Error,
      blackbox: true,
      optional: true,
    },
  },
  reducer: (state, {
    name,
    data,
    error,
  }) => {
    return {
      ...state,

      async: {
        ...state.async,

        [name]: {
          ...state.async[name],

          inProgress: false,
          resolvedOn: Date.now(),
          error: error ? {
            name: error.name,
            message: error.message,
          } : null,
          data,
        },
      },
    };
  },
});
