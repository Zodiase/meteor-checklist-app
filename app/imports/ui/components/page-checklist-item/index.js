import defer from 'lodash/defer';
import debounce from 'lodash/debounce';
import uuid from 'uuid/v4';
import {
  connect,
} from 'react-redux';
import objectPath from 'object-path';
import { withStyles } from '@material-ui/core/styles';

import {
  getAction,
} from '/imports/ui/redux-store';

import {
  update as updateChecklist,
  addStep as addStepToChecklist,
} from '/imports/api/checklists/methods';

import Component from './component';

const styles = (theme) => ({
  appBarTitleButton: {
    textTransform: 'none',
    font: 'inherit',
    color: 'inherit',
    marginLeft: -(theme.spacing.unit * 2),
  },
  'appBarTitleTextField.root': {
    font: 'inherit',
    color: 'inherit',
  },
  disabled: {},
  focused: {},
  error: {},
  'appBarTitleTextField.underline': {
    '&:after': {
      borderBottomColor: 'white',
    },
    '&:before': {
      borderBottomColor: 'transparent',
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
});

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const idOfchecklist = objectPath.get(ownProps, 'match.params.id');
    const isLoadingChecklistDocument = objectPath.get(state, ['data.checklists.documents', idOfchecklist, 'loading'], false);
    const isChecklistDocumentLoaded = objectPath.get(state, ['data.checklists.documents', idOfchecklist, 'ready'], false);
    const checklistDocument = objectPath.get(state, ['data.checklists.documents', idOfchecklist, 'source']);
    const updateDateOfChecklistDocument = objectPath.get(state, ['data.checklists.documents', idOfchecklist, 'lastUpdated'], 0);
    const idOfNewlyCreatedChecklist = objectPath.get(state, ['ui.checklist.idOfNewlyCreatedChecklist']);
    const isNewlyCreatedChecklist = idOfchecklist === idOfNewlyCreatedChecklist;
    const isWaitingConfirmationOfNewStep = objectPath.get(state, ['ui.checklist.waitingConfirmationOfNewStep'], false);
    const errorWhenCreatingNewStep = objectPath.get(state, ['ui.checklist.errorWhenCreatingNewStep'], null);

    return {
      idOfchecklist,
      isLoadingChecklistDocument,
      isChecklistDocumentLoaded,
      checklistDocument,
      updateDateOfChecklistDocument,
      isNewlyCreatedChecklist,
      isWaitingConfirmationOfNewStep,
      errorWhenCreatingNewStep,
    };
  },
  // mapDispatchToProps
  (dispatch, ownProps) => {
    const idOfchecklist = objectPath.get(ownProps, 'match.params.id');

    return {
      markNewlyCreatedChecklistAsOpen: () => {
        dispatch({
          type: getAction('ui.checklist.markNewlyCreatedChecklistAsOpen').type,
          idOfchecklist,
        });
      },
      subscribeChecklist: () => {
        dispatch({
          type: getAction('data.checklists.document.subscribe').type,
          idOfchecklist,
          onDocumentUpdate: (document) => {
            defer(() => dispatch({
              type: getAction('data.checklists.document.updateLocal').type,
              idOfchecklist,
              document,
            }));
          },
        });
      },
      stopSubscriptionOfChecklist: () => {
        dispatch({
          type: getAction('data.checklists.document.terminateSubscription').type,
          idOfchecklist,
        });
      },
      modifyChecklist: debounce((changes) => {
        console.log('Sending changes...', {
          idOfchecklist,
          changes,
        });

        //! Update state to reflect changes?
        updateChecklist.call({
          id: idOfchecklist,
          changes,
        });
      }, 2000),
      addStepToChecklist: (stepObj) => {
        dispatch({
          type: getAction('ui.checklist.startWaitingConfirmationOfNewStep').type,
        });

        addStepToChecklist.call({
          idOfchecklist,
          step: {
            ...stepObj,
            id: uuid(),
          },
        }, (error, response) => {
          dispatch({
            type: getAction('ui.checklist.handleResponseFromCreatingNewStep').type,
            idOfchecklist,
            step: stepObj,
            error,
            response,
          });
        });
      },
      acknowledgeErrorWhenCreatingNewStep: () => {
        dispatch({
          type: getAction('ui.checklist.acknowledgeErrorWhenCreatingNewStep').type,
        });
      },
    };
  },
)(withStyles(styles)(Component));
