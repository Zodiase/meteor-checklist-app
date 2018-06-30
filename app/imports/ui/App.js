import React from 'react';
import PropTypes from 'prop-types';
import {
  Provider,
} from 'react-redux';

import routes from './routes';

export default
class App extends React.PureComponent {
  static propTypes = {
    reduxStore: PropTypes.object.isRequired,
    RouterComponent: PropTypes.oneOfType([
      PropTypes.instanceOf(React.Component),
      PropTypes.func,
    ]).isRequired,
    routerProps: PropTypes.object.isRequired,
  };

  render () {
    const {
      reduxStore,
      RouterComponent,
      routerProps,
    } = this.props;

    return (
      <Provider store={reduxStore}>
        <RouterComponent {...routerProps}>
          {routes}
        </RouterComponent>
      </Provider>
    );
  }
}
