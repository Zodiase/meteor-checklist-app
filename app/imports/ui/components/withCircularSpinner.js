import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export default (props) => {
  const {
    spinnerProps: {
      show: showSpinner = false,
      size: spinnerSize = 40,
      color: spinnerColor = 'primary',
      style: spinnerStyle,
      ...otherSpinnerProps
    },
    style,
    children,
    ...otherProps
  } = props;

  return (
    <div
      {...otherProps}
      style={{
        position: 'relative',

        ...style,
      }}
    >
      {children}
      <CircularProgress
        {...otherSpinnerProps}
        size={spinnerSize}
        color={spinnerColor}
        variant={showSpinner ? 'indeterminate' : 'determinate'}
        value={showSpinner ? 0 : 100}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginLeft: -spinnerSize / 2,
          marginTop: -spinnerSize / 2,
          zIndex: 1,

          transition: 'opacity 60ms ease-out 0.9s',
          opacity: showSpinner ? 1 : 0,
          pointerEvents: 'none',

          ...spinnerStyle,
        }}
      />
    </div>
  );
};
