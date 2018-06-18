import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import objectPath from 'object-path';
import { Meteor } from 'meteor/meteor';
import { onPageLoad } from 'meteor/server-render';
import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
} from '@material-ui/core/styles';

import routes from '/imports/ui/routes';
import {
  createStore,
  setGlobalStore,
} from '/imports/ui/redux-store';

((sentryDsn) => {
  if (!sentryDsn) {
    return;
  }

  Raven.config(sentryDsn, {
    logger: 'client',
  }).install();
})(objectPath.get(Meteor.settings.public, 'sentry.dsn'));

class App extends React.Component {
  componentDidMount () {
    // Remove server-side rendered JSS styles.
    const jssStyles = document.querySelector('style[data-jss-ssr]');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render () {
    return (
      <MuiThemeProvider theme={this.props.theme}>
        <Provider store={this.props.store}>
          <BrowserRouter>
            <Switch>
              {routes}
            </Switch>
          </BrowserRouter>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

onPageLoad(() => {
  const globalStateStore = createStore();
  const theme = createMuiTheme({});

  setGlobalStore(globalStateStore);
  ReactDOM.hydrate((
    <App
      store={globalStateStore}
      theme={theme}
    />
  ), document.getElementById('app'));
});
