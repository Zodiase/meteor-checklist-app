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
  appBarBackButton,
} from '/imports/ui/common-style';

import {
  createNew as createNewChecklist,
  remove as removeChecklists,
} from '/imports/api/checklists/methods';

import Component from './component';

const styles = (theme) => ({
  ...appBarLoadingProgress,
  ...appBarBackButton,
  flex: {
    flex: 1,
  },
  disabled: {},
  editModeSelectionCheckbox: {
    width: 20,
    height: 20,
  },
  appBarIconButton: {
    color: 'inherit',
  },
  appBarDefault: {},
  appBarInEditMode: {},
});

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const isChecklistListDataLoading = objectPath.get(state, ['data.checklists.loading'], true);
    const isChecklistListDataReady = objectPath.get(state, ['data.checklists.ready'], false);
    const listOfChecklists = objectPath.get(state, ['data.checklists.items'], null);
    const isInEditMode = objectPath.get(state, ['ui.checklist.list.inEditMode'], false);
    const isCreatingNewChecklist = objectPath.get(state, ['ui.checklist.creatingNewChecklist'], false);
    const idOfNewlyCreatedChecklist = objectPath.get(state, ['ui.checklist.idOfNewlyCreatedChecklist']);
    const selectionInEditMode = isInEditMode && objectPath.get(state, ['ui.checklist.list.editMode.selection'], {}) || {};
    const isItemSelectedInEditMode = (itemId) => {
      const isItemSelected = objectPath.get(selectionInEditMode, [itemId], false);

      return isItemSelected;
    };
    const listOfSelectedItemsInEditMode = [
      isChecklistListDataReady,
      listOfChecklists,
      isInEditMode,
    ].every(Boolean)
    && (
      listOfChecklists.filter((doc) => isItemSelectedInEditMode(doc._id))
      .map((doc) => doc._id)
    )
    || [];

    return {
      isChecklistListDataLoading, 
      isChecklistListDataReady,
      listOfChecklists,
      isInEditMode,
      isCreatingNewChecklist,
      idOfNewlyCreatedChecklist,
      listOfSelectedItemsInEditMode,

      isItemSelectedInEditMode,
    };
  },
  // mapDispatchToProps
  (dispatch, ownProps) => ({
    enterEditMode: () => {
      dispatch({
        type: getAction('ui.checklist.listEditMode.enter').type,
      });
    },
    exitEditMode: () => {
      dispatch({
        type: getAction('ui.checklist.listEditMode.exit').type,
      });
    },
    toggleItemSelectionInEditMode: (itemIds) => {
      dispatch({
        type: getAction('ui.checklist.listEditMode.toggleItemSelection').type,
        itemIds,
      });
    },
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
    requestToRemoveChecklists: (idOfChecklists) => {
      //! Need to remove these items from selection.

      removeChecklists.call({
        ids: idOfChecklists,
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
