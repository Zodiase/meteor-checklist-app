import defer from 'lodash/defer';
import {
  connect,
} from 'react-redux';
import objectPath from 'object-path';
import {
  withStyles,
} from '@material-ui/core/styles';

import {
  getAction,
} from '/imports/ui/reduxStore';

import {
  updateName as updateNameOfChecklist,
  addStep as addStepToChecklist,
  updateStepDescription as updateStepDescriptionOfChecklist,
  removeStep as removeStepFromChecklist,
  reorderStep as reorderStepOfChecklist,
} from '/imports/api/checklists/methods';

import Component from './component';

const styles = (theme) => ({
  appBarTitleButton: {
    justifyContent: 'flex-start',
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
      borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
  moveIndicator: {
    border: '3px dotted black',
    borderTop: 0,
    borderBottom: 0,
    height: '21px',
    display: 'block',
    position: 'absolute',
    left: '8px',
    width: '3px',
    boxSizing: 'content-box',
    opacity: 0.1,
  },
  stepDescriptionTextField: {
    marginTop: '-4px',
    marginBottom: '-4px',
  },
});

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const idOfChecklist = objectPath.get(ownProps, 'match.params.id');
    const isLoadingChecklistDocument = objectPath.get(state, ['data.checklists.documents', idOfChecklist, 'loading'], false);
    const isChecklistDocumentLoaded = objectPath.get(state, ['data.checklists.documents', idOfChecklist, 'ready'], false);
    const checklistDocument = objectPath.get(state, ['data.checklists.documents', idOfChecklist, 'source']);
    const updateDateOfChecklistDocument = objectPath.get(state, ['data.checklists.documents', idOfChecklist, 'lastUpdated'], 0);
    const idOfNewlyCreatedChecklist = objectPath.get(state, ['ui.checklist.idOfNewlyCreatedChecklist']);
    const isNewlyCreatedChecklist = idOfChecklist === idOfNewlyCreatedChecklist;
    const isWaitingConfirmationOfNewStep = objectPath.get(state, ['ui.checklist.waitingConfirmationOfNewStep'], false);
    const errorWhenCreatingNewStep = objectPath.get(state, ['ui.checklist.errorWhenCreatingNewStep'], null);

    return {
      idOfChecklist,
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
    const idOfChecklist = objectPath.get(ownProps, 'match.params.id');

    return {
      markNewlyCreatedChecklistAsOpen: () => {
        dispatch({
          type: getAction('ui.checklistTemplate.index.createNewChecklist.openedTheNewOne').type,
          idOfChecklist,
        });
      },
      subscribeChecklist: () => {
        dispatch({
          type: getAction('data.checklistTemplate.document.subscribe').type,
          idOfChecklist,
          onDocumentUpdate: (document) => {
            defer(() => dispatch({
              type: getAction('data.checklistTemplate.document.updateLocalCopy').type,
              idOfChecklist,
              document,
            }));
          },
        });
      },
      stopSubscriptionOfChecklist: () => {
        dispatch({
          type: getAction('data.checklistTemplate.document.terminateSubscription').type,
          idOfChecklist,
        });
      },
      updateNameOfChecklist: (newName) => {
        //! Show indicator for pending changes.

        updateNameOfChecklist.call({
          idOfChecklist,
          newName,
        }, (/* error, response */) => {
          //! Hide indicator for pending changes.
        });
      },
      addStepToChecklist: (stepObj) => {
        dispatch({
          type: getAction('ui.checklistTemplate.document.createNewStep.startWaitingConfirmation').type,
        });

        addStepToChecklist.call({
          idOfChecklist,
          step: {
            ...stepObj,
          },
        }, (error, response) => {
          dispatch({
            type: getAction('ui.checklistTemplate.document.createNewStep.handleResponse').type,
            idOfChecklist,
            step: stepObj,
            error,
            response,
          });
        });
      },
      updateStepDescription: (stepId, newDescription) => {
        //! Show indicator for pending changes.

        if (newDescription === '') {
          removeStepFromChecklist.call({
            idOfChecklist,
            stepId,
          }, (/* error, response */) => {
            //! Hide indicator for pending changes.
          });
        } else {
          updateStepDescriptionOfChecklist.call({
            idOfChecklist,
            stepId,
            newDescription,
          }, (/* error, response */) => {
            //! Hide indicator for pending changes.
          });
        }
      },
      reorderStep: (oldIndex, newIndex) => {
        //! Show indicator for pending changes.

        reorderStepOfChecklist.call({
          idOfChecklist,
          oldIndex,
          newIndex,
        }, (/* error, response */) => {
          //! Hide indicator for pending changes.
        });
      },
      acknowledgeErrorWhenCreatingNewStep: () => {
        dispatch({
          type: getAction('ui.checklistTemplate.document.createNewStep.acknowledgeError').type,
        });
      },
    };
  },
)(withStyles(styles)(Component));
