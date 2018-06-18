import SimpleSchema from 'simpl-schema';

import {
  createAndModifyDate,
} from '/imports/common-schema';

export
const basicInfo = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
});

const schema = new SimpleSchema({});

schema.extend(basicInfo);
schema.extend(createAndModifyDate);

export default schema;
