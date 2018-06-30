import Raven from 'raven';

import {
  sentryDsn,
} from '/imports/consts.server';

if (sentryDsn) {
  Raven.config(sentryDsn, {
    logger: 'server',
  }).install();
}

export default Raven;
