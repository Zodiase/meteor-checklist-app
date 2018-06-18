import { Meteor } from 'meteor/meteor';

import Checklists, {
  countCollection as ChecklistCount,
  selectors,
} from './collections';

// Publish the current size of the collection.
Meteor.publish('checklists.count', function () {
  console.log('Publication `checklists.count` subscribed.');

  const collectionName = ChecklistCount._name;
  const docId = 'count';
  let count = 0;
  let initializing = true;

  // `observeChanges` only returns after the initial `added` callbacks have run.
  // Until then, we don't want to send a lot of `changed` messages—hence
  // tracking the `initializing` state.
  const handle = Checklists.find(selectors.initialized).observeChanges({
    added: () => {
      count += 1;

      if (initializing) {
        return;
      }

      console.log(collectionName, 'added', count);

      this.changed(collectionName, docId, { value: count });
    },
    removed: () => {
      count -= 1;

      console.log(collectionName, 'removed', count);

      this.changed(collectionName, docId, { value: count });
    },
  });

  initializing = false;
  this.added(collectionName, docId, { value: count });
  this.ready();
  this.onStop(() => handle.stop());
});

Meteor.publish('checklists.all', () => {
  console.log('Publication `checklists.all` subscribed.');

  return Checklists.find({}, {
    sort: { createDate: -1 },
  });
});

Meteor.publish('checklist.full', ({
  idOfchecklist,
}) => {
  console.log('Publication `checklist.full` subscribed.');

  return Checklists.find({
    _id: idOfchecklist,
  }, {
    sort: { createDate: -1 },
  });
});
