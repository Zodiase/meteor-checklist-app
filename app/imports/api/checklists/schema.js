import SimpleSchema from 'simpl-schema';

import {
  createAndModifyDates,
} from '../common-schema-fields';

export
const StepSchema = new SimpleSchema({
  id: {
    type: String,
    min: 16,
    max: 128,
  },
  description: {
    type: String,
    min: 1,
    trim: false,
  },
});

export
// Schema of data actually stored in server database.
const StoredSchema = new SimpleSchema({
  ...createAndModifyDates,

  name: {
    type: String,
    max: 256,
    trim: true,
    defaultValue: '',
  },
  steps: {
    type: Array,
    defaultValue: [],
  },
  'steps.$': StepSchema,
});

export
// Schema of data fetched from database, which includes auto-generated fields.
const FetchedSchema = new SimpleSchema({
  ...StoredSchema.schema(),

  stepCount: {
    type: Number,
    optional: true,
    autoValue () {
      const {
        isSet,
        value,
        operator,
      } = this.field('steps');

      if (isSet && operator === null) {
        return value.length;
      }

      return -1;
    },
  },
});

export
// Schema of data submitted from client side.
const ClientSideCreationSchema = StoredSchema.pick(
  'name',
  'steps',
);

export
// Schema of the checklist when displayed in an index (no detail).
const IndexSchema = StoredSchema.omit('steps')
  .extend({
    stepCount: {
      type: Number,
      autoValue: null,
    },
  });

export
const transformForIndex = (doc) => {
  const fullDoc = FetchedSchema.clean(doc);
  const cleanedDoc = IndexSchema.clean(fullDoc);

  return cleanedDoc;
};
