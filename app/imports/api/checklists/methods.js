import uuid from 'uuid/v4';

import createMethod from '../create-method';

import Checklists from './';
import {
  ClientSideCreationStepSchema,
  ClientSideCreationSchema,
  transformForIndex,
} from './schema';
import {
  sortByCreateDate,
} from './consts';

export
const count = createMethod({
  name: 'checklists.methods.count',
  method () {
    return Checklists.find().count();
  },
});

export
const getAll = createMethod({
  name: 'checklists.methods.getAll',
  method () {
    return Checklists.find(
      {},
      {
        sort: [
          sortByCreateDate,
        ],
      },
    ).fetch();
  },
});

export
const getAllForIndex = createMethod({
  name: 'checklists.methods.getAllForIndex',
  method () {
    const docs = Checklists.find(
      {},
      {
        sort: [
          sortByCreateDate,
        ],
        transform: transformForIndex,
      },
    ).fetch();

    return docs;
  },
});

export
const findById = createMethod({
  name: 'checklists.methods.findById',
  schema: {
    id: String,
  },
  method ({
    id,
  }) {
    const doc = Checklists.findOne({
      _id: id,
    });

    return doc;
  },
});

export
const createNew = createMethod({
  name: 'checklists.methods.createNew',
  schema: ClientSideCreationSchema,
  method (checklist) {
    const date = new Date();
    const fullDocumentToInsert = {
      ...checklist,

      createDate: date,
      modifyDate: date,
    };

    const idOfInsertedDocument = Checklists.insert(fullDocumentToInsert);

    return {
      _id: idOfInsertedDocument,
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
  method ({
    id,
    changes,
  }) {
    const updateCount = Checklists.update(
      {
        _id: id,
      },
      {
        $set: {
          ...changes,
        },
      },
    );

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
  method ({
    ids,
  }) {
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
const updateName = createMethod({
  name: 'checklists.methods.updateName',
  schema: {
    idOfChecklist: String,
    newName: String,
  },
  method ({
    idOfChecklist,
    newName,
  }) {
    const updateCount = Checklists.update(
      {
        _id: idOfChecklist,
      },
      {
        $set: {
          name: newName,
        },
      },
    );

    return {
      success: updateCount > 0,
      newName,
    };
  },
});

export
const addStep = createMethod({
  name: 'checklists.methods.addStep',
  schema: {
    idOfChecklist: String,
    step: ClientSideCreationStepSchema,
  },
  method ({
    idOfChecklist,
    step,
  }) {
    const updateCount = Checklists.update(
      {
        _id: idOfChecklist,
      },
      {
        $push: {
          steps: {
            ...step,
            id: uuid(),
          },
        },
      },
    );

    return {
      success: updateCount > 0,
      step,
    };
  },
});

export
const updateStepDescription = createMethod({
  name: 'checklists.methods.updateStepDescription',
  schema: {
    idOfChecklist: String,
    stepId: String,
    newDescription: String,
  },
  method ({
    idOfChecklist,
    stepId,
    newDescription,
  }) {
    const updateCount = Checklists.update(
      {
        _id: idOfChecklist,
        'steps.id': stepId,
      },
      {
        $set: {
          'steps.$.description': newDescription,
        },
      },
    );

    return {
      success: updateCount > 0,
      newDescription,
    };
  },
});

export
const removeStep = createMethod({
  name: 'checklists.methods.removeStep',
  schema: {
    idOfChecklist: String,
    stepId: String,
  },
  method ({
    idOfChecklist,
    stepId,
  }) {
    const updateCount = Checklists.update(
      {
        _id: idOfChecklist,
      },
      {
        $pull: {
          steps: {
            id: stepId,
          },
        },
      },
    );

    return {
      success: updateCount > 0,
    };
  },
});
