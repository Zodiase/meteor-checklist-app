import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import objectPath from 'object-path';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Helmet,
} from 'react-helmet';
import {
  Redirect,
  Link,
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import InputAdornment from '@material-ui/core/InputAdornment';
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@material-ui/icons/Add';

import {
  voidChecklistName,
} from '/imports/ui/consts';

import AppBarBackButton from '/imports/ui/components/appbar-back-button';
import AppBarLoadingProgress from '/imports/ui/components/appbar-loading-progress';

export default
class ChecklistItemPage extends React.Component {
  static propTypes = {
    idOfChecklist: PropTypes.string.isRequired,
    isLoadingChecklistDocument: PropTypes.bool.isRequired,
    isChecklistDocumentLoaded: PropTypes.bool.isRequired,
    checklistDocument: PropTypes.shape({
      name: PropTypes.string.isRequired,
      steps: PropTypes.array.isRequired,
    }),
    isNewlyCreatedChecklist: PropTypes.bool.isRequired,
    isWaitingConfirmationOfNewStep: PropTypes.bool.isRequired,
    errorWhenCreatingNewStep: PropTypes.shape({
      name: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    }),

    markNewlyCreatedChecklistAsOpen: PropTypes.func.isRequired,
    subscribeChecklist: PropTypes.func.isRequired,
    stopSubscriptionOfChecklist: PropTypes.func.isRequired,
    updateNameOfChecklist: PropTypes.func.isRequired,
    addStepToChecklist: PropTypes.func.isRequired,
    acknowledgeErrorWhenCreatingNewStep: PropTypes.func.isRequired,
  };

  static defaultProps = {
    checklistDocument: null,
    errorWhenCreatingNewStep: null,
  };

  constructor (props) {
    super(props);

    this.state = {
      // If true, the title should be editable.
      inTitleEditMode: true,
      // If true, the document has been successfully loaded. This is used to detect if the document is deleted.
      hasLoadedDocument: false,
      // If true, an update is in progress to save the changes.
      isSavingChanges: false,
      // Transitionary field for storing the description of the new step to be created.
      textOfTheDescriptionOfTheNewStep: '',
      // Copy of the error so the error message could be discarded at a later point.
      copyOfTheLastErrorWhenCreatingNewStep: null,
    };
  }

  static getDerivedStateFromProps (props, state) {
    const moreState = {};

    // The checklist is loaded for the first time.
    if (
      // Document loaded
      props.isChecklistDocumentLoaded
      // and is valid
      && props.checklistDocument
      // Never loaded before.
      && !state.hasLoadedDocument
    ) {
      moreState.hasLoadedDocument = true;
    }

    // The checklist disappeared after loaded.
    if (
      // Document loaded
      props.isChecklistDocumentLoaded
      // and is empty
      && !props.checklistDocument
      // and was loaded.
      && state.hasLoadedDocument
    ) {
      console.error('Unexpected Exception. Checklist was deleted externally.');
    }

    if (
      // Has error
      props.errorWhenCreatingNewStep
      // and is a different one
      && !isEqual(props.errorWhenCreatingNewStep, state.copyOfTheLastErrorWhenCreatingNewStep)
    ) {
      moreState.copyOfTheLastErrorWhenCreatingNewStep = cloneDeep(props.errorWhenCreatingNewStep);
    }

    return moreState;
  }

  componentDidMount () {
    this.props.subscribeChecklist();
  }

  componentDidUpdate () {
    const {
      isChecklistDocumentLoaded,
      isNewlyCreatedChecklist,
      markNewlyCreatedChecklistAsOpen,
    } = this.props;

    if (isChecklistDocumentLoaded && isNewlyCreatedChecklist) {
      markNewlyCreatedChecklistAsOpen();
    }
  }

  componentWillUnmount () {
    this.props.stopSubscriptionOfChecklist();
  }

  onClickTitle = () => {
    this.setState({
      inTitleEditMode: true,
    });
  };

  onChangeChecklistName = (event) => {
    const newName = event.target.value;

    this.props.updateNameOfChecklist(newName);
  };

  onChangeDescriptionOfNewStep = (event) => {
    const newDescription = event.target.value;

    this.setState({
      textOfTheDescriptionOfTheNewStep: newDescription,
    });
  };

  onSubmitNewStep = (event) => {
    event.preventDefault();

    const descriptionOfNewStep = this.state.textOfTheDescriptionOfTheNewStep;

    this.setState({
      textOfTheDescriptionOfTheNewStep: '',
    });
    this.props.addStepToChecklist({
      description: descriptionOfNewStep,
    });
  };

  onAcknowledgeErrorWhenCreatingNewStep = () => {
    this.props.acknowledgeErrorWhenCreatingNewStep();
  };

  render () {
    const {
      classes,
      isLoadingChecklistDocument,
      isChecklistDocumentLoaded,
      checklistDocument,
      isNewlyCreatedChecklist,
      isWaitingConfirmationOfNewStep,
      errorWhenCreatingNewStep,
    } = this.props;
    const {
      inTitleEditMode,
      hasLoadedDocument,
      isSavingChanges,
      textOfTheDescriptionOfTheNewStep,
      copyOfTheLastErrorWhenCreatingNewStep,
    } = this.state;

    const displayedChecklistName = isChecklistDocumentLoaded && checklistDocument && (checklistDocument.name || voidChecklistName);

    return (
      <div>
        <Helmet>
          <title>Loading...</title>
          {isChecklistDocumentLoaded && checklistDocument && (
            <title>{displayedChecklistName}</title>
          )}
        </Helmet>

        {isChecklistDocumentLoaded && !checklistDocument && !hasLoadedDocument && (
          <Redirect
            push
            to="/"
          />
        )}

        <AppBar position="static">
          <Toolbar>
            <AppBarBackButton
              component={Link}
              to="/checklist/index"
            />

            <Typography
              variant="title"
              color="inherit"
              style={{
                flex: 1,
              }}
            >
              {isChecklistDocumentLoaded && checklistDocument && !inTitleEditMode && (
                <Button
                  classes={{
                    root: classes.appBarTitleButton,
                  }}
                  onClick={this.onClickTitle}
                >
                  {displayedChecklistName}
                </Button>
              )}
              {isChecklistDocumentLoaded && checklistDocument && inTitleEditMode && (
                <TextField
                  autoFocus={isNewlyCreatedChecklist}
                  placeholder={voidChecklistName}
                  value={checklistDocument.name}
                  onChange={this.onChangeChecklistName}
                  margin="none"
                  InputProps={{
                    classes: {
                      root: classes['appBarTitleTextField.root'],
                      underline: classes['appBarTitleTextField.underline'],
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <CircularProgress
                          size={24}
                          thickness={5}
                          color="inherit"
                          variant={isSavingChanges ? 'indeterminate' : 'determinate'}
                          value={isSavingChanges ? 0 : 100}
                          style={{
                            transition: 'opacity 60ms ease-out 0.9s',
                            opacity: isSavingChanges ? 1 : 0,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              )}
              {!isChecklistDocumentLoaded && (
                <span>Loading...</span>
              )}
            </Typography>
          </Toolbar>
        </AppBar>
        <AppBarLoadingProgress
          show={isLoadingChecklistDocument}
        />

        <List>
          {isChecklistDocumentLoaded
          && checklistDocument
          && checklistDocument.steps.map(({
            id,
            description,
          }) => (
            <ListItem
              key={id}
              button
            >
              <ListItemText
                primary={description}
              />
            </ListItem>
          ))}

          <form
            onSubmit={this.onSubmitNewStep}
          >
            <ListItem>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>

              <TextField
                disabled={isWaitingConfirmationOfNewStep}
                placeholder="New step"
                value={textOfTheDescriptionOfTheNewStep}
                onChange={this.onChangeDescriptionOfNewStep}
                margin="none"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        disabled={isWaitingConfirmationOfNewStep}
                        size="small"
                        type="submit"
                      >
                        Create
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </ListItem>
          </form>
        </List>

        <pre>{JSON.stringify(checklistDocument, null, 2)}</pre>

        <Snackbar
          key="error-of-creating-new-step"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={errorWhenCreatingNewStep !== null}
          onClose={this.onAcknowledgeErrorWhenCreatingNewStep}
          ContentProps={{
            'aria-describedby': 'error-when-creating-new-step',
          }}
          message={(
            <span id="error-when-creating-new-step">
              {objectPath.get(copyOfTheLastErrorWhenCreatingNewStep, 'message')}
            </span>
          )}
          action={[
            <Button
              key="confirm"
              color="inherit"
              size="small"
              onClick={this.onAcknowledgeErrorWhenCreatingNewStep}
            >
              OK
            </Button>,
          ]}
        />

      </div>
    );
  }
}
