import objectPath from 'object-path';

import {
  registerAction,
} from '/imports/ui/reduxStore';
import {
  ClientSideCreationSchema,
} from '/imports/api/checklists/schema';

registerAction({
  type: 'ui.checklistTemplate.index.editMode.enter',
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.list.inEditMode': true,
    };
  },
});

registerAction({
  type: 'ui.checklistTemplate.index.editMode.exit',
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.list.inEditMode': false,
      'ui.checklist.list.editMode.selection': null,
    };
  },
});

registerAction({
  type: 'ui.checklistTemplate.index.editMode.toggleItemSelection',
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
  type: 'ui.checklistTemplate.index.createNewChecklist.markStart',
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
  type: 'ui.checklistTemplate.index.createNewChecklist.handleResponse',
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
  type: 'ui.checklistTemplate.index.createNewChecklist.openedTheNewOne',
  schema: {
    idOfChecklist: String,
  },
  reducer: (state, {
    idOfChecklist,
  }) => {
    if (idOfChecklist && idOfChecklist !== state['ui.checklist.idOfNewlyCreatedChecklist']) {
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
  type: 'ui.checklistTemplate.document.createNewStep.startWaitingConfirmation',
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.waitingConfirmationOfNewStep': true,
    };
  },
});

registerAction({
  type: 'ui.checklistTemplate.document.createNewStep.handleResponse',
  schema: {
    idOfChecklist: String,
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
  type: 'ui.checklistTemplate.document.createNewStep.acknowledgeError',
  reducer: (state) => {
    return {
      ...state,

      'ui.checklist.errorWhenCreatingNewStep': null,
    };
  },
});
