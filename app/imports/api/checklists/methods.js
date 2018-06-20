import SimpleSchema from 'simpl-schema';

import createMethod from '../create-method';

import Checklists from './';
import {
  StepSchema,
  ClientSideCreationSchema,
  transformForIndex,
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
  name: 'checklists.methods.getAll',
  method: () => {
    return Checklists.find({}, {
      sort: { createDate: -1 },
    }).fetch();
  },
});

export
const getAllForIndex = createMethod({
  name: 'checklists.methods.getAllForIndex',
  method: () => {
    return Checklists.find({}, {
      sort: {
        createDate: -1,
      },
      transform: transformForIndex,
    }).fetch();
  },
});

export
const findById = createMethod({
  name: 'checklists.methods.findById',
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
  name: 'checklists.methods.createNew',
  schema: ClientSideCreationSchema,
  method (checklist) {
    console.log('checklists.methods.createNew', checklist);

    const date = new Date();
    const fullDocument = {
      ...checklist,

      createDate: date,
      modifyDate: date,
    };

    const docId = Checklists.insert(fullDocument);

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
    changes: ClientSideCreationSchema,
  },
  method: ({ id, changes }) => {
    console.log('checklists.methods.update', id, changes);

    const updateCount = Checklists.update({
      _id: id,
    }, {
      $set: {
        ...changes,
      },
    });

    return {
      success: updateCount > 0,
    };
  },
});

export
const remove = createMethod({
  name: 'checklists.methods.remove',
  schema: {
    ids: [String],
  },
  method: ({ ids }) => {
    console.log('checklists.methods.remove', ids);

    const deleteCount = Checklists.remove({
      _id: {
        $in: ids,
      },
    });

    return {
      success: deleteCount > 0,
    };
  },
});

export
const addStep = createMethod({
  name: 'checklists.methods.addStep',
  schema: {
    idOfchecklist: String,
    step: StepSchema,
  },
  method: ({
    idOfchecklist,
    step,
  }) => {
    console.log('checklists.methods.addStep', idOfchecklist, step);

    const updateCount = Checklists.update({
      _id: idOfchecklist,
    }, {
      $push: {
        steps: step,
      },
    });

    return {
      success: updateCount > 0,
      step,
    };
  },
});

// Checklists.update({
//   _id: 'WTut4wETne2cCvqGd',
// }, {
//   $set: {
//     steps: [],
//   }
// });

// Checklists.update({}, {
//   $pull: {
//     id: {
//       $exists: false,
//     }
//   },
// }, {
//   multi: true,
// });
