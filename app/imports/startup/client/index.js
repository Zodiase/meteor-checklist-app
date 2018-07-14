import React from 'react';
import ReactDOM from 'react-dom';
import createHistory from 'history/createBrowserHistory';
import {
  ConnectedRouter,
  connectRouter,
  routerMiddleware,
} from 'connected-react-router';
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

import App from '/imports/ui/App';
import {
  createStore,
  setGlobalStore,
  rootReducer,
} from '/imports/ui/reduxStore';
import './sentry';

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
    <MuiThemeProvider
      theme={theme}
    >
      <App
        reduxStore={globalStateStore}
        RouterComponent={ConnectedRouter}
        routerProps={{
          history,
        }}
      />
    </MuiThemeProvider>,
    document.getElementById('app'),
    () => {
      console.log('App rendered');

      // Remove server-side rendered JSS styles.
      const jssStyles = document.querySelector('style[data-jss-ssr]');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    },
  );
});
