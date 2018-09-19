import { withStyles } from '@material-ui/core/styles';

import Component from './component';

const styles = (/* theme */) => ({
  flex: {
    flex: 1,
  },
  disabled: {},
  editModeSelectionCheckbox: {
    width: 20,
    height: 20,
  },
  appBarIconButton: {
    color: 'inherit',
  },
  appBarDefault: {},
  appBarInEditMode: {},
});

export default withStyles(styles)(Component);
