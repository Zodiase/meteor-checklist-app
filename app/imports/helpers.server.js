import {
  Meteor,
} from 'meteor/meteor';

import {
  publicationMark,
} from './consts.server';

export
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

    context.log('subscribed');

    return pubFunc(context, ...subArgs);
  };

  // Assign a name to the function to aid debugging.
  realPublicationFunction.name = `publication:${pubName}`;

  Meteor.publish(pubName, realPublicationFunction);

  console.log(publicationMark, pubName, 'created');
};
