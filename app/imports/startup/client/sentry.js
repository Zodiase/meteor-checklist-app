import Raven from 'raven-js';

import { sentryDsn } from '/imports/consts.client';

if (sentryDsn) {
  Raven.config(sentryDsn, {
    logger: 'client',
  }).install();
}

export default Raven;
