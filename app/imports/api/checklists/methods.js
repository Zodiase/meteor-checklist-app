import SimpleSchema from 'simpl-schema';

import {
  createMethod,
} from '/imports/helpers';

import Checklists from './';
import {
  basicInfo as checklistSchema,
} from './schema';

export
const count = createMethod({
  name: 'checklists.methods.count',
  method: () => {
    return Checklists.find().count();
  },
});

export
const getAll = createMethod({
  name: 'checklists.methods.get-all',
  method: () => {
    return Checklists.find({}, {
      sort: { createDate: -1 },
    }).fetch();
  },
});

export
const getOneById = createMethod({
  name: 'checklists.methods.get-one-by-id',
  schema: {
    id: String,
  },
  method: ({ id }) => {
    return Checklists.findOne({
      _id: id,
    });
  },
});

export
const createNew = createMethod({
  name: 'checklists.methods.create-new',
  schema: checklistSchema,
  method: (checklist) => {
    const date = new Date();

    const docId = Checklists.insert({
      ...checklist,
      createDate: date,
      modifyDate: date,
    });

    return {
      _id: docId,
    };
  },
});

export
const update = createMethod({
  name: 'checklists.methods.update',
  schema: {
    id: String,
    changes: checklistSchema,
  },
  method: ({ id, changes }) => {
    console.log('checklists.methods.update', id, changes);

    return Checklists.update({
      _id: id,
    }, {
      $set: {
        ...changes,
      },
    });
  },
});
