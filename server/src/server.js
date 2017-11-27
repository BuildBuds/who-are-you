const express = require('express');
const path = require('path');
const expresshandlebars = require('express-handlebars');

const app = express();
const port = 8080;

// Specify where our static assets are located
app.use(express.static(path.join(__dirname, '../../client/public')));

// Specify the paths to our layout and partilas files.
app.engine('.hbs', expresshandlebars({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, '../../client/src/views/layouts'),
    partialsDir: path.join(__dirname, '../../client/src/views/partials'),
}));

// Let express know our view engine is handlebars/
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../../client/src/views'));

// Render the main template for the index route.
app.get('/', (req, res) => {
    res.render('home');
});

app.listen(port, () => {
    console.log(`The server has started and is listening on ${port}`); //eslint-disable-line
});
