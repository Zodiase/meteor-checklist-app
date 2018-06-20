import objectPath from 'object-path';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import handleStorage from '/imports/handle-storage';
import {
  getAction,
  registerAction,
  actionSpecificReducer,
} from '/imports/ui/redux-store';
import Checklists from '/imports/api/checklists/collections';
import {
  createNew as createNewChecklist,
} from '/imports/api/checklists/methods';
import {
  StepSchema,
  ClientSideCreationSchema,
} from '/imports/api/checklists/schema';

const wrapJsonFriendlyChecklistDocument = (originalDoc) => {
  if (!originalDoc) {
    return null;
  }

  return {
    ...originalDoc,

    createDate: Number(originalDoc.createDate),
    modifyDate: Number(originalDoc.modifyDate),
  };
};

registerAction({
  type: 'data.checklists.subscribe',
  schema: {
    onListUpdate: Function,
  },
  reducer: (state, {
    onListUpdate,
  }) => {
    const handleOfSubscription = Meteor.subscribe(
      'checklists.index',
    );
    const handleIdOfSubscription = handleStorage.deposit(handleOfSubscription);
    const handleOfTracker = Tracker.autorun(() => {
      console.group(`Autorun for subscription ${handleIdOfSubscription}`);

      const checklistDocsCursor = Checklists.find({}, {
        sort: { createDate: -1 },
      });

      if (handleOfSubscription.ready() && checklistDocsCursor) {
        const checklistDocs = checklistDocsCursor.fetch();

        console.log('new checklist docs', checklistDocs);

        onListUpdate(checklistDocs);
      }
      console.groupEnd();
    });
    const handleIdOfTracker = handleStorage.deposit(handleOfTracker);

    return {
      ...state,
      'data.checklists.loading': true,
      'data.checklists.subscribed': true,
      'data.checklists.handleIdOfSubscription': handleIdOfSubscription,
      'data.checklists.handleIdOfTracker': handleIdOfTracker,
    };
  },
});

registerAction({
  type: 'data.checklists.terminateSubscription',
  reducer: (state) => {
    const handleOfSubscription = handleStorage.withdraw(state['data.checklists.handleIdOfSubscription']);

    handleOfSubscription && handleOfSubscription.stop();

    const handleOfTracker = handleStorage.withdraw(state['data.checklists.handleIdOfTracker']);

    handleOfTracker && handleOfTracker.stop();

    return {
      ...state,
      'data.checklists.loading': false,
      'data.checklists.subscribed': false,
      'data.checklists.handleIdOfSubscription': null,
      'data.checklists.handleIdOfTracker': null,
    };
  },
});

registerAction({
  type: 'data.checklists.update',
  schema: {
    list: {
      type: Array,
    },
    'list.$': {
      type: Object,
      blackbox: true,
    },
  },
  reducer: (state, {
    list,
  }) => {
    return {
      ...state,
      'data.checklists.items': list,
      'data.checklists.ready': true,
      'data.checklists.loading': false,
      'data.checklists.subscribed': true,
    };
  },
});

registerAction({
  type: 'data.checklists.createNew',
  schema: {
    checklist: ClientSideCreationSchema,
    onReady: Function,
    onError: Function,
  },
  reducer: (state, {
    checklist,
    onReady,
    onError,
  }) => {
    createNewChecklist.callPromise(checklist)
    .then(onReady, onError);

    return state;
  },
});

registerAction({
  type: 'data.checklists.document.subscribe',
  schema: {
    idOfchecklist: String,
    onDocumentUpdate: Function,
  },
  scopePath: [
    'data.checklists.documents',
  ],
  reducer: (scopedState, {
    idOfchecklist,
    onDocumentUpdate,
  }) => {
    const documentInfo = scopedState[idOfchecklist];

    if (documentInfo) {
      const isDocumentLoaded = objectPath.get(documentInfo, 'ready', false);
      const loadedDocument = documentInfo.source;
      const isDocumentNotFound = isDocumentLoaded && !loadedDocument;

      // If document is determined to be 404, do not start subscription.
      if (isDocumentNotFound) {
        return scopedState;
      }
    }

    const handleOfSubscription = Meteor.subscribe(
      'checklist.full',
      {
        idOfchecklist,
      },
      {
        onStop: (error) => {
          if (error) {
            // Subscription is stopped by server error.
          } else {
            // Subscription is stopped normally.
          }
        },
      }
    );
    const handleIdOfSubscription = handleStorage.deposit(handleOfSubscription);
    const handleOfTracker = Tracker.autorun(() => {
      const checklistDocsCursor = Checklists.find({
        _id: idOfchecklist,
      });

      if (handleOfSubscription.ready() && checklistDocsCursor) {
        const checklistDoc = checklistDocsCursor.fetch()[0];

        onDocumentUpdate(checklistDoc);
      }
    });
    const handleIdOfTracker = handleStorage.deposit(handleOfTracker);

    return {
      ...scopedState,

      [idOfchecklist]: {
        ...documentInfo,

        id: idOfchecklist,
        loading: true,
        subscribed: true,
        handleIdOfSubscription: handleIdOfSubscription,
        handleIdOfTracker: handleIdOfTracker,
      },
    };
  },
});

registerAction({
  type: 'data.checklists.document.terminateSubscription',
  schema: {
    idOfchecklist: String,
  },
  scopePath: [
    'data.checklists.documents',
  ],
  reducer: (scopedState, {
    idOfchecklist,
  }) => {
    const documentInfo = scopedState[idOfchecklist];

    // If document is never loaded, do nothing.
    if (!documentInfo) {
      return scopedState;
    }

    const nextDocumentInfo = {...documentInfo};

    if (documentInfo.handleIdOfSubscription) {
      const handleOfSubscription = handleStorage.withdraw(documentInfo.handleIdOfSubscription);

      if (handleOfSubscription) {
        handleOfSubscription.stop();
      }
    }

    if (documentInfo.handleIdOfTracker) {
      const handleOfTracker = handleStorage.withdraw(documentInfo.handleIdOfTracker);

      if (handleOfTracker) {
        handleOfTracker.stop();
      }
    }

    return {
      ...scopedState,

      [idOfchecklist]: {
        ...documentInfo,

        handleIdOfSubscription: null,
        handleIdOfTracker: null,
      },
    };
  },
});

registerAction({
  type: 'data.checklists.document.updateLocal',
  schema: {
    idOfchecklist: String,
    document: {
      type: Object,
      blackbox: true,
    },
  },
  scopePath: [
    'data.checklists.documents',
  ],
  reducer: (scopedState, {
    idOfchecklist,
    document,
  }) => {
    const documentInfo = scopedState[idOfchecklist];

    if (documentInfo) {
      const isDocumentLoading = objectPath.get(documentInfo, 'loading', false);
      const isDocumentSubscribed = objectPath.get(documentInfo, 'subscribed', false);
      const isPendingDocumentUpdate = isDocumentLoading || isDocumentSubscribed;

      // Do nothing if the document is not subscribed nor being loaded.
      if (!isPendingDocumentUpdate) {
        return scopedState;
      }
    }

    return {
      ...scopedState,

      [idOfchecklist]: {
        ...documentInfo,

        loading: false,
        ready: true,
        lastUpdated: Date.now(),
        source: wrapJsonFriendlyChecklistDocument(document),
      },
    };
  },
});

registerAction({
  type: 'data.checklists.document.loadFromSsr',
  schema: {
    idOfchecklist: String,
    document: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  },
  scopePath: [
    'data.checklists.documents',
  ],
  reducer: (scopedState, {
    idOfchecklist,
    document,
  }) => {
    return {
      ...scopedState,

      [idOfchecklist]: {
        id: idOfchecklist,
        loading: false,
        subscribed: false,
        ready: true,
        lastUpdated: Date.now(),
        source: wrapJsonFriendlyChecklistDocument(document),
      },
    };
  },
});

registerAction({
  type: 'ui.checklist.listEditMode.enter',
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.list.inEditMode': true,
    };
  },
});

registerAction({
  type: 'ui.checklist.listEditMode.exit',
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.list.inEditMode': false,
      'ui.checklist.list.editMode.selection': null,
    };
  },
});

registerAction({
  type: 'ui.checklist.listEditMode.toggleItemSelection',
  schema: {
    itemIds: [String],
  },
  reducer: (state, {
    itemIds,
  }) => {
    const selection = objectPath.get(state, ['ui.checklist.list.editMode.selection'], {});

    const newSelection = itemIds.reduce((acc, itemId) => {
      const isItemSelected = objectPath.get(selection, [itemId], false);

      return {
        ...acc,
        [itemId]: !isItemSelected,
      };
    }, selection);

    return {
      ...state,

      'ui.checklist.list.editMode.selection': newSelection,
    };
  },
});

registerAction({
  type: 'ui.checklist.createNew',
  schema: {
    onReady: Function,
    onError: Function,
  },
  reducer: (state, {
    onReady,
    onError,
  }) => {
    return {
      ...actionSpecificReducer(state, {
        type: getAction('data.checklists.createNew').type,
        checklist: {
          name: '',
          steps: [],
        },
        onReady,
        onError,
      }),

      'ui.checklist.creatingNewChecklist': true,
    };
  },
});

registerAction({
  type: 'ui.checklist.createNewChecklist.markStart',
  schema: {
    newChecklist: ClientSideCreationSchema,
  },
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.creatingNewChecklist': true,
    };
  },
});

registerAction({
  type: 'ui.checklist.createNewChecklist.handleResponse',
  schema: {
    newChecklist: ClientSideCreationSchema,
    error: {
      type: Error,
      blackbox: true,
      optional: true,
    },
    response: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  },
  reducer: (state, {
    error,
    response,
  }) => {
    if (error) {
      return {
        ...state,

        'ui.checklist.creatingNewChecklist': false,
        'ui.checklist.errorWhenCreatingNewChecklist': {
          name: error.name,
          message: error.message,
        },
      };
    }

    return {
      ...state,

      'ui.checklist.creatingNewChecklist': false,
      'ui.checklist.idOfNewlyCreatedChecklist': response._id,
    };
  },
});

registerAction({
  type: 'ui.checklist.markNewlyCreatedChecklistAsOpen',
  schema: {
    idOfchecklist: String,
  },
  reducer: (state, {
    idOfchecklist,
  }) => {
    if (idOfchecklist && idOfchecklist !== state['ui.checklist.idOfNewlyCreatedChecklist']) {
      return state;
    }

    return {
      ...state,

      'ui.checklist.creatingNewChecklist': false,
      'ui.checklist.idOfNewlyCreatedChecklist': null,
      'ui.checklist.errorWhenCreatingNewChecklist': null,
    };
  },
});

registerAction({
  type: 'ui.checklist.startWaitingConfirmationOfNewStep',
  reducer: (state, {
    idOfchecklist,
  }) => {
    return {
      ...state,

      'ui.checklist.waitingConfirmationOfNewStep': true,
    };
  },
});

registerAction({
  type: 'ui.checklist.handleResponseFromCreatingNewStep',
  schema: {
    idOfchecklist: String,
    step: {
      type: Object,
      blackbox: true,
    },
    error: {
      type: Error,
      blackbox: true,
      optional: true,
    },
    response: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  },
  reducer: (state, {
    error,
    response,
  }) => {

    if (error) {
      const uiError = {
        name: 'unknown',
        message: 'Unexpected error',
      };

      if (error.error === 'validation-error' && error.details && error.details.length > 0) {
        uiError.name = 'ValidationError';
        uiError.message = error.details[0].message;
      }

      if (uiError.name === 'unknown') {
        console.error('Unexpected error when creating new step', error);
      }

      return {
        ...state,

        'ui.checklist.waitingConfirmationOfNewStep': false,
        'ui.checklist.errorWhenCreatingNewStep': uiError,
      };
    }

    console.warn('handle response', response);

    return {
      ...state,

      'ui.checklist.waitingConfirmationOfNewStep': false,
      'ui.checklist.errorWhenCreatingNewStep': null,
    };
  },
});

registerAction({
  type: 'ui.checklist.acknowledgeErrorWhenCreatingNewStep',
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.errorWhenCreatingNewStep': null,
    };
  },
});
