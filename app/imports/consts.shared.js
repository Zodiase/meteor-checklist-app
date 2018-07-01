import objectPath from 'object-path';
import {
  Meteor,
} from 'meteor/meteor';

export
// Must not have a leading '/'.
const baseUrl = objectPath.get(Meteor.settings.public, 'baseUrl', '');

export
const pageSsrMark = '📄 ';

export
const publicationMark = '📃 ';

export
const callMark = '🤙 ';

export
const respondMark = '🖖 ';

export
const endCallMark = '🤘 ';
