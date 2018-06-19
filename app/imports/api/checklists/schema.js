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
// Schema of data submitted from client side.
const ClientSideCreationSchema = StoredSchema.pick(
  'name',
  'steps',
);

export
// Schema of the checklist when displayed in an index (no detail).
const IndexSchema = new SimpleSchema({
  stepCount: {
    type: Number,
    optional: true,
    autoValue: (doc) => doc.steps.length,
  },
});
IndexSchema.extend(StoredSchema.omit('steps'));
