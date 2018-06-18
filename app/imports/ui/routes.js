import React from 'react';
import objectPath from 'object-path';
import {
  Route,
  matchPath,
} from 'react-router-dom';
import Head from '/imports/ui/components/head';
import HomePage from '/imports/ui/components/page-main';
import ChecklistPage from '/imports/ui/components/page-checklist';
import {
  getAll as getAllChecklists,
  getOneById as getOneChecklistById,
} from '/imports/api/checklists/methods';
import {
  store as globalStateStore,
  getAction,
} from '/imports/ui/redux-store';

const routeConfigs = [
  {
    routeProps: {
      exact: true,
      path: '/',
      component: HomePage,
    },
    initializingData: async (dispatch, props) => {
      const checklists = await getAllChecklists.callPromise();

      dispatch({
        type: getAction('data.checklists.update').type,
        list: checklists,
      });
    },
  },
  {
    routeProps: {
      exact: true,
      path: '/checklist/:id',
      component: ChecklistPage,
    },
    initializingData: async (dispatch, props) => {
      console.log(`Getting data for route ${objectPath.get(props, 'match.path')}`, objectPath.get(props, 'match.params'));

      const idOfchecklist = objectPath.get(props, 'match.params.id');

      const checklist = idOfchecklist && await getOneChecklistById.callPromise({
        id: idOfchecklist,
      });

      if (!checklist) {
        // 404.
        dispatch({
          type: getAction('data.checklists.document.loadFromSsr').type,
          idOfchecklist,
          document: null,
        });
        return;
      }

      dispatch({
        type: getAction('data.checklists.document.loadFromSsr').type,
        idOfchecklist,
        document: checklist,
      });
    },
  },
];

export
const initializingReduxStoreForRouteSsr = async (store, location) => {
  const matchedRoute = routeConfigs.find((config) => matchPath(location.href, config.routeProps));

  if (!matchedRoute || !matchedRoute.initializingData) {
    return;
  }

  const match = matchPath(location.href, matchedRoute.routeProps);

  return await matchedRoute.initializingData(store.dispatch, {
    match,
  });
};

export default (
  <React.Fragment>
    <Head />
    {routeConfigs.map(({routeProps}) => (
      <Route key={routeProps.path} {...routeProps} />
    ))}
  </React.Fragment>
);
