import {
  withStyles,
} from '@material-ui/core/styles';

import Component from './component';

const styles = (theme) => ({
  appBarTitleButton: {
    justifyContent: 'flex-start',
    textTransform: 'none',
    font: 'inherit',
    color: 'inherit',
    marginLeft: -(theme.spacing.unit * 2),
  },
  'appBarTitleTextField.root': {
    font: 'inherit',
    color: 'inherit',
  },
  disabled: {},
  focused: {},
  error: {},
  'appBarTitleTextField.underline': {
    '&:after': {
      borderBottomColor: 'white',
    },
    '&:before': {
      borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover:not($disabled):not($focused):not($error):before': {
      borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
  moveIndicator: {
    border: '3px dotted black',
    borderTop: 0,
    borderBottom: 0,
    height: '21px',
    display: 'block',
    position: 'absolute',
    left: '8px',
    width: '3px',
    boxSizing: 'content-box',
    opacity: 0.1,
  },
  stepDescriptionTextField: {
    marginTop: '-4px',
    marginBottom: '-4px',
  },
});

export default withStyles(styles)(Component);
