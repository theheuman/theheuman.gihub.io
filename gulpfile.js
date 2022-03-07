'use strict'

// Load plugins
const autoprefixer = require('gulp-autoprefixer')
const browsersync = require('browser-sync').create()
const cleanCSS = require('gulp-clean-css')
const del = require('del')
const gulp = require('gulp')
const merge = require('merge-stream')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const uglify = require('gulp-uglify')

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './',
    },
    port: 3000,
  })
  done()
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload()
  done()
}

// Clean vendor
function clean() {
  return del(['./vendor/'])
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap
  const bootstrap = gulp
    .src('./node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest('./vendor/bootstrap'))
  // Font Awesome CSS
  const fontAwesomeCSS = gulp
    .src('./node_modules/@fortawesome/fontawesome-free/css/**/*')
    .pipe(gulp.dest('./vendor/fontawesome-free/css'))
  // Font Awesome Webfonts
  const fontAwesomeWebfonts = gulp
    .src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
    .pipe(gulp.dest('./vendor/fontawesome-free/webfonts'))
  // jQuery Easing
  const jqueryEasing = gulp
    .src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest('./vendor/jquery-easing'))
  // jQuery
  const jquery = gulp
    .src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js',
    ])
    .pipe(gulp.dest('./vendor/jquery'))
  const mfizz = gulp
    .src('./font-mfizz-2.4.1/*')
    .pipe(gulp.dest('./vendor/font-mfizz-2.4.1'))
  return merge(
    bootstrap,
    fontAwesomeCSS,
    fontAwesomeWebfonts,
    jquery,
    jqueryEasing,
    mfizz
  )
}

// CSS task
function css() {
  return gulp
    .src('./scss/**/*.scss')
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: './node_modules',
      })
    )
    .on('error', sass.logError)
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulp.dest('./css'))
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest('./css'))
    .pipe(browsersync.stream())
}

// JS task
function js() {
  return gulp
    .src(['./js/*.js', '!./js/*.min.js'])
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('./js'))
    .pipe(browsersync.stream())
}

// Watch files
function watchFiles() {
  gulp.watch('./scss/**/*', css)
  gulp.watch(['./js/**/*', '!./js/**/*.min.js'], js)
  gulp.watch('./img/**/*', browserSyncReload)
  gulp.watch('./**/*.html', browserSyncReload)
}

// Define complex tasks
const vendor = gulp.series(clean, modules)
const build = gulp.series(vendor, gulp.parallel(css, js))
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync))

// Export tasks
exports.css = css
exports.js = js
exports.clean = clean
exports.vendor = vendor
exports.build = build
exports.watch = watch
exports.default = build
