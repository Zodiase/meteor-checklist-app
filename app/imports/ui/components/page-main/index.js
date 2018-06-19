import defer from 'lodash/defer';
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
} from '/imports/ui/common-style';

import {
  createNew as createNewChecklist,
} from '/imports/api/checklists/methods';

import Component from './component';

const styles = {
  ...appBarLoadingProgress,
  flex: {
    flex: 1,
  },
};

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const isChecklistListDataLoading = objectPath.get(state, ['data.checklists.loading'], true);
    const isChecklistListDataReady = objectPath.get(state, ['data.checklists.ready'], false);
    const listOfChecklists = objectPath.get(state, ['data.checklists.items'], null);
    const isCreatingNewChecklist = objectPath.get(state, ['ui.checklist.creatingNewChecklist'], false);
    const idOfNewlyCreatedChecklist = objectPath.get(state, ['ui.checklist.idOfNewlyCreatedChecklist']);

    return {
      isChecklistListDataLoading, 
      isChecklistListDataReady,
      listOfChecklists,
      isCreatingNewChecklist,
      idOfNewlyCreatedChecklist,
    };
  },
  // mapDispatchToProps
  (dispatch, ownProps) => ({
    requestToCreateNewChecklist: () => {
      const newChecklist = {};

      dispatch({
        type: getAction('ui.checklist.createNewChecklist.markStart').type,
        newChecklist,
      });

      createNewChecklist.call({
        newChecklist,
      }, (error, response) => {
        dispatch({
          type: getAction('ui.checklist.createNewChecklist.handleResponse').type,
          newChecklist,
          error,
          response,
        });
      });
    },
    subscribeChecklists: () => {
      dispatch({
        type: getAction('data.checklists.subscribe').type,
        onListUpdate: (list) => {
          defer(() => dispatch({
            type: getAction('data.checklists.update').type,
            list,
          }));
        },
      });
    },
    stopSubscriptionOfChecklists: () => {
      dispatch({
        type: getAction('data.checklists.terminateSubscription').type,
      });
    },
  }),
)(withStyles(styles)(Component));
