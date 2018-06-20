import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
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
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import InputAdornment from '@material-ui/core/InputAdornment';
import Snackbar from '@material-ui/core/Snackbar';
import SaveIcon from '@material-ui/icons/CloudUpload';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';

import {
  voidChecklistName,
} from '/imports/ui/consts';

import AppBarBackButton from '/imports/ui/components/appbar-back-button';
import AppBarLoadingProgress from '/imports/ui/components/appbar-loading-progress';

import {
  ClientSideCreationSchema,
} from '/imports/api/checklists/schema';

const isSubset = (objA, objB) => {
  return Object.entries(objA)
  .reduce((acc, [key, value]) => {
    if (!acc) {
      return false;
    }

    return isEqual(objB[key], value);
  }, true);
};

export default
class ChecklistItemPage extends React.Component {
  static propTypes = {
    idOfchecklist: PropTypes.string.isRequired,
    isLoadingChecklistDocument: PropTypes.bool.isRequired,
    isChecklistDocumentLoaded: PropTypes.bool.isRequired,
    checklistDocument: PropTypes.shape({
      name: PropTypes.string.isRequired,
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
    modifyChecklist: PropTypes.func.isRequired,
    addStepToChecklist: PropTypes.func.isRequired,
    acknowledgeErrorWhenCreatingNewStep: PropTypes.func.isRequired,
  };

  static defaultProps = {
    checklistDocument: null,
    errorWhenCreatingNewStep: null,
  };

  static getDerivedStateFromProps(props, state) {
    const moreState = {};
    const listOfNamesOfThePropertiesThatAreSubjectToChange = [
      'modifyDate',
    ];

    // Load a copy of the checklist.
    if (
      // Document loaded
      props.isChecklistDocumentLoaded
      // and is valid
      && props.checklistDocument
      // and not copied yet.
      && !state.copyOfOriginalChecklistDocument
    ) {
      moreState.copyOfOriginalChecklistDocument = cloneDeep(props.checklistDocument);
      moreState.updateDateOfChecklistDocument = props.updateDateOfChecklistDocument;
      moreState.mapOfEditsToChecklistDocument = {};
      moreState.mapOfEditsToChecklistDocumentIsDirty = false;

      console.info('Local copy of the checklist saved.', {
        extDoc: props.checklistDocument,
        copyDoc: moreState.copyOfOriginalChecklistDocument,
      });
    }

    // The checklist is changed externally (for whatever reason).
    if (
      // Document loaded
      props.isChecklistDocumentLoaded
      // and is valid
      && props.checklistDocument
      // and has non-empty copy
      && state.copyOfOriginalChecklistDocument
      // and copy is out of date.
      && !isEqual(
        omit(props.checklistDocument, listOfNamesOfThePropertiesThatAreSubjectToChange),
        omit(state.copyOfOriginalChecklistDocument, listOfNamesOfThePropertiesThatAreSubjectToChange)
      )
      // and newer.
      && props.updateDateOfChecklistDocument > state.updateDateOfChecklistDocument
    ) {
      // Update original copy to the latest version from server.
      moreState.copyOfOriginalChecklistDocument = props.checklistDocument;
      moreState.updateDateOfChecklistDocument = props.updateDateOfChecklistDocument;

      // Reduce `mapOfEditsToChecklistDocument` by removing properties that are present and identical on the (new) original copy.
      const listOfMinimalChanges = Object.entries(ClientSideCreationSchema.clean(state.mapOfEditsToChecklistDocument))
      .filter(([key, value]) => !isEqual(value, props.checklistDocument[key]));

      moreState.mapOfEditsToChecklistDocumentIsDirty = listOfMinimalChanges.length > 0;

      const newEditingCopy = listOfMinimalChanges.reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }), {});

      moreState.mapOfEditsToChecklistDocument = newEditingCopy;
    }

    // The checklist is changed externally (for whatever reason).
    if (
      // Document loaded
      props.isChecklistDocumentLoaded
      // and is empty
      && !props.checklistDocument
      // and has non-empty copy
      && state.copyOfOriginalChecklistDocument
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

  constructor (props) {
    super(props);

    this.state = {
      inTitleEditMode: true,
      copyOfOriginalChecklistDocument: null,
      // Date stored as number.
      updateDateOfChecklistDocument: 0,
      mapOfEditsToChecklistDocument: null,
      mapOfEditsToChecklistDocumentIsDirty: false,
      textOfTheDescriptionOfTheNewStep: '',
      copyOfTheLastErrorWhenCreatingNewStep: null,
    };
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

  getCleanChecklistProperty (propName, defaultValue) {
    const propertyValueFromOriginalCopy = objectPath.get(this.state.copyOfOriginalChecklistDocument, [propName], defaultValue);

    return propertyValueFromOriginalCopy;
  }

  getDirtyChecklistProperty (propName, defaultValue) {
    const propertyValueFromEditingCopy = objectPath.get(this.state.mapOfEditsToChecklistDocument, [propName]);

    if (typeof propertyValueFromEditingCopy !== 'undefined') {
      return propertyValueFromEditingCopy;
    }

    return this.getCleanChecklistProperty(propName, defaultValue);
  }

  setChecklistProperty (propName, value) {
    const editingCopy = cloneDeep(this.state.mapOfEditsToChecklistDocument);

    objectPath.set(editingCopy, [propName], value);

    const isEditingCopyDirty = this.isChecklistCopyDirty(editingCopy);

    this.sendUpdatesToServer(editingCopy);

    this.setState({
      mapOfEditsToChecklistDocument: editingCopy,
      mapOfEditsToChecklistDocumentIsDirty: isEditingCopyDirty,
    });
  }

  getFullCopyOfEditingChecklist (editingCopy) {
    return {
      ...cloneDeep(this.state.copyOfOriginalChecklistDocument),
      ...cloneDeep(editingCopy),
    };
  }

  isChecklistCopyDirty (checklistDocument) {
    return !isSubset(checklistDocument, this.state.copyOfOriginalChecklistDocument);
  }

  /**
   * Initiates a request for server to update the checklist document.
   * @param  {Object} editingCopy
   */
  sendUpdatesToServer (editingCopy) {
    this.props.modifyChecklist(editingCopy);
  }

  onClickTitle = () => {
    this.setState({
      inTitleEditMode: true,
    });
  };

  onChangeTitle = (event) => {
    this.setChecklistProperty('name', event.target.value);
  };

  onChangeDescriptionOfNewStep = (event) => {
    this.setState({
      textOfTheDescriptionOfTheNewStep: event.target.value,
    });
  };

  onSubmitNewStep = (event) => {
    event.preventDefault();

    const descriptionOfNewStep = this.state.textOfTheDescriptionOfTheNewStep;

    this.props.addStepToChecklist({
      description: descriptionOfNewStep,
    });

    this.setState({
      textOfTheDescriptionOfTheNewStep: '',
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
      copyOfOriginalChecklistDocument,
      mapOfEditsToChecklistDocumentIsDirty,
      textOfTheDescriptionOfTheNewStep,
      copyOfTheLastErrorWhenCreatingNewStep,
    } = this.state;

    const cleanChecklistName = this.getCleanChecklistProperty('name', '');
    const dirtyChecklistName = this.getDirtyChecklistProperty('name', '');

    return (
      <div>
        <Helmet>
          <title>Loading...</title>
          {isChecklistDocumentLoaded && checklistDocument && (
            <title>{cleanChecklistName || voidChecklistName}</title>
          )}
        </Helmet>

        {isChecklistDocumentLoaded && !checklistDocument && !copyOfOriginalChecklistDocument && (
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

            <Typography variant="title" color="inherit" style={{flex: 1}}>
              {isChecklistDocumentLoaded && checklistDocument && !inTitleEditMode && (
                <Button
                  classes={{
                    root: classes.appBarTitleButton,
                  }}
                  onClick={this.onClickTitle}
                >{cleanChecklistName || voidChecklistName}</Button>
              )}
              {isChecklistDocumentLoaded && checklistDocument && inTitleEditMode && (
                <TextField
                  autoFocus={isNewlyCreatedChecklist}
                  placeholder={voidChecklistName}
                  value={dirtyChecklistName}
                  onChange={this.onChangeTitle}
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
                          variant={mapOfEditsToChecklistDocumentIsDirty ? 'indeterminate' : 'determinate'}
                          value={mapOfEditsToChecklistDocumentIsDirty ? 0 : 100}
                          style={{
                            transition: 'opacity 60ms ease-out 0.9s',
                            opacity: mapOfEditsToChecklistDocumentIsDirty ? 1 : 0,
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
                      >Create</Button>
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
            >OK</Button>,
          ]}
        />

      </div>
    );
  }
}
