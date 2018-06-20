import React from 'react';
import PropTypes from 'prop-types';
import {
  Helmet,
} from 'react-helmet';
import moment from 'moment';
import {
  Redirect,
  Link,
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  voidChecklistName,
} from '/imports/ui/consts';

import FullScreenSpinner from '/imports/ui/components/full-screen-spinner';

export default
class ChecklistIndexPage extends React.Component {
  static propTypes = {
    isChecklistListDataLoading: PropTypes.bool.isRequired,
    isChecklistListDataReady: PropTypes.bool.isRequired,
    listOfChecklists: PropTypes.arrayOf(PropTypes.object),
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

  render () {
    const {
      classes,
      isChecklistListDataLoading,
      isChecklistListDataReady,
      listOfChecklists,
      isInEditMode,
      isCreatingNewChecklist,
      idOfNewlyCreatedChecklist,
      listOfSelectedItemsInEditMode,

      isItemSelectedInEditMode,
    } = this.props;

    const pageTitle = 'Checklists';
    const dateNow = Date.now();

    return (
      <div>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>

        {idOfNewlyCreatedChecklist && (
          <Redirect
            push
            to={`/checklist/${idOfNewlyCreatedChecklist}`}
          />
        )}

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
          <Toolbar>
            <Typography variant="title" color="inherit" className={classes.flex}>
              {pageTitle}
            </Typography>

            {!isInEditMode && <React.Fragment>
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
            </React.Fragment>}

            {isInEditMode && <React.Fragment>
              <IconButton
                classes={{
                  root: classes.appBarIconButton,
                }}
                disabled={!listOfSelectedItemsInEditMode.length}
                onClick={this.onClickDeleteSelectedInEditModeButton}
              >
                <DeleteIcon />
              </IconButton>

              <Badge
                classes={{
                  root: classes['selectionCountBadge.root'],
                  badge: classes['selectionCountBadge.badge'],
                }}
                color="secondary"
                badgeContent={(
                  <Typography
                    variant="button"
                    color="inherit"
                  >{listOfSelectedItemsInEditMode.length}</Typography>
                )}
              > </Badge>

              <IconButton
                classes={{
                  root: classes.appBarIconButton,
                }}
                onClick={this.onClickSelectAllItemsInEditModeButton}
              >
                <SelectAllIcon />
              </IconButton>

              <IconButton
                classes={{
                  root: classes.appBarIconButton,
                }}
                onClick={this.onClickExitEditModeButton}
              >
                <CloseIcon />
              </IconButton>
            </React.Fragment>}
          </Toolbar>
        </AppBar>
        <div className={classes['appBarLoadingProgress.wrapper']}>
          {isChecklistListDataLoading && (
            <LinearProgress
              classes={{
                root: classes['appBarLoadingProgress.root'],
              }}
            />
          )}
        </div>

        {isChecklistListDataReady && listOfChecklists && (
          <List>
            {listOfChecklists.map(({
              _id,
              name,
              createDate,
            }) => (
              <ListItem
                key={_id}
                button
                {...(isInEditMode && {
                  onClick: () => this.onSelectItem(_id),
                })}
                {...(!isInEditMode && {
                  component: Link,
                  to: `/checklist/${_id}`,
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
                  secondary={moment.duration(moment(createDate).diff(dateNow)).humanize(true)}
                />
              </ListItem>
            ))}
          </List>
        )}

        <FullScreenSpinner
          open={isCreatingNewChecklist}
        />
      </div>
    );
  }
}
