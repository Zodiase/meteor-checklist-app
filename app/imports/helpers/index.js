import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';

export
const createMethod = ({
  name,
  schema,
  method,
}) => {
  const simpleSchema = schema && (schema instanceof SimpleSchema ? schema : new SimpleSchema(schema));

  return new ValidatedMethod({
    name,
    mixins: [
      CallPromiseMixin,
    ],
    validate: simpleSchema ? simpleSchema.validator() : null,
    run: method,
  });
};
