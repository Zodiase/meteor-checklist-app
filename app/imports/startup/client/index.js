import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  Switch,
} from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import {
  Provider,
} from 'react-redux';
import {
  connectRouter,
  routerMiddleware,
  ConnectedRouter,
} from 'connected-react-router';
import Raven from 'raven-js';
import objectPath from 'object-path';
import {
  Meteor,
} from 'meteor/meteor';
import {
  onPageLoad,
} from 'meteor/server-render';
import {
  MuiThemeProvider,
  createMuiTheme,
} from '@material-ui/core/styles';

import routes from '/imports/ui/routes';
import {
  createStore,
  setGlobalStore,
  rootReducer,
} from '/imports/ui/redux-store';

((sentryDsn) => {
  if (!sentryDsn) {
    return;
  }

  Raven.config(sentryDsn, {
    logger: 'client',
  }).install();
})(objectPath.get(Meteor.settings.public, 'sentry.dsn'));

class App extends React.PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  componentDidMount () {
    // Remove server-side rendered JSS styles.
    const jssStyles = document.querySelector('style[data-jss-ssr]');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render () {
    const {
      theme,
      store,
      history,
    } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Switch>
              {routes}
            </Switch>
          </ConnectedRouter>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

const baseUrl = objectPath.get(Meteor.settings, 'public.baseUrl', '/');

onPageLoad(() => {
  const history = createHistory({
    basename: baseUrl,
  });
  const finalReducer = connectRouter(history)(rootReducer);
  const globalStateStore = createStore(
    finalReducer,
    {
      middlewares: [
        routerMiddleware(history),
      ],
    },
  );
  const theme = createMuiTheme({});

  setGlobalStore(globalStateStore);
  ReactDOM.hydrate(
    <App
      store={globalStateStore}
      theme={theme}
      history={history}
    />,
    document.getElementById('app'),
  );
});
