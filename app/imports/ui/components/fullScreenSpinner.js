import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class FullScreenSpinner extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool,
  };

  static defaultProps = {
    open: false,
  };

  render() {
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={this.props.open}
        PaperProps={{
          elevation: 5,
          style: {
            borderRadius: '50%',
          },
        }}
      >
        <CircularProgress size={64} thickness={4} />
      </Dialog>
    );
  }
}
