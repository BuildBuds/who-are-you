const Router = require('express').Router;
const router = new Router();

const person = require('./model/person/router');

router.route('/').get((req, res) => {
  // res.json({ message: 'Welcome to api-test API!' });
  res.render('home');
});

router.use('/person', person);

module.exports = router;
