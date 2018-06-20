import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import LinearProgress from '@material-ui/core/LinearProgress';

import {
  appBarLoadingProgress,
} from '/imports/ui/common-style';

class AppBarLoadingProgress extends React.PureComponent {
  static propTypes = {
    show: PropTypes.bool,
  };

  static defaultProps = {
    show: false,
  };

  render () {
    const {
      classes,
      show,
      ...otherProps
    } = this.props;

    return (
      <Fade
        in={show}
      >
        <div className={classes['appBarLoadingProgress.wrapper']}>
          <LinearProgress
            classes={{
              root: classes['appBarLoadingProgress.root'],
            }}

            {...otherProps}
          />
        </div>
      </Fade>
    );
  }
}

export default withStyles(appBarLoadingProgress)(AppBarLoadingProgress);
