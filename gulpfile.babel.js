import autoprefixer from 'gulp-autoprefixer';
import browserify from 'browserify';
import browserSyncInit from 'browser-sync';
import buffer from 'vinyl-buffer';
import concat from 'gulp-concat';
import declare from 'gulp-declare';
import gulp from 'gulp';
import handlebars from 'gulp-handlebars';
import imagemin from 'gulp-imagemin';
import sass from 'gulp-sass';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import wrap from 'gulp-wrap';
import nodemon from 'gulp-nodemon';

const browserSync = browserSyncInit.create();
// Temporary url until we determine where to host the project.
const tempUrl = 'https://localhost:3000';
// Directory and file locations.
const directories = {
    // Location to output compiled files.
    compiled: {
        javascript: 'compiled/javascript',
        templates: 'compiled/templates',
        sass: 'compiled/css',
    },
    images: 'client/src/images/**/*.*',
    // All client side javascript files.
    javascript: 'client/src/javascript/**/*.js',
    // Entry location of JavaScript files.
    javascriptEntry: 'client/src/javascirpt/app.js',
    // Publicly exposed assets.
    public: 'client/public',
    // Location of SASS files.
    sass: 'client/src/sass/**/*.scss',
    // Server file locations
    server: {
        main: 'server/src/server.js',
        watch: [
            'server/src/server.js',
            'client/src/templates',
        ],
        extension: 'js html hbs',
    },
    // Location of templates.
    templates: 'client/src/templates/**/*.hbs',
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
 *  Compiles handlebars templates and places them in the compiled templates directory.
 */
gulp.task('templates', () =>
    // Load templates from the templates folder relative to where gulp was executed.
    gulp.src(directories.templates)
        // Compile each Handlebars template source file to a template function.
        .pipe(handlebars())
        // Wrap each template function in a call to Handlebars.template.
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        // Declare template functions as properties and sub-properties of exports
        .pipe(declare({
            root: 'exports',
            noRedeclare: true, // Avoid duplicate declarations.
            // Allow nesting based on path using gulp-declare's processNameByPath().
            // You can remove this option completely if you aren't using nested folders.
            // Drop the templates/ folder from the namespace path by removing it from the filePath.
            processName: filePath => declare.processNamesByPath(filePath.replace('templates/', '')),
        }))
        // Concatenate down to a single file
        .pipe(concat('index.js'))
        // Add the Handlebars module in the final output.
        .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
        // Write the output into the compiled templates folder
        .pipe(gulp.dest(directories.compiled.templates))
        // Allow for live reloading of template files.
        .pipe(browserSync.stream()));

/**
 *  Compiles SASS/SCSS files, creates sourcemaps for SASS/SCSS files, and prefixes css properties with appropriate
 *  vendror prefixes for the last 2 browser versions.
 */
gulp.task('sass', () => gulp.src(directories.sass)
    // Initialize sourcemaps.
    .pipe(sourcemaps.init())
    // Compress SASS/SCSS files.
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    // Add vendor prefixes.
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false,
    }))
    // Write sourcemaps.
    .pipe(sourcemaps.write('./'))
    // Add to the compiled directory.
    .pipe(gulp.dest(directories.compiled.sass)))
    // Allow for live reloading of css files.
    .pipe(browserSync.stream());

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
    .pipe(gulp.dest(`${directories.public}/images`))
    // Allow for live reloading of image files.
    .pipe(browserSync.stream()));

/**
 *  Uses nodemon to watch for any changes to server side files. Restarts server and reloads browserSync if changes
 *  occur.
 */
gulp.task('nodemon', (callback) => {
    nodemon({
        script: directories.server.main,
        watch: directories.server.watch,
        env: {
            NODE_ENV: 'development',
        },
        ext: directories.server.extension,
    })
        .once('start', () => {
            callback();
        })
        .on('restart', () => {
            setTimeout(() => {
                browserSync.reload();
            }, 500);
        });
});

/**
 * Initialize browser-sync for live reloading and watches files to rerun tasks in the event they change.
 */
gulp.task('browser-sync', ['nodemon'], () => {
    browserSync.init({
        proxy: tempUrl,
    });

    // Watch for changes in any of the client side directories.
    gulp.watch(directories.sass, ['sass']);
    gulp.watch(directories.templates, ['templates']);
    gulp.watch(directories.javascript, ['javascript']);
    gulp.watch(directories.images, ['sass']);
});

gulp.task('build', ['javascript', 'templates', 'sass', 'images']);

gulp.task('default', ['browser-sync', 'build']);
