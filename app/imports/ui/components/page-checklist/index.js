import defer from 'lodash/defer';
import debounce from 'lodash/debounce';
import {
  connect,
} from 'react-redux';
import objectPath from 'object-path';
import { withStyles } from '@material-ui/core/styles';

import {
  getAction,
} from '/imports/ui/redux-store';

import {
  appBarLoadingProgress,
  appBarBackButton,
} from '/imports/ui/common-style';

import {
  update as updateChecklist,
} from '/imports/api/checklists/methods';

import Component from './component';

const styles = (theme) => ({
  ...appBarLoadingProgress,
  ...appBarBackButton,
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

    return {
      idOfchecklist,
      isLoadingChecklistDocument,
      isChecklistDocumentLoaded,
      checklistDocument,
      updateDateOfChecklistDocument,
      isNewlyCreatedChecklist,
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
    };
  },
)(withStyles(styles)(Component));
