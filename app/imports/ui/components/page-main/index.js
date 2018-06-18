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

import Component from './component';

const styles = {
  ...appBarLoadingProgress,
  flex: {
    flex: 1,
  },
};

export default connect(
  // mapStateToProps
  (state, ownProps) => ({
    isChecklistListDataLoading: objectPath.get(state, ['data.checklists.loading'], true),
    isChecklistListDataReady: objectPath.get(state, ['data.checklists.ready'], false),
    listOfChecklists: objectPath.get(state, ['data.checklists.items'], null),
    isCreatingNewChecklist: objectPath.get(state, 'ui.checklist.creatingNewChecklist', false),
    idOfNewlyCreatedChecklist: objectPath.get(state, ['ui.checklist.idOfNewlyCreatedChecklist']),
  }),
  // mapDispatchToProps
  (dispatch, ownProps) => ({
    requestToCreateNewChecklist: () => {
      dispatch({
        type: getAction('ui.checklist.createNew').type,
        onReady: ({ _id }) => {
          dispatch({
            type: getAction('ui.checklist.recordNewlyCreatedChecklist').type,
            docId: _id,
          });
        },
        onError: (error) => {
          dispatch({
            type: getAction('ui.checklist.recordErrorWhenCreatingNewChecklist').type,
            error,
          });
        },
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
