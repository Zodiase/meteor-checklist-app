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
import ChecklistTemplateIndexPage from '/imports/ui/components/page-checklistTemplateIndex';
import ChecklistTemplateItemPage from '/imports/ui/components/page-checklistTemplateItem';
import {
  getAllForIndex as getAllChecklists,
  findById as findChecklistById,
} from '/imports/api/checklists/methods';
import {
  getAction,
} from '/imports/ui/reduxStore';

const switchRouteConfigs = [
  {
    name: 'homePage',
    routeProps: {
      exact: true,
      path: '/',
      component: () => <Redirect to="/checklist/index" />,
    },
  },
  {
    name: 'checklistTemplateIndexPage',
    routeProps: {
      exact: true,
      path: '/checklist/index',
      component: ChecklistTemplateIndexPage,
    },
    initializingData: async (dispatch/* , props */) => {
      const checklists = await getAllChecklists.callPromise();

      dispatch({
        type: getAction('data.checklistTemplate.index.updateLocalCopy').type,
        list: checklists,
      });
    },
  },
  {
    name: 'checklistTemplateItemPage',
    routeProps: {
      exact: true,
      path: '/checklist/item/:id',
      component: ChecklistTemplateItemPage,
    },
    initializingData: async (dispatch, props) => {
      const idOfChecklist = objectPath.get(props, 'match.params.id');

      let checklist = idOfChecklist && await findChecklistById.callPromise({
        id: idOfChecklist,
      });

      if (!checklist) {
        // 404.
        console.error(`Checklist 404: ${idOfChecklist}`);
        checklist = null;
      }

      dispatch({
        type: getAction('data.checklistTemplate.document.updateLocalCopy--ssr').type,
        idOfChecklist,
        document: checklist,
      });
    },
  },
  {
    name: '404Page',
    routeProps: {
      component: () => <Link to="/">404</Link>,
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

  console.group(`Getting data for route '${match.path}'`, match.params);

  await matchedRoute.initializingData(store.dispatch, {
    match,
  });

  console.groupEnd();
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
