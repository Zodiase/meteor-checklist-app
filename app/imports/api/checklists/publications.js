import {
  createPublication,
} from '/imports/helpers.server';
import Checklists, {
  countCollection as ChecklistCount,
  selectors,
} from './collections';
import {
  transformForIndex,
} from './schema';

// Publish the current size of the collection.
createPublication('checklists.count', (pub) => {
  const collectionName = ChecklistCount._name;
  const docId = 'count';
  let count = 0;
  let initializing = true;

  // `observeChanges` only returns after the initial `added` callbacks have run.
  // Until then, we don't want to send a lot of `changed` messages—hence
  // tracking the `initializing` state.
  const handle = Checklists.find(selectors.initialized).observeChanges({
    added() {
      count += 1;

      if (initializing) {
        return;
      }

      pub.log(collectionName, 'added', count);

      pub.changed(collectionName, docId, {
        value: count,
      });
    },
    removed() {
      count -= 1;

      pub.log(collectionName, 'removed', count);

      pub.changed(collectionName, docId, {
        value: count,
      });
    },
  });

  initializing = false;
  pub.added(collectionName, docId, {
    value: count,
  });
  pub.ready();
  pub.onStop(() => handle.stop());
});

createPublication('checklists.all', (/* pub */) => {
  return Checklists.find({}, {
    sort: {
      createDate: -1,
    },
  });
});

createPublication('checklists.index', (pub) => {
  const selector = {};
  const sort = {
    createDate: -1,
  };
  const fields = {};
  const cursor = Checklists.find(selector, {
    sort,
    fields,
  });
  const observer = cursor.observe({
    added(document) {
      pub.added(Checklists._name, document._id, transformForIndex(document));
    },
    changed(newDocument, oldDocument) {
      pub.changed(Checklists._name, oldDocument._id, transformForIndex(newDocument));
    },
    removed(oldDocument) {
      pub.removed(Checklists._name, oldDocument._id);
    },
  });

  pub.onStop(function () {
    observer.stop();
  });

  pub.ready();
});

createPublication('checklist.full', (pub, {
  idOfChecklist,
}) => {
  return Checklists.find({
    _id: idOfChecklist,
  }, {
    sort: {
      createDate: -1,
    },
  });
});
