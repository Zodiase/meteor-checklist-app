import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';

export default
({
  name,
  schema,
  method,
}) => {
  const simpleSchema = schema && (schema instanceof SimpleSchema ? schema : new SimpleSchema(schema));
  /**
   * `clean: true` is important to make sure the object is cleaned before validation.
   */
  const validator = simpleSchema ? simpleSchema.validator({ clean: true }) : null;

  return new ValidatedMethod({
    name,
    mixins: [
      CallPromiseMixin,
    ],
    validate: validator,
    run: method,
  });
};
