import objectPath from 'object-path';
import { Meteor } from 'meteor/meteor';

export * from './consts.shared';

export const sentryDsn = objectPath.get(Meteor.settings, 'sentry.dsn');
