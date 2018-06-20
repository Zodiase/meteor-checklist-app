import React from 'react';
import { Helmet } from 'react-helmet';
import { Meteor } from 'meteor/meteor';
import CssBaseline from '@material-ui/core/CssBaseline';

import {
  appName,
} from '/imports/ui/consts';

export default
class DocumentHead extends React.PureComponent {
  render () {
    return (
      <React.Fragment>
        <CssBaseline />
        <Helmet titleTemplate={`%s - ${appName}`}>
          <meta charset="utf-8" />
          <meta http-equiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
        </Helmet>
      </React.Fragment>
    );
  }
}
