import { Mongo } from 'meteor/mongo';

const baseName = 'checklists';
const collection = new Mongo.Collection(baseName);

export default collection;

export
const countCollection = new Mongo.Collection(`${baseName}.count`);

export
const selectors = {};
