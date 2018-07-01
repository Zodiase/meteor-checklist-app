import React from 'react';
import objectPath from 'object-path';
import {
  Switch,
  Route,
  Link,
  Redirect,
  matchPath,
} from 'react-router-dom';
import Head from '/imports/ui/components/head';
import ChecklistIndexPage from '/imports/ui/components/page-checklist-index';
import ChecklistItemPage from '/imports/ui/components/page-checklist-item';
import {
  getAllForIndex as getAllChecklists,
  findById as findChecklistById,
} from '/imports/api/checklists/methods';
import {
  getAction,
} from '/imports/ui/redux-store';

const switchRouteConfigs = [
  {
    name: 'home-page',
    routeProps: {
      exact: true,
      path: '/',
      component: () => <Redirect to="/checklist/index" />,
    },
  },
  {
    name: 'checklist-index-page',
    routeProps: {
      exact: true,
      path: '/checklist/index',
      component: ChecklistIndexPage,
    },
    initializingData: async (dispatch/* , props */) => {
      const checklists = await getAllChecklists.callPromise();

      dispatch({
        type: getAction('data.checklists.update').type,
        list: checklists,
      });
    },
  },
  {
    name: 'checklist-item-page',
    routeProps: {
      exact: true,
      path: '/checklist/item/:id',
      component: ChecklistItemPage,
    },
    initializingData: async (dispatch, props) => {
      console.log(`Getting data for route ${objectPath.get(props, 'match.path')}`, objectPath.get(props, 'match.params'));

      const idOfChecklist = objectPath.get(props, 'match.params.id');

      const checklist = idOfChecklist && await findChecklistById.callPromise({
        id: idOfChecklist,
      });

      if (!checklist) {
        console.error(`Checklist 404: ${idOfChecklist}`);
        // 404.
        dispatch({
          type: getAction('data.checklists.document.loadFromSsr').type,
          idOfChecklist,
          document: null,
        });
        return;
      }

      dispatch({
        type: getAction('data.checklists.document.loadFromSsr').type,
        idOfChecklist,
        document: checklist,
      });
    },
  },
];

export
const initializingReduxStoreForRouteSsr = async (store, location) => {
  const routePath = location.pathname;
  const matchedRoute = switchRouteConfigs.find((config) => matchPath(routePath, config.routeProps));

  if (!matchedRoute || !matchedRoute.initializingData) {
    return;
  }

  const match = matchPath(routePath, matchedRoute.routeProps);

  await matchedRoute.initializingData(store.dispatch, {
    match,
  });
};

export default (
  <React.Fragment>
    <Head />
    <Switch>
      {switchRouteConfigs.map(({
        name,
        routeProps,
      }) => {
        return (
          <Route key={name} {...routeProps} />
        );
      })}
    </Switch>
  </React.Fragment>
);
