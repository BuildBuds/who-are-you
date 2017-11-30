const Controller = require('../../lib/controller');
const personFacade = require('./facade');

class PersonController extends Controller {}

module.exports = new PersonController(personFacade);
