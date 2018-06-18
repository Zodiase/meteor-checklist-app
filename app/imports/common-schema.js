import SimpleSchema from 'simpl-schema';

export
const createAndModifyDate = new SimpleSchema({
  createDate: {
    type: Date,
  },
  modifyDate: {
    type: Date,
  },
});
