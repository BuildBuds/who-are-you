const Router = require('express').Router;
const router = new Router();

const person = require('./model/person/router');

router.route('/').get((req, res) => {
  res.render('home');
});

router.use('/person', person);

module.exports = router;
