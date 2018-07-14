import objectPath from 'object-path';
import {
  Meteor,
} from 'meteor/meteor';
import {
  Tracker,
} from 'meteor/tracker';

import handleStorage from '/imports/handleStorage';
import {
  registerAction,
} from '/imports/ui/reduxStore';
import Checklists from '/imports/api/checklists/collections';
import {
  sortByCreateDate,
} from '/imports/api/checklists/consts';

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
  type: 'data.checklistTemplate.index.subscribe',
  schema: {
    onListUpdate: Function,
  },
  reducer: (state, {
    onListUpdate,
  }) => {
    const handleOfSubscription = Meteor.subscribe('checklists.index');
    const handleIdOfSubscription = handleStorage.deposit(handleOfSubscription);
    const handleOfTracker = Tracker.autorun(() => {
      console.group(`Autorun for subscription ${handleIdOfSubscription}`);

      const checklistDocsCursor = Checklists.find(
        {},
        {
          sort: [
            sortByCreateDate,
          ],
          // Be aware of transforming here. The data sent from server could already be transformed.
          transform: null,
        },
      );

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
  type: 'data.checklistTemplate.index.terminateSubscription',
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
  type: 'data.checklistTemplate.index.updateLocalCopy',
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
  type: 'data.checklistTemplate.document.subscribe',
  schema: {
    idOfChecklist: String,
    onDocumentUpdate: Function,
  },
  scopePath: [
    'data.checklists.documents',
  ],
  reducer: (scopedState, {
    idOfChecklist,
    onDocumentUpdate,
  }) => {
    const documentInfo = scopedState[idOfChecklist];

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
        idOfChecklist,
      },
      {
        onStop: (error) => {
          if (error) {
            // Subscription is stopped by server error.
          } else {
            // Subscription is stopped normally.
          }
        },
      },
    );
    const handleIdOfSubscription = handleStorage.deposit(handleOfSubscription);
    const handleOfTracker = Tracker.autorun(() => {
      const checklistDocsCursor = Checklists.find(
        {
          _id: idOfChecklist,
        },
        {
          // Be aware of transforming here. The data sent from server could already be transformed.
          transform: null,
        },
      );

      if (handleOfSubscription.ready() && checklistDocsCursor) {
        const checklistDoc = checklistDocsCursor.fetch()[0];

        onDocumentUpdate(checklistDoc);
      }
    });
    const handleIdOfTracker = handleStorage.deposit(handleOfTracker);

    return {
      ...scopedState,

      [idOfChecklist]: {
        ...documentInfo,

        id: idOfChecklist,
        loading: true,
        subscribed: true,
        handleIdOfSubscription,
        handleIdOfTracker,
      },
    };
  },
});

registerAction({
  type: 'data.checklistTemplate.document.terminateSubscription',
  schema: {
    idOfChecklist: String,
  },
  scopePath: [
    'data.checklists.documents',
  ],
  reducer: (scopedState, {
    idOfChecklist,
  }) => {
    const documentInfo = scopedState[idOfChecklist];

    // If document is never loaded, do nothing.
    if (!documentInfo) {
      return scopedState;
    }

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

      [idOfChecklist]: {
        ...documentInfo,

        handleIdOfSubscription: null,
        handleIdOfTracker: null,
      },
    };
  },
});

registerAction({
  type: 'data.checklistTemplate.document.updateLocalCopy',
  schema: {
    idOfChecklist: String,
    document: {
      type: Object,
      blackbox: true,
    },
  },
  scopePath: [
    'data.checklists.documents',
  ],
  reducer: (scopedState, {
    idOfChecklist,
    document,
  }) => {
    const documentInfo = scopedState[idOfChecklist];

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

      [idOfChecklist]: {
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
  type: 'data.checklistTemplate.document.updateLocalCopy--ssr',
  schema: {
    idOfChecklist: String,
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
    idOfChecklist,
    document,
  }) => {
    return {
      ...scopedState,

      [idOfChecklist]: {
        id: idOfChecklist,
        loading: false,
        subscribed: false,
        ready: true,
        lastUpdated: Date.now(),
        source: wrapJsonFriendlyChecklistDocument(document),
      },
    };
  },
});
