const Knex = require('knex');
const connection = require('../knexfile');
const Model = require('./CustomModel');

const makeId = require('../../utils/makeId').makeId;

const knexConnection = Knex(connection);

Model.knex(knexConnection);

class Note extends Model{

  static get tableName() {
    return 'public.note'
  }

  $beforeInsert() {
    this.id = '00N' + makeId(9);
  }
}

module.exports = Note;