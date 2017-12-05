import autoprefixer from 'gulp-autoprefixer';
import browserify from 'browserify';
import browserSyncInit from 'browser-sync';
import buffer from 'vinyl-buffer';
import eyeglass from 'eyeglass';
import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import sass from 'gulp-sass';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import nodemon from 'gulp-nodemon';

// Interface for executing shell commands
const exec = require('child_process').exec;

// Helper for interfacing with executing shell commands (e.g. mongo)
const runCommand = function(command) {
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }
};

const browserSync = browserSyncInit.create();
// Temporary url until we determine where to host the project.
const tempUrl = 'http://localhost:8080';
// Directory and file locations.
const directories = {
    // Locations to output compiled files.
    compiled: {
        images: 'client/public/images',
        javascript: 'client/public/javascript',
        sass: 'client/public/css',
    },
    images: 'client/src/images/**/*.*',
    // All client side javascript files.
    javascript: 'client/src/javascript/**/*.js',
    // Entry location of JavaScript files.
    javascriptEntry: 'client/src/javascript/app.js',
    // Location of SASS files.
    sass: 'client/src/sass/**/*.scss',
    // Server file locations
    server: {
        main: 'backend/index.js',
        watch: [
            'backend/index.js',
            'client/src/views',
        ],
        extension: 'js hbs',
    },
};

/**
 *  Logs bundle errors and emits end, so watch doesn't stop on errors.
 *  @param {object} An error object to log.
 */
function handleBundleError(error) {
    console.error(error); // eslint-disable-line
    this.emit('end');
}

/**
 *  Bundles Javascript files together from a single entry point(s). Creates sourcemaps and uglifys JavaScript files.
 */
gulp.task('javascript', () => {
    // Initialize the browserify bundler with options and apply babel.
    const bundler = browserify({
        entries: directories.javascriptEntry,
        debug: true,
    }).transform('babelify', { presets: ['env'] });

    return bundler.bundle()
        // Handle any errors by logging them
        .on('error', handleBundleError)
        // Creates a through stream which takes text as input, and emits a single vinyl file instance for streams
        // down the pipeline to consume. Rename file to app.js.
        .pipe(source('app.js'))
        // Create a transform stream that takes vinyl files as input, and outputs modified vinyl files as output.
        .pipe(buffer())
        // Use sourcemaps to indicate the accurate locations of code within the debugger.
        .pipe(sourcemaps.init({ loadMaps: true }))
        // Uglify the code to minimize JavaScript.
        .pipe(uglify())
        // Write a sourcemap to the same directory as the compiled javascript files.
        .pipe(sourcemaps.write('./'))
        // Pipe the JS files to their final destination.
        .pipe(gulp.dest(directories.compiled.javascript))
        // Allow for live reloading of JS files.
        .pipe(browserSync.stream());
});

/**
 *  Compiles SASS/SCSS files, creates sourcemaps for SASS/SCSS files, and prefixes css properties with appropriate
 *  vendror prefixes for the last 2 browser versions.
 */
gulp.task('sass', () => gulp.src(directories.sass)
    // Initialize sourcemaps.
    .pipe(sourcemaps.init())
    // Compress SASS/SCSS files.
    .pipe(sass(eyeglass({ outputStyle: 'compressed' })).on('error', sass.logError))
    // Add vendor prefixes.
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false,
    }))
    // Write sourcemaps.
    .pipe(sourcemaps.write('./'))
    // Add to the compiled directory.
    .pipe(gulp.dest(directories.compiled.sass))
    // Allow for live reloading of css files.
    .pipe(browserSync.stream()));

/**
 *  Minifys image files.
 */
gulp.task('images', () => gulp.src(directories.images)
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [
            { removeViewBox: false },
        ],
    }))
    .pipe(gulp.dest(directories.compiled.images))
    // Allow for live reloading of image files.
    .pipe(browserSync.stream()));

/**
 *  Uses nodemon to watch for any changes to server side files. Restarts server and reloads if changes occur.
 */
gulp.task('nodemon', (callback) => {
  // Set file to run on restart, files to watch, node environment, and extensions to watch.
  nodemon({
    script: directories.server.main,
    watch: directories.server.watch,
    env: {
      NODE_ENV: 'development',
    },
    ext: directories.server.extension,
  })
  // On start run the callback function.
  .once('start', () => {
    callback();
  })
  // On restart reload browser.
  .on('restart', () => {
    setTimeout(() => {
      browserSync.reload();
    }, 500);
  });
});

gulp.task('start-mongo', runCommand('mongod --logappend --logpath ./logs/mongo-logs'));
gulp.task('stop-mongo', runCommand('mongo --eval "use admin; db.shutdownServer();"'));

/**
 * Initialize browser-sync for live reloading and watches files to rerun tasks in the event they change.
 */
gulp.task('browser-sync', ['nodemon'], () => {
  browserSync.init({
    proxy: tempUrl
  });

  // Watch for changes in any of the client side directories.
  gulp.watch(directories.sass, ['sass']);
  gulp.watch(directories.javascript, ['javascript']);
  gulp.watch(directories.images, ['sass']);
});
//
// gulp.task('log:watch', (cb) => {
//   gulp.watch('./dbConnection.log', () => {
//     let called = false;
//     if (!called) {
//       cb();
//       called = true;
//       gulp.start('browser-sync');
//     }
//   });
// });

gulp.task('build', ['javascript', 'sass', 'images']);

gulp.task('default', ['browser-sync', 'build']);
