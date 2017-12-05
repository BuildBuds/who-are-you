const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const bluebird   = require('bluebird');
const path       = require('path');
const expresshandlebars = require('express-handlebars');

const config = require('./config');
const routes = require('./routes');

const app = express();

mongoose.Promise = bluebird;
mongoose.connect(config.mongo.url);

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

// Specify where our static assets are located
app.use(express.static(path.join(__dirname, '../client/public')));

// Specify the paths to our layout and partilas files.
app.engine('.hbs', expresshandlebars({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, '../client/src/views/layouts'),
  partialsDir: path.join(__dirname, '../client/src/views/partials'),
}));

// Let express know our view engine is handlebars/
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../client/src/views'));

app.use('/', routes);

app.listen(config.server.port, () => {
  console.log(`The server has started and is listening on ${config.server.port}`); //eslint-disable-line
});

module.exports = app;
