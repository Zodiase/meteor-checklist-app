import React from 'react';
import PropTypes from 'prop-types';
import {
  Helmet,
} from 'react-helmet';
import pluralize from 'pluralize';
import {
  Redirect,
  Link,
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  voidChecklistName,
} from '/imports/ui/consts';

import AppBarBackButton from '/imports/ui/components/appbar__backButton';
import AppBarLoadingProgress from '/imports/ui/components/appbar__LoadingProgress';
import FullScreenSpinner from '/imports/ui/components/fullScreenSpinner';

export default
class ChecklistTemplateIndexPage extends React.Component {
  static propTypes = {
    isChecklistListDataLoading: PropTypes.bool.isRequired,
    isChecklistListDataReady: PropTypes.bool.isRequired,
    listOfChecklists: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      stepCount: PropTypes.number.isRequired,
    })),
    isInEditMode: PropTypes.bool.isRequired,
    isCreatingNewChecklist: PropTypes.bool.isRequired,
    idOfNewlyCreatedChecklist: PropTypes.string,
    listOfSelectedItemsInEditMode: PropTypes.arrayOf(PropTypes.string),

    requestToCreateNewChecklist: PropTypes.func.isRequired,
    requestToRemoveChecklists: PropTypes.func.isRequired,
    subscribeChecklists: PropTypes.func.isRequired,
    stopSubscriptionOfChecklists: PropTypes.func.isRequired,
    enterEditMode: PropTypes.func.isRequired,
    exitEditMode: PropTypes.func.isRequired,
    toggleItemSelectionInEditMode: PropTypes.func.isRequired,
    isItemSelectedInEditMode: PropTypes.func.isRequired,
    getUriPathToChecklistTemplateItem: PropTypes.func.isRequired,
  };

  static defaultProps = {
    listOfChecklists: null,
    idOfNewlyCreatedChecklist: '',
    listOfSelectedItemsInEditMode: [],
  };

  componentDidMount () {
    this.props.subscribeChecklists();
  }

  componentWillUnmount () {
    this.props.stopSubscriptionOfChecklists();
  }

  onClickCreateChecklist = () => {
    this.props.requestToCreateNewChecklist();
  };

  onClickEnterEditModeButton = () => {
    this.props.enterEditMode();
  };

  onClickExitEditModeButton = () => {
    this.props.exitEditMode();
  };

  onSelectItem = (itemId) => {
    this.props.toggleItemSelectionInEditMode([itemId]);
  };

  onClickSelectAllItemsInEditModeButton = () => {
    const {
      listOfChecklists,
      listOfSelectedItemsInEditMode,
      isItemSelectedInEditMode,
      toggleItemSelectionInEditMode,
    } = this.props;

    if (!listOfChecklists) {
      return;
    }

    if (listOfSelectedItemsInEditMode.length < listOfChecklists.length) {
      // Select the rest.
      const listOfItemsToSelect = listOfChecklists.filter((doc) => !isItemSelectedInEditMode(doc._id));
      const listOfItemIds = listOfItemsToSelect.map((doc) => doc._id);

      toggleItemSelectionInEditMode(listOfItemIds);
    } else {
      // Deselect all.
      const listOfItemIds = listOfChecklists.map((doc) => doc._id);

      toggleItemSelectionInEditMode(listOfItemIds);
    }
  };

  onClickDeleteSelectedInEditModeButton = () => {
    const {
      listOfSelectedItemsInEditMode,
      requestToRemoveChecklists,
    } = this.props;

    requestToRemoveChecklists(listOfSelectedItemsInEditMode);
  };

  renderAppBar () {
    const {
      classes,
      isChecklistListDataLoading,
      isChecklistListDataReady,
      listOfChecklists,
      isInEditMode,
      listOfSelectedItemsInEditMode,
    } = this.props;

    const pageTitle = 'Checklists';

    return (
      <React.Fragment>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>

        <AppBar
          classes={{
            colorDefault: (
              isInEditMode
              ? classes.appBarInEditMode
              : classes.appBarDefault
            ),
          }}
          color="default"
          position="static"
          elevation={0}
        >
          {!isInEditMode && (
            <Toolbar key="toolbar-default">
              <Typography
                variant="title"
                color="inherit"
                className={classes.flex}
              >
                {pageTitle}
              </Typography>

              <React.Fragment>
                <IconButton
                  classes={{
                    root: classes.appBarIconButton,
                  }}
                  onClick={this.onClickCreateChecklist}
                >
                  <AddIcon />
                </IconButton>

                <IconButton
                  classes={{
                    root: classes.appBarIconButton,
                  }}
                  disabled={![
                    isChecklistListDataReady,
                    listOfChecklists,
                    listOfChecklists.length > 0,
                  ].every(Boolean)}
                  onClick={this.onClickEnterEditModeButton}
                >
                  <EditIcon />
                </IconButton>
              </React.Fragment>
            </Toolbar>
          )}

          {isInEditMode && (
            <Toolbar key="toolbar-editmode">
              <AppBarBackButton
                onClick={this.onClickExitEditModeButton}
              />

              <Typography
                variant="subheading"
                color="inherit"
                className={classes.flex}
              >
                {listOfSelectedItemsInEditMode.length}
              </Typography>

              <React.Fragment>
                <IconButton
                  classes={{
                    root: classes.appBarIconButton,
                  }}
                  disabled={!listOfSelectedItemsInEditMode.length}
                  onClick={this.onClickDeleteSelectedInEditModeButton}
                >
                  <DeleteIcon />
                </IconButton>

                <IconButton
                  classes={{
                    root: classes.appBarIconButton,
                  }}
                  onClick={this.onClickSelectAllItemsInEditModeButton}
                >
                  <SelectAllIcon />
                </IconButton>
              </React.Fragment>
            </Toolbar>
          )}
        </AppBar>
        <AppBarLoadingProgress
          show={isChecklistListDataLoading}
        />
      </React.Fragment>
    );
  }

  renderRedirects () {
    const {
      idOfNewlyCreatedChecklist,
      getUriPathToChecklistTemplateItem,
    } = this.props;

    return (
      <React.Fragment>
        {idOfNewlyCreatedChecklist && (
          <Redirect
            push
            to={getUriPathToChecklistTemplateItem(idOfNewlyCreatedChecklist)}
          />
        )}
      </React.Fragment>
    );
  }

  renderModals () {
    const {
      isCreatingNewChecklist,
    } = this.props;

    return (
      <React.Fragment>
        <FullScreenSpinner
          open={isCreatingNewChecklist}
        />
      </React.Fragment>
    );
  }

  renderList () {
    const {
      classes,
      isChecklistListDataReady,
      listOfChecklists,
      isInEditMode,

      isItemSelectedInEditMode,
      getUriPathToChecklistTemplateItem,
    } = this.props;

    return (
      <React.Fragment>
        {[
          isChecklistListDataReady,
          listOfChecklists,
        ].every(Boolean) && (
          <List>
            {listOfChecklists.map(({
              _id,
              name,
              stepCount,
            }) => (
              <ListItem
                key={_id}
                button
                {...(isInEditMode && {
                  onClick: () => this.onSelectItem(_id),
                })}
                {...(!isInEditMode && {
                  component: Link,
                  to: getUriPathToChecklistTemplateItem(_id),
                })}
              >
                {isInEditMode && (
                  <Checkbox
                    className={classes.editModeSelectionCheckbox}
                    checked={isItemSelectedInEditMode(_id)}
                    tabIndex={-1}
                    disableRipple
                  />
                )}

                <ListItemText
                  primary={name || voidChecklistName}
                  secondary={pluralize('step', stepCount, true)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </React.Fragment>
    );
  }

  render () {
    return (
      <React.Fragment>
        {this.renderRedirects()}

        {this.renderAppBar()}

        {this.renderList()}

        {this.renderModals()}
      </React.Fragment>
    );
  }
}
