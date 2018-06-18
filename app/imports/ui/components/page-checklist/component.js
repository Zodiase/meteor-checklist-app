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
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import BackIcon from '@material-ui/icons/KeyboardArrowLeft';
import SaveIcon from '@material-ui/icons/CloudUpload';
import CheckIcon from '@material-ui/icons/Check';

import WithCircularSpinner from '/imports/ui/components/with-circular-spinner';

import {
  basicInfo as checklistSchema,
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
class ChecklistPage extends React.Component {
  static propTypes = {
    idOfchecklist: PropTypes.string.isRequired,
    isLoadingChecklistDocument: PropTypes.bool.isRequired,
    isChecklistDocumentLoaded: PropTypes.bool.isRequired,
    checklistDocument: PropTypes.shape({
      name: PropTypes.string,
    }),
    isNewlyCreatedChecklist: PropTypes.bool.isRequired,

    markNewlyCreatedChecklistAsOpen: PropTypes.func.isRequired,
    subscribeChecklist: PropTypes.func.isRequired,
    stopSubscriptionOfChecklist: PropTypes.func.isRequired,
    modifyChecklist: PropTypes.func.isRequired,
  };

  static defaultProps = {
    checklistDocument: null,
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
      const listOfMinimalChanges = Object.entries(checklistSchema.clean(state.mapOfEditsToChecklistDocument))
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
    console.log('event.target.value', event.target.value);
    this.setChecklistProperty('name', event.target.value);
  };

  render () {
    const {
      classes,
      isLoadingChecklistDocument,
      isChecklistDocumentLoaded,
      checklistDocument,
      isNewlyCreatedChecklist,
    } = this.props;
    const {
      inTitleEditMode,
      copyOfOriginalChecklistDocument,
      mapOfEditsToChecklistDocumentIsDirty,
    } = this.state;

    const checklistName = this.getCleanChecklistProperty('name', 'Untitled checklist');
    const titleString = this.getDirtyChecklistProperty('name', '');

    return (
      <div>
        <Helmet>
          <title>Loading...</title>
          {isChecklistDocumentLoaded && checklistDocument && (
            <title>{checklistName}</title>
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
            <Link className={classes['appBarBackButton.link']} to="/">
              <IconButton className={classes['appBarBackButton.root']} color="inherit" aria-label="Back">
                <BackIcon />
              </IconButton>
            </Link>
            <Typography variant="title" color="inherit" style={{flex: 1}}>
              {isChecklistDocumentLoaded && checklistDocument && !inTitleEditMode && (
                <Button
                  classes={{
                    root: classes.appBarTitleButton,
                  }}
                  onClick={this.onClickTitle}
                >{checklistName}</Button>
              )}
              {isChecklistDocumentLoaded && checklistDocument && inTitleEditMode && (
                <TextField
                  autoFocus={isNewlyCreatedChecklist}
                  placeholder="Untitled checklist"
                  value={titleString}
                  onChange={this.onChangeTitle}
                  margin="none"
                  InputProps={{
                    classes: {
                      root: classes['appBarTitleTextField.root'],
                      underline: classes['appBarTitleTextField.underline'],
                    },
                  }}
                  fullWidth
                />
              )}
              {!isChecklistDocumentLoaded && (
                <span>Loading...</span>
              )}
            </Typography>

            <WithCircularSpinner
              spinnerProps={{
                show: mapOfEditsToChecklistDocumentIsDirty,
                color: 'inherit',
                size: 40,
              }}
              style={{
                paddingLeft: 16,
                paddingRight: 16,
                opacity: mapOfEditsToChecklistDocumentIsDirty ? 1: 0,
                transition: 'opacity 60ms ease-out 1s',
              }}
            >
              {mapOfEditsToChecklistDocumentIsDirty && <SaveIcon />}
              {!mapOfEditsToChecklistDocumentIsDirty && <CheckIcon />}
            </WithCircularSpinner>
          </Toolbar>
        </AppBar>
        <div className={classes['appBarLoadingProgress.wrapper']}>
          {isLoadingChecklistDocument && (
            <LinearProgress
              classes={{
                root: classes['appBarLoadingProgress.root'],
              }}
            />
          )}
        </div>
      </div>
    );
  }
}
