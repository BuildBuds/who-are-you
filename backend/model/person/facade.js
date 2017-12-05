const Facade = require('../../lib/facade');
const personSchema = require('./schema');

class PersonFacade extends Facade {}

module.exports = new PersonFacade('Person', personSchema);
