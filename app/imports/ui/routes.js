import React from 'react';
import objectPath from 'object-path';
import {
  Route,
  Redirect,
  matchPath,
} from 'react-router-dom';
import Head from '/imports/ui/components/head';
import ChecklistIndexPage from '/imports/ui/components/page-checklist-index';
import ChecklistItemPage from '/imports/ui/components/page-checklist-item';
import {
  getAll as getAllChecklists,
  findById as findChecklistById,
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
      component: () => <Redirect to="/checklist/index" />,
    },
  },
  {
    routeProps: {
      exact: true,
      path: '/checklist/index',
      component: ChecklistIndexPage,
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
      path: '/checklist/item/:id',
      component: ChecklistItemPage,
    },
    initializingData: async (dispatch, props) => {
      console.log(`Getting data for route ${objectPath.get(props, 'match.path')}`, objectPath.get(props, 'match.params'));

      const idOfchecklist = objectPath.get(props, 'match.params.id');

      const checklist = idOfchecklist && await findChecklistById.callPromise({
        id: idOfchecklist,
      });

      if (!checklist) {
        console.error(`Checklist 404: ${idOfchecklist}`);
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
  const routePath = location.pathname;
  const matchedRoute = routeConfigs.find((config) => matchPath(routePath, config.routeProps));

  if (!matchedRoute || !matchedRoute.initializingData) {
    return;
  }

  const match = matchPath(routePath, matchedRoute.routeProps);

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
