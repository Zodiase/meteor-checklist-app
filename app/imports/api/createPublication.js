/* eslint no-console: off */

import {
  Meteor,
} from 'meteor/meteor';

import {
  publicationMark,
} from '/imports/consts.server';
import {
  registerLegends,
} from '/imports/logIconLegends';

registerLegends({
  'publication mark': publicationMark,
});

const createPublication = (pubName, pubFunc) => {
  /**
   * This helper function does a few things:
   * - Move the publication context object from `this` to the first argument,
   *   so the `pubFunc` could be an arrow function.
   * - Add some helper functions to the context object.
   */
  const realPublicationFunction = function (...subArgs) {
    const context = this;

    context.log = (...logArgs) => {
      console.log(publicationMark, pubName, ...logArgs);
    };

    // Wrap each function to add logs.
    [
      'added',
      'changed',
      'removed',
      'ready',
    ].forEach((key) => {
      context[key] = ((reactFunc) => (...changeArgs) => {
        context.log(key, JSON.stringify(changeArgs, null, 2));

        return reactFunc(...changeArgs);
      })(context[key].bind(context));
    });

    context.onStop(() => {
      context.log('stopped');
    });

    console.group(publicationMark, pubName, 'subscribed', JSON.stringify({
      userId: context.userId,
      subArgs,
    }, null, 2));

    // `pubFunc` would call `context.log`.
    const pubResult = pubFunc(context, ...subArgs);

    console.groupEnd();

    return pubResult;
  };

  // Assign a name to the function to aid debugging.
  realPublicationFunction.name = `publication:${pubName}`;

  Meteor.publish(pubName, realPublicationFunction);

  console.log(publicationMark, pubName, 'created');
};

export default createPublication;
