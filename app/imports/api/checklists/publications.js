import {
  createPublication,
} from '/imports/helpers.server';
import Checklists from './collections';
import {
  transformForIndex,
} from './schema';

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
    added (document) {
      pub.added(Checklists._name, document._id, transformForIndex(document));
    },
    changed (newDocument, oldDocument) {
      pub.changed(Checklists._name, oldDocument._id, transformForIndex(newDocument));
    },
    removed (oldDocument) {
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
