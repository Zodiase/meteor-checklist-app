import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import BackIcon from '@material-ui/icons/KeyboardArrowLeft';

import {
  appBarBackButton,
} from '/imports/ui/common-style';

class AppBarBackButton extends React.PureComponent {
  render () {
    const {
      classes,
      ...otherProps
    } = this.props;

    return (
      <IconButton
        classes={{
          root: classes['appBarBackButton.root'],
        }}
        color="inherit"
        aria-label="Back"

        {...otherProps}
      >
        <BackIcon />
      </IconButton>
    );
  }
}

export default withStyles(appBarBackButton)(AppBarBackButton);
