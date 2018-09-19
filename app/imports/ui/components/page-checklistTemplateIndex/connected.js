import defer from 'lodash/defer';
import { connect } from 'react-redux';
import objectPath from 'object-path';

import { getUriPathToChecklistTemplateItem } from '/imports/ui/routes';

import { getAction } from '/imports/ui/reduxStore';

import {
  createNew as createNewChecklist,
  remove as removeChecklists,
} from '/imports/api/checklists/methods';

import Component from './styled';

export default connect(
  // mapStateToProps
  (state /* , ownProps */) => {
    const isChecklistTemplateListDataLoading = objectPath.get(
      state,
      ['data.checklists.loading'],
      true,
    );
    const isChecklistTemplateListDataReady = objectPath.get(
      state,
      ['data.checklists.ready'],
      false,
    );
    const listOfChecklistTemplates = objectPath.get(
      state,
      ['data.checklists.items'],
      null,
    );
    const isInEditMode = objectPath.get(
      state,
      ['ui.checklist.list.inEditMode'],
      false,
    );
    const isCreatingNewChecklistTemplate = objectPath.get(
      state,
      ['ui.checklist.creatingNewChecklist'],
      false,
    );
    const idOfNewlyCreatedChecklistTemplate = objectPath.get(state, [
      'ui.checklist.idOfNewlyCreatedChecklist',
    ]);
    const selectionInEditMode = isInEditMode
      ? objectPath.get(state, ['ui.checklist.list.editMode.selection'], {})
      : {};
    const isItemSelectedInEditMode = (itemId) => {
      const isItemSelected = objectPath.get(
        selectionInEditMode,
        [itemId],
        false,
      );

      return isItemSelected;
    };
    const listOfSelectedItemsInEditMode = [
      isChecklistTemplateListDataReady,
      listOfChecklistTemplates,
      isInEditMode,
    ].every(Boolean)
      ? listOfChecklistTemplates
          .filter((doc) => isItemSelectedInEditMode(doc._id))
          .map((doc) => doc._id)
      : [];

    return {
      isChecklistTemplateListDataLoading,
      isChecklistTemplateListDataReady,
      listOfChecklistTemplates,
      isInEditMode,
      isCreatingNewChecklistTemplate,
      idOfNewlyCreatedChecklistTemplate,
      listOfSelectedItemsInEditMode,

      isItemSelectedInEditMode,
      getUriPathToChecklistTemplateItem,
    };
  },
  // mapDispatchToProps
  (dispatch /* , ownProps */) => ({
    enterEditMode: () => {
      dispatch({
        type: getAction('ui.checklistTemplate.index.editMode.enter').type,
      });
    },
    exitEditMode: () => {
      dispatch({
        type: getAction('ui.checklistTemplate.index.editMode.exit').type,
      });
    },
    toggleItemSelectionInEditMode: (itemIds) => {
      dispatch({
        type: getAction(
          'ui.checklistTemplate.index.editMode.toggleItemSelection',
        ).type,
        itemIds,
      });
    },
    requestToCreateNewChecklistTemplate: () => {
      const newChecklist = {};

      dispatch({
        type: getAction(
          'ui.checklistTemplate.index.createNewChecklist.markStart',
        ).type,
        newChecklist,
      });

      createNewChecklist.call(
        {
          newChecklist,
        },
        (error, response) => {
          dispatch({
            type: getAction(
              'ui.checklistTemplate.index.createNewChecklist.handleResponse',
            ).type,
            newChecklist,
            error,
            response,
          });
        },
      );
    },
    requestToRemoveChecklistTemplates: (idOfChecklists) => {
      //! Need to remove these items from selection.

      removeChecklists.call({
        ids: idOfChecklists,
      });
    },
    subscribeChecklistTemplates: () => {
      dispatch({
        type: getAction('data.checklistTemplate.index.subscribe').type,
        onListUpdate: (list) => {
          defer(() =>
            dispatch({
              type: getAction('data.checklistTemplate.index.updateLocalCopy')
                .type,
              list,
            }),
          );
        },
      });
    },
    stopSubscriptionOfChecklistTemplates: () => {
      dispatch({
        type: getAction('data.checklistTemplate.index.terminateSubscription')
          .type,
      });
    },
  }),
)(Component);
