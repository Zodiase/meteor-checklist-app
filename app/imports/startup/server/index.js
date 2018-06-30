import React from 'react';
import PropTypes from 'prop-types';
import {
  renderToString,
} from 'react-dom/server';
import {
  StaticRouter,
} from 'react-router';
import createHistory from 'history/createMemoryHistory';
import {
  JssProvider,
  SheetsRegistry,
} from 'react-jss';
import {
  Provider,
} from 'react-redux';
import {
  connectRouter,
  routerMiddleware,
} from 'connected-react-router';
import {
  Helmet,
} from 'react-helmet';
import objectPath from 'object-path';
import Raven from 'raven';
import {
  Meteor,
} from 'meteor/meteor';
import {
  onPageLoad,
} from 'meteor/server-render';
import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
} from '@material-ui/core/styles';

import routes, {
  initializingReduxStoreForRouteSsr,
} from '/imports/ui/routes';
import {
  createStore,
  rootReducer,
} from '/imports/ui/redux-store';

import '/imports/api/checklists/publications';

((sentryDsn) => {
  if (!sentryDsn) {
    return;
  }

  Raven.config(sentryDsn, {
    logger: 'server',
  }).install();
})(objectPath.get(Meteor.settings, 'sentry.dsn'));

class App extends React.PureComponent {
  static propTypes = {
    baseUrl: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    jssRegistry: PropTypes.instanceOf(SheetsRegistry).isRequired,
    jssClassNameGenerator: PropTypes.func.isRequired,
    jssCache: PropTypes.instanceOf(Map).isRequired,
    theme: PropTypes.object.isRequired,
    reduxStore: PropTypes.object.isRequired,
    routerContext: PropTypes.object.isRequired,
  };

  render () {
    const {
      baseUrl,
      location,
      jssRegistry,
      jssClassNameGenerator,
      jssCache,
      theme,
      reduxStore,
      routerContext,
    } = this.props;

    return (
      <JssProvider
        registry={jssRegistry}
        generateClassName={jssClassNameGenerator}
      >
        <MuiThemeProvider
          theme={theme}
          sheetsManager={jssCache}
        >
          <Provider store={reduxStore}>
            <StaticRouter
              location={location}
              basename={baseUrl}
              context={routerContext}
            >
              {routes}
            </StaticRouter>
          </Provider>
        </MuiThemeProvider>
      </JssProvider>
    );
  }
}

const baseUrl = objectPath.get(Meteor.settings, 'public.baseUrl', '/');

onPageLoad(async (sink) => {
  const clientLocation = sink.request.url;
  const history = createHistory({
    basename: baseUrl,
  });
  history.push(clientLocation.href);

  const finalReducer = connectRouter(history)(rootReducer);
  const globalStateStore = createStore(finalReducer, {
    middlewares: [
      routerMiddleware(history),
    ],
  });
  const sheetsRegistry = new SheetsRegistry();
  const generateClassName = createGenerateClassName();
  const context = {};
  const theme = createMuiTheme({});

  await initializingReduxStoreForRouteSsr(globalStateStore, clientLocation);

  const initialHtml = renderToString((
    <App
      baseUrl={baseUrl}
      location={clientLocation}
      jssRegistry={sheetsRegistry}
      jssClassNameGenerator={generateClassName}
      jssCache={new Map()}
      theme={theme}
      reduxStore={globalStateStore}
      routerContext={context}
    />
  ));
  const initialCss = sheetsRegistry.toString();
  const preloadedState = globalStateStore.getState();
  const helmet = Helmet.renderStatic();

  console.log('Sending initial state', preloadedState);

  sink.renderIntoElementById('app', initialHtml);
  sink.appendToHead(`\n${helmet.meta.toString()}\n`);
  sink.appendToHead(`\n${helmet.title.toString()}\n`);
  sink.appendToHead(`\n${helmet.link.toString()}\n`);
  sink.appendToHead(`\n<style type="text/css" data-jss-ssr>\n${initialCss}\n</style>\n`);
  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
    </script>
  `);
});
