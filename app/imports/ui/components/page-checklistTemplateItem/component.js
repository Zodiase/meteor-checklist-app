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
import {
  arrayMove,
} from 'react-sortable-hoc';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import InputAdornment from '@material-ui/core/InputAdornment';
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@material-ui/icons/Add';

import {
  voidChecklistName,
} from '/imports/ui/consts';

import AppBarBackButton from '/imports/ui/components/appbar__backButton';
import AppBarLoadingProgress from '/imports/ui/components/appbar__LoadingProgress';
import SortableList from '/imports/ui/components/SortableList';
import SortableListItem from '/imports/ui/components/SortableListItem';
import SortableHandle from '/imports/ui/components/SortableHandle';

export default
class ChecklistTemplateItemPage extends React.Component {
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

    getUriPathToHome: PropTypes.func.isRequired,
    getUriPathToChecklistTemplateList: PropTypes.func.isRequired,

    markNewlyCreatedChecklistAsOpen: PropTypes.func.isRequired,
    subscribeChecklist: PropTypes.func.isRequired,
    stopSubscriptionOfChecklist: PropTypes.func.isRequired,
    updateNameOfChecklist: PropTypes.func.isRequired,
    addStepToChecklist: PropTypes.func.isRequired,
    updateStepDescription: PropTypes.func.isRequired,
    reorderStep: PropTypes.func.isRequired,
    acknowledgeErrorWhenCreatingNewStep: PropTypes.func.isRequired,
  };

  static defaultProps = {
    checklistDocument: null,
    errorWhenCreatingNewStep: null,
  };

  constructor (props) {
    super(props);

    this.state = {
      isEditingChecklistName: false,
      // A copy of the loaded document for detecting changes.
      // This is also used to detect if the document is deleted.
      copyOfChecklistDocument: null,
      // A copy of the steps for debouncing editing changes.
      cachedChecklistName: '',
      // A copy of the steps for debouncing editing changes.
      cachedChecklistSteps: null,
      // If true, an update is in progress to save the changes.
      isSavingChanges: false,
      // Copy of the error so the error message could be discarded at a later point.
      cachedLastErrorWhenCreatingNewStep: null,
      idOfStepBeingEdited: '',
      transitionaryValueOfTheNewNameOfTheChecklist: '',
      transitionaryValueOfTheDescriptionOfTheNewStep: '',
      transitionaryValueOfTheNewDescriptionOfTheStepBeingEdited: '',
    };
  }

  static getDerivedStateFromProps (props, state) {
    const moreState = {};

    // Update data copies.
    if (
      // Document loaded
      props.isChecklistDocumentLoaded
      // and is valid
      && props.checklistDocument
      && !isEqual(props.checklistDocument, state.copyOfChecklistDocument)
    ) {
      moreState.copyOfChecklistDocument = cloneDeep(props.checklistDocument);
      moreState.cachedChecklistName = cloneDeep(props.checklistDocument.name);
      moreState.cachedChecklistSteps = cloneDeep(props.checklistDocument.steps);
    }

    // The checklist disappeared after loaded.
    if (
      // Document loaded
      props.isChecklistDocumentLoaded
      // and is empty
      && !props.checklistDocument
      // and was loaded.
      && state.copyOfChecklistDocument
    ) {
      console.error('Unexpected Exception. Checklist was deleted externally.');
    }

    if (
      // Has error
      props.errorWhenCreatingNewStep
      // and is a different one
      && !isEqual(props.errorWhenCreatingNewStep, state.cachedLastErrorWhenCreatingNewStep)
    ) {
      moreState.cachedLastErrorWhenCreatingNewStep = cloneDeep(props.errorWhenCreatingNewStep);
    }

    moreState.isEditingChecklistName = props.isNewlyCreatedChecklist || state.isEditingChecklistName;

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

  onChangeChecklistName = (event) => {
    const newName = event.target.value;

    this.setState({
      transitionaryValueOfTheNewNameOfTheChecklist: newName,
    });
  };

  onSubmitEditsForChecklistName = (event) => {
    event.preventDefault();

    this.exitEditModeForChecklistName();
  };

  onChangeDescriptionOfNewStep = (event) => {
    const newDescription = event.target.value;

    this.setState({
      transitionaryValueOfTheDescriptionOfTheNewStep: newDescription,
    });
  };

  onSubmitNewStep = (event) => {
    event.preventDefault();

    const descriptionOfNewStep = this.state.transitionaryValueOfTheDescriptionOfTheNewStep;

    this.setState({
      transitionaryValueOfTheDescriptionOfTheNewStep: '',
    });
    this.props.addStepToChecklist({
      description: descriptionOfNewStep,
    });
  };

  onChangeActivelyEditedStepDescription = (event) => {
    const newDescription = event.target.value;

    this.setState({
      transitionaryValueOfTheNewDescriptionOfTheStepBeingEdited: newDescription,
    });
  };

  onSubmitEditsForStep = (event) => {
    event.preventDefault();

    this.exitEditModeForStep();
  };

  onSortStepEnd = ({
    oldIndex,
    newIndex,
  }) => {
    this.setState({
      cachedChecklistSteps: arrayMove(this.state.cachedChecklistSteps, oldIndex, newIndex),
    });
    this.props.reorderStep(oldIndex, newIndex);
  };

  onAcknowledgeErrorWhenCreatingNewStep = () => {
    this.props.acknowledgeErrorWhenCreatingNewStep();
  };

  getDisplayedChecklistName () {
    return this.state.cachedChecklistName || voidChecklistName;
  }

  enterEditModeForChecklistName = () => {
    this.setState({
      isEditingChecklistName: true,
      transitionaryValueOfTheNewNameOfTheChecklist: this.props.checklistDocument.name,
    });
  };

  exitEditModeForChecklistName = () => {
    const {
      transitionaryValueOfTheNewNameOfTheChecklist: newName,
    } = this.state;

    this.setState({
      isEditingChecklistName: false,
      transitionaryValueOfTheNewNameOfTheChecklist: '',
      cachedChecklistName: newName,
    });
    this.props.updateNameOfChecklist(newName);
  };

  enterEditModeForStep = (stepId) => {
    if (stepId === this.state.idOfStepBeingEdited) {
      return;
    }

    const step = this.props.checklistDocument.steps.find((someStep) => someStep.id === stepId);

    if (!step) {
      throw new Error(`Unable to initiate edit mode for step '${stepId}'. Step not found.`);
    }

    this.setState({
      idOfStepBeingEdited: stepId,
      transitionaryValueOfTheNewDescriptionOfTheStepBeingEdited: step.description,
    });
  };

  exitEditModeForStep = () => {
    const {
      idOfStepBeingEdited: stepId,
      transitionaryValueOfTheNewDescriptionOfTheStepBeingEdited: newDescription,
      cachedChecklistSteps,
    } = this.state;

    if (!stepId) {
      return;
    }

    if (stepId) {
      const step = cachedChecklistSteps.find((someStep) => someStep.id === stepId);

      if (step && step.description !== newDescription) {
        const newCopyOfSteps = cachedChecklistSteps.map((someStep) => (
          someStep.id === stepId
            ? {
              ...someStep,
              description: newDescription,
            }
            : someStep
        ));

        this.setState({
          cachedChecklistSteps: newCopyOfSteps,
        });

        this.props.updateStepDescription(
          stepId,
          newDescription,
        );
      }
    }

    this.setState({
      idOfStepBeingEdited: '',
      transitionaryValueOfTheNewDescriptionOfTheStepBeingEdited: '',
    });
  };

  renderRedirects () {
    const {
      isChecklistDocumentLoaded,
      checklistDocument,
      getUriPathToHome,
    } = this.props;
    const {
      copyOfChecklistDocument,
    } = this.state;

    return isChecklistDocumentLoaded
    && !checklistDocument
    && !copyOfChecklistDocument
    && (
      <Redirect
        push
        to={getUriPathToHome()}
      />
    );
  }

  renderAppBar () {
    const {
      classes,
      isLoadingChecklistDocument,
      isChecklistDocumentLoaded,
      checklistDocument,
      getUriPathToChecklistTemplateList,
    } = this.props;
    const {
      isEditingChecklistName,
      transitionaryValueOfTheNewNameOfTheChecklist,
      isSavingChanges,
    } = this.state;
    const displayedChecklistName = this.getDisplayedChecklistName();

    return (
      <React.Fragment>
        <Helmet>
          <title>Loading...</title>
          {isChecklistDocumentLoaded && checklistDocument && (
            <title>{displayedChecklistName}</title>
          )}
        </Helmet>

        <AppBar position="static">
          <form
            onSubmit={this.onSubmitEditsForChecklistName}
          >
            <Toolbar>
              <AppBarBackButton
                component={Link}
                to={getUriPathToChecklistTemplateList()}
              />

              <Typography
                variant="title"
                color="inherit"
                style={{
                  flex: 1,
                }}
              >
                {isChecklistDocumentLoaded && checklistDocument && !isEditingChecklistName && (
                  <Button
                    classes={{
                      root: classes.appBarTitleButton,
                    }}
                    fullWidth
                    onClick={this.enterEditModeForChecklistName}
                  >
                    {displayedChecklistName}
                  </Button>
                )}
                {isChecklistDocumentLoaded && checklistDocument && isEditingChecklistName && (
                  <TextField
                    autoFocus
                    placeholder={voidChecklistName}
                    value={transitionaryValueOfTheNewNameOfTheChecklist}
                    onChange={this.onChangeChecklistName}
                    onBlur={this.exitEditModeForChecklistName}
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
          </form>
        </AppBar>

        <AppBarLoadingProgress
          show={isLoadingChecklistDocument}
        />
      </React.Fragment>
    );
  }

  renderStepList () {
    const {
      classes,
      isChecklistDocumentLoaded,
      checklistDocument,
      isWaitingConfirmationOfNewStep,
    } = this.props;
    const {
      cachedChecklistSteps,
      transitionaryValueOfTheDescriptionOfTheNewStep,
    } = this.state;

    return (
      <SortableList
        // pressDelay={200}
        axis="y"
        lockAxis="y"
        lockToContainerEdges
        lockOffset="0%"
        useDragHandle
        onSortEnd={this.onSortStepEnd}
      >
        <form
          onSubmit={this.onSubmitEditsForStep}
        >
          {isChecklistDocumentLoaded
          && checklistDocument
          && cachedChecklistSteps.map((step, index) => {
            const {
              id,
            } = step;

            return (
              <SortableListItem
                key={id}
                index={index}
              >
                <SortableHandle
                  className={classes.moveIndicator}
                />
                {this.renderListItemContentForStep(step)}
              </SortableListItem>
            );
          })}
        </form>

        <form
          // The form element is outside of the list so it doesn't interfere the flexbox layout.
          onSubmit={this.onSubmitNewStep}
        >
          <ListItem>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>

            <TextField
              disabled={isWaitingConfirmationOfNewStep}
              placeholder="New step"
              value={transitionaryValueOfTheDescriptionOfTheNewStep}
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
      </SortableList>
    );
  }

  renderListItemContentForStep (step) {
    const {
      id,
      description,
    } = step;
    const {
      classes,
    } = this.props;
    const {
      idOfStepBeingEdited,
      transitionaryValueOfTheNewDescriptionOfTheStepBeingEdited,
    } = this.state;
    const isBeingEdited = idOfStepBeingEdited && (idOfStepBeingEdited === id);

    return (
      <ListItemText
        {...(isBeingEdited
        ? {
          primary: (
            <TextField
              classes={{
                root: classes.stepDescriptionTextField,
              }}
              autoFocus
              placeholder="Empty step will be removed"
              value={transitionaryValueOfTheNewDescriptionOfTheStepBeingEdited}
              onChange={this.onChangeActivelyEditedStepDescription}
              onBlur={this.exitEditModeForStep}
              margin="none"
              fullWidth
            />
          ),
        }
        : {
          primary: description,
          onClick: () => this.enterEditModeForStep(id),
        })}
      />
    );
  }

  renderModals () {
    const {
      errorWhenCreatingNewStep,
    } = this.props;
    const {
      cachedLastErrorWhenCreatingNewStep,
    } = this.state;

    return (
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
            {objectPath.get(cachedLastErrorWhenCreatingNewStep, 'message')}
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
    );
  }

  render () {

    return (
      <React.Fragment>
        {this.renderRedirects()}

        {this.renderAppBar()}

        {this.renderStepList()}

        <pre>{JSON.stringify(this.props.checklistDocument, null, 2)}</pre>

        {this.renderModals()}
      </React.Fragment>
    );
  }
}
