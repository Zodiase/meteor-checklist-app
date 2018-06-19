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
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';

import {
  voidChecklistName,
} from '/imports/ui/consts';

import FullScreenSpinner from '/imports/ui/components/full-screen-spinner';

export default
class HomePage extends React.Component {
  static propTypes = {
    isChecklistListDataLoading: PropTypes.bool.isRequired,
    isChecklistListDataReady: PropTypes.bool.isRequired,
    listOfChecklists: PropTypes.arrayOf(PropTypes.object),
    isInEditMode: PropTypes.bool.isRequired,
    isCreatingNewChecklist: PropTypes.bool.isRequired,
    idOfNewlyCreatedChecklist: PropTypes.string,

    requestToCreateNewChecklist: PropTypes.func.isRequired,
    subscribeChecklists: PropTypes.func.isRequired,
    stopSubscriptionOfChecklists: PropTypes.func.isRequired,
    enterEditMode: PropTypes.func.isRequired,
    exitEditMode: PropTypes.func.isRequired,
    selectItemInEditMode: PropTypes.func.isRequired,
    isItemSelectedInEditMode: PropTypes.func.isRequired,
  };

  static defaultProps = {
    listOfChecklists: null,
    idOfNewlyCreatedChecklist: '',
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
    this.props.selectItemInEditMode(itemId);
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

      isItemSelectedInEditMode,
    } = this.props;

    const dateNow = Date.now();

    return (
      <div>
        <Helmet>
          <title>Homepage</title>
        </Helmet>

        {idOfNewlyCreatedChecklist && (
          <Redirect
            push
            to={`/checklist/${idOfNewlyCreatedChecklist}`}
          />
        )}

        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit" className={classes.flex}>
              Checklists
            </Typography>

            {!isInEditMode && (
              <IconButton
                onClick={this.onClickCreateChecklist}
                color="inherit"
              >
                <AddIcon />
              </IconButton>
            )}

            {!isInEditMode && (
              <IconButton
                onClick={this.onClickEnterEditModeButton}
                color="inherit"
              >
                <EditIcon />
              </IconButton>
            )}

            {isInEditMode && (
              <IconButton
                onClick={this.onClickExitEditModeButton}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            )}
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
