# who-are-you
A quiz that allows people to test how well their perception of people's online identities coincides with reality.

## Requirements

Before cloning the application, install the Gulp CLI globally by running `npm install gulp-cli -g`. If you're using nvm you can run `nvm use` to run the version of Node this project currently supports. Otherwise refer to the `package.json` file in the root and install and switch to the correct version of Node.

## Install Instructions

To install, clone the repository by selecting the clone or download button from the [Github Repository](https://github.com/BuildBuds/who-are-you). Once the repository has been cloned, change directories to the repositories root and run `npm install`. Once the application is installed run `npm run start` or `gulp` to start the application. The application should be up and running and will be proxied to `http://localhost:3000` by browser-sync.

## Directory Structure

The directory is split into two main folders for `client` and `server` side files. Build, task management, configuration, and environment variable files are located in the root of the directory. Almost all of the build tasks exist within `gulpfile.babel.js`.

### Client

The `client` directory contains two folders `src` and `public`. `public` contains any files that need to be exposed to the end user. Javascript, css, and image files that get compiled or minified within `gulpfile.babel.js` end up here within their own directories. `src` contains the original uncompiled JavaScript, SCSS, and image files. It also contains handlebars layouts, partials, and templates. The main entry point for Javascript files can be found in `client/src/javascript/app.js`.


### Server

The `server` directory contains a `src` folder for that should house any Node.js or MongoDB files. The entry point for the server directory is location at `server/src/server.js`.

## Libraries and Tech

The application runs using Node.js on the back-end and uses Express for routing. MongoDB will soon be integrated into the application for storing user and general application data. Gulp is used as the application's task runner. Browserify and Babelify are used for bundling client side JavaScript and using ES6 syntax on the application's front-end. The application uses Handlebars for templating and SCSS to allow for variables, nesting CSS selectors, mixins, conditionals, and a variety of other helpful features. Browser-sync is used for live reloading when changes occur within SCSS, Handlebars, or client side Javascript files and Nodemon is used to restart the server when changes occur within server side files. 
