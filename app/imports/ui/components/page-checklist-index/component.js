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
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import DeleteIcon from '@material-ui/icons/Delete';
import BackIcon from '@material-ui/icons/KeyboardArrowLeft';

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

    return <React.Fragment>
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
            <IconButton
              className={classes['appBarBackButton.root']}
              color="inherit"
              aria-label="Back"
              onClick={this.onClickExitEditModeButton}
            >
              <BackIcon />
            </IconButton>

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
      <div className={classes['appBarLoadingProgress.wrapper']}>
        {isChecklistListDataLoading && (
          <LinearProgress
            classes={{
              root: classes['appBarLoadingProgress.root'],
            }}
          />
        )}
      </div>
    </React.Fragment>;
  }

  renderRedirects () {
    const {
      idOfNewlyCreatedChecklist,
    } = this.props;

    return <React.Fragment>
      {idOfNewlyCreatedChecklist && (
        <Redirect
          push
          to={`/checklist/item/${idOfNewlyCreatedChecklist}`}
        />
      )}
    </React.Fragment>;
  }

  renderModals () {
    const {
      isCreatingNewChecklist,
    } = this.props;

    return <React.Fragment>
      <FullScreenSpinner
        open={isCreatingNewChecklist}
      />
    </React.Fragment>;
  }

  renderList () {
    const {
      classes,
      isChecklistListDataReady,
      listOfChecklists,
      isInEditMode,

      isItemSelectedInEditMode,
    } = this.props;
    const dateNow = Date.now();

    return <React.Fragment>
      {[
        isChecklistListDataReady,
        listOfChecklists,
      ].every(Boolean) && (
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
                to: `/checklist/item/${_id}`,
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
    </React.Fragment>;
  }

  render () {
    return <React.Fragment>
      {this.renderRedirects()}

      {this.renderAppBar()}

      {this.renderList()}

      {this.renderModals()}
    </React.Fragment>;
  }
}
