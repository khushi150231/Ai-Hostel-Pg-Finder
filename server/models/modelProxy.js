export const createModelProxy = (getModelInstance) => {
  return new Proxy(function () {}, {
    get(target, prop) {
      const model = getModelInstance();
      if (!model) {
        throw new Error('Mongoose Model accessed before database connection was established');
      }
      const val = model[prop];
      return typeof val === 'function' ? val.bind(model) : val;
    },
    construct(target, args) {
      const model = getModelInstance();
      if (!model) {
        throw new Error('Mongoose Model instantiated before database connection was established');
      }
      return new model(...args);
    },
    apply(target, thisArg, args) {
      const model = getModelInstance();
      if (!model) {
        throw new Error('Mongoose Model invoked before database connection was established');
      }
      return model.apply(thisArg, args);
    },
  });
};
