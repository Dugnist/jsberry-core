module.exports = class MODEL {
  /**
   * @param {string} [name=null]   model name
   * @param {object} [schema=null] [description]
   * @param {[type]} ACTIONS       [description]
   * @return {class} return this for chaining
   */
  constructor(name, { schema = {}, statics = () => {} }) {
    if (this.name) throw new Error(`Model already have name ${this.name}!`);
    if (this.schema) throw new Error(`Model already have schema!`);

    this.setModelName(name);
    this.setSchema(schema);
    this.setStatics(statics);

    MODEL.ACTIONS.on(`postinit.${name}.connect`, () => this.connectModel());
    MODEL.ACTIONS.on(`${name}.model.get`, () => Promise.resolve(this.model));
    MODEL.ACTIONS.on(`${name}.schema.get`, () => Promise.resolve(this.schema));

    return this;
  }

  /**
   * [setModelName description]
   * @param {String} [name=''] [description]
   * @return {[type]} [description]
   */
  setModelName(name = '') {
    if (!this.name) {
      this.name = name;
    } else {
      throw new Error(`Model already have name ${this.name}!`);
    }

    return this;
  }

  /**
   * [setSchema description]
   * @param {Object} [schema={}] [description]
   * @return {[type]} [description]
   */
  setSchema(schema = {}) {
    if (!this.schema) {
      this.schema = schema;
    } else {
      throw new Error(`Schema already set for ${this.name}!`);
    }

    return this;
  }

  /**
   * [setStatics description]
   * @param {Object} [statics=()=>{}] [description]
   * @return {[type]} [description]
   */
  setStatics(statics = () => {}) {
    if (!this.statics) {
      this.statics = statics;
    } else {
      throw new Error(`Statics already set for ${this.name}!`);
    }

    return this;
  }

  /**
   * [connectModel description]
   * @return {Promise} [description]
   */
  async connectModel() {
    try {
      const checkDB = await MODEL.ACTIONS.send('database.check');

      if (!checkDB) throw new Error('Database plugin not connected!');
      if (!this.name) throw new Error('Model don\'t have any name!');
      if (!this.schema) throw new Error('Model don\'t have any schema!');
      if (!this.model) {
        const cleanSchema = this.clearSchema(['validate']); // clear from keys

        this.model = await MODEL.ACTIONS.send('database.model.create', {
          name: this.name, schema: cleanSchema,
          statics: this.statics,
        });
      }

      return this.model;
    } catch (error) {
      console.log('src/core/model.js/line:73', error);
    }
  }

  /**
   * Check for exist model
   */
  checkModelExist() {
    if (!this.model) throw new Error('Model not exist!');
  }

  /**
   * Clear schema from input keys
   * @param  {Array}  [keys=[]] [description]
   * @return {[type]}           [description]
   */
  clearSchema(keys = []) {
    if (!this.schema) throw new Error('Schema not set!');
    const cleanSchema = {};

    for (let key in this.schema) {
      const cleanValue = { ...this.schema[key] };

      keys.forEach((k) => {
        delete cleanValue[k];
      });
      cleanSchema[key] = cleanValue;
    }

    return cleanSchema;
  }

  /**
   * [create description]
   * @param  {Object}  [payload={}] [description]
   * @param  {Object}  [options={}] [description]
   * @return {Promise}              [description]
   */
  async create(payload = {}, options = {}) {
    this.checkModelExist();

    const result = await ACTIONS.on('database.create', ({
      model: this.model, payload, options,
    }));

    return !result ?
      Promise.reject(`Error create instance of ${this.name}`) :
      result;
  }
};
