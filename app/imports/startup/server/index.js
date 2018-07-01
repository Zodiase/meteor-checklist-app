import React from 'react';
import {
  renderToString,
} from 'react-dom/server';
import createHistory from 'history/createMemoryHistory';
import {
  JssProvider,
  SheetsRegistry,
} from 'react-jss';
import {
  StaticRouter,
} from 'react-router';
import {
  connectRouter,
  routerMiddleware,
} from 'connected-react-router';
import {
  Helmet,
} from 'react-helmet';
import {
  onPageLoad,
} from 'meteor/server-render';
import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
} from '@material-ui/core/styles';

import {
  baseUrl,
  pageSsrMark,
} from '/imports/consts.server';
import App from '/imports/ui/App';
import {
  initializingReduxStoreForRouteSsr,
} from '/imports/ui/routes';
import {
  createStore,
  rootReducer,
} from '/imports/ui/redux-store';
import '/imports/api/checklists/publications';
import './sentry';

onPageLoad(async (sink) => {
  const clientLocation = sink.request.url;
  const history = createHistory({
    basename: baseUrl,
  });
  history.push(clientLocation.href);

  console.group(`${pageSsrMark} Page visit: ${clientLocation.href}`);

  const finalReducer = connectRouter(history)(rootReducer);
  const globalStateStore = createStore(finalReducer, {
    middlewares: [
      routerMiddleware(history),
    ],
  });
  const theme = createMuiTheme({});
  const generateClassName = createGenerateClassName();
  const sheetsRegistry = new SheetsRegistry();

  await initializingReduxStoreForRouteSsr(globalStateStore, clientLocation);

  const initialHtml = renderToString((
    <JssProvider
      generateClassName={generateClassName}
      registry={sheetsRegistry}
    >
      <MuiThemeProvider
        theme={theme}
        sheetsManager={new Map()}
      >
        <App
          reduxStore={globalStateStore}
          RouterComponent={StaticRouter}
          routerProps={{
            basename: baseUrl,
            location: clientLocation,
            context: {},
          }}
        />
      </MuiThemeProvider>
    </JssProvider>
  ));
  const initialCss = sheetsRegistry.toString();
  const preloadedState = globalStateStore.getState();
  const helmet = Helmet.renderStatic();

  console.log('Preloaded State', preloadedState);

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

  console.groupEnd();
});
