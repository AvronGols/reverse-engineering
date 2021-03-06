const { src, dest, series, watch } = require('gulp');

const include         = require('gulp-file-include');
const autoprefixer    = require('gulp-autoprefixer');
const concat          = require('gulp-concat');
const sass            = require('gulp-sass');
const csso            = require('gulp-csso');
const htmlmin         = require('gulp-htmlmin');
const imagemin        = require('gulp-imagemin');
const uglify          = require('gulp-uglify');
const { production }  = require('gulp-mode')();
const sync            = require('browser-sync').create();
const del             = require('del');
const ghPages         = require('gh-pages');
const path            = require('path');

const clear = () => {
  return del('dist');
};

const libs = () => {
  return src('src/libs/**/*')
    .pipe(dest('dist/libs'));
};

const scss = () => {
  return src('src/scss/**/*.scss')
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'] }))
    .pipe(production(csso()))
    .pipe(concat('index.css'))
    .pipe(dest('dist'));
};

const html = () => {
  return src('src/[^_]*.html')
    .pipe(include({ prefix: '@@' }))
    .pipe(production(htmlmin({ collapseWhitespace: true })))
    .pipe(dest('dist'));
};

const js = () => {
  return src('src/js/**/*.js')
    .pipe(production(uglify()))
    .pipe(concat('index.js'))
    .pipe(dest('dist'));
};

const images = () => {
  return src('src/images/**/*')
    .pipe(production(imagemin()))
    .pipe(dest('dist/images'));
};

const fonts = () => {
  return src('src/fonts/**/*')
    .pipe(dest('dist/fonts'));
};

const deploy = (cb) => {
  ghPages.publish(path.join(process.cwd(), 'dist'), cb);
}

const watching = () => {
  sync.init({ 
    server: './dist', 
    notify: false
  });
  watch('src/libs/**/*', series(libs)).on('change', sync.reload);
  watch('src/**/*.html', series(html)).on('change', sync.reload);
  watch('src/scss/**/*.scss', series(scss)).on('change', sync.reload);
  watch('src/js/**/*.js', series(js)).on('change', sync.reload);
  watch('src/images/**/*', series(images)).on('change', sync.reload);
  watch('src/fonts/**/*', series(fonts)).on('change', sync.reload);
};

exports.clear = series(clear);
exports.build = series(clear, libs, scss, html, js, images, fonts);
exports.default = series(clear, libs, scss, html, js, images, fonts, watching);
exports.deploy = deploy;
