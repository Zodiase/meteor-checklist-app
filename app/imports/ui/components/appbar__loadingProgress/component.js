import React from 'react';
import PropTypes from 'prop-types';
import Fade from '@material-ui/core/Fade';
import LinearProgress from '@material-ui/core/LinearProgress';

export default class AppBarLoadingProgress extends React.PureComponent {
  static propTypes = {
    classes: PropTypes.object,

    show: PropTypes.bool,
  };

  static defaultProps = {
    classes: {},

    show: false,
  };

  render() {
    const { classes, show, ...otherProps } = this.props;

    return (
      <Fade in={show}>
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
