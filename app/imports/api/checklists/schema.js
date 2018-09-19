import SimpleSchema from 'simpl-schema';

import { createAndModifyDates } from '../commonSchemaFields';

export const ClientSideCreationStepSchema = new SimpleSchema({
  description: {
    type: String,
    min: 1,
    trim: false,
  },
});

export const StoredStepSchema = new SimpleSchema({
  ...ClientSideCreationStepSchema.schema(),
  id: {
    type: String,
    min: 16,
    max: 128,
  },
});

// Schema of data actually stored in server database.
export const StoredSchema = new SimpleSchema(
  {
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
    'steps.$': StoredStepSchema,
  },
  {
    clean: {
      removeEmptyStrings: false,
    },
  },
);

// Schema of data fetched from database, which includes auto-generated fields.
export const FetchedSchema = new SimpleSchema({
  ...StoredSchema.schema(),

  stepCount: {
    type: Number,
    optional: true,
    autoValue() {
      const { isSet, value, operator } = this.field('steps');

      if (isSet && operator === null) {
        return value.length;
      }

      return -1;
    },
  },
});

// Schema of data submitted from client side.
export const ClientSideCreationSchema = StoredSchema.pick('name', 'steps');

// Schema of the checklist when displayed in an index (no detail).
export const IndexSchema = StoredSchema.omit('steps').extend({
  stepCount: {
    type: Number,
    autoValue: null,
  },
});

export const transformToFull = (doc) => {
  const fullDoc = FetchedSchema.clean(doc);

  return fullDoc;
};

export const transformForIndex = (doc) => {
  const fullDoc = transformToFull(doc);
  const cleanedDoc = IndexSchema.clean(fullDoc);

  return cleanedDoc;
};
