/* eslint no-console: off */

import SimpleSchema from 'simpl-schema';
import {
  ValidatedMethod,
} from 'meteor/mdg:validated-method';
import {
  CallPromiseMixin,
} from 'meteor/didericis:callpromise-mixin';

import {
  callMark,
  respondMark,
  endCallMark,
} from '/imports/consts.shared';
import {
  registerLegends,
} from '/imports/log-icon-legend';

registerLegends({
  'method call mark': callMark,
  'method response mark': respondMark,
  'method end mark': endCallMark,
});

const createMethod = ({
  name,
  schema,
  method,
}) => {
  const simpleSchema = schema
  && (schema instanceof SimpleSchema
    ? schema
    : new SimpleSchema(schema)
  );
  /**
   * `clean: true` is important to make sure the object is cleaned before validation.
   */
  const validator = simpleSchema ? simpleSchema.validator({
    clean: true,
  }) : null;

  const run = async (...callArgs) => {
    console.group(callMark, name, callArgs);

    const result = await method(...callArgs);

    console.log(respondMark, result);

    console.groupEnd();
    // Mark the end of the call.
    console.log(endCallMark, name);

    return result;
  };

  return new ValidatedMethod({
    name,
    mixins: [
      CallPromiseMixin,
    ],
    validate: validator,
    run,
  });
};

export default createMethod;
