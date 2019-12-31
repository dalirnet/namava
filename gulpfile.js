// gulp
const gulp = require('gulp');
const rename = require('gulp-rename');

// html
const htmlMin = require('gulp-htmlmin');

// style
const concatCss = require('gulp-concat-css');
const cleanCSS = require('gulp-clean-css');
const autoPrefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-csso');

// script
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

// image
const imageMin = require('gulp-tinify');


gulp.task('html', function () {
    return gulp.src('src/index.html')
        .pipe(htmlMin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('copy', function () {
    return gulp.src(['src/manifest.json', 'src/browserconfig.xml'])
        .pipe(gulp.dest('build'));
});

gulp.task('css', function () {
    return gulp.src([
        'src/styles/*.css',
    ])
        .pipe(concatCss('bundle.css'))
        .pipe(cleanCSS({
            level: {
                2: {
                    all: true,
                    removeDuplicateRules: true
                }
            }
        }))
        .pipe(autoPrefixer())
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/styles'));
});

gulp.task('js-debug', function () {
    return gulp.src('src/scripts/index.js')
        .pipe(browserify())
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('build/scripts'));
});

gulp.task('js', function () {
    return gulp.src('src/scripts/index.js', {
        sourcemaps: true
    })
        .pipe(browserify())
        .pipe(babel({
            presets: ['@babel/env'],
            compact: false
        }))
        .pipe(uglify({
            mangle: {
                toplevel: true
            },
            sourceMap: true,
            toplevel: true
        }))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('build/scripts', {
            sourcemaps: true
        }));
});

gulp.task('img', function () {
    return gulp.src('src/images/**')
        .pipe(imageMin('ssWfmsQd-m_1ed6b7DSOP11WUCNU4NUm'))
        .pipe(gulp.dest('build/images'));
});

gulp.task('font', function () {
    return gulp.src([
        'src/fonts/**/*.eot',
        'src/fonts/**/*.svg',
        'src/fonts/**/*.ttf',
        'src/fonts/**/*.woff',
        'src/fonts/**/*.woff2',
    ])
        .pipe(gulp.dest('build/fonts'));
});

gulp.task('watch', function () {
    gulp.watch(['src/index.html'], gulp.registry().get('html'));
    gulp.watch(['src/styles/*.css'], gulp.registry().get('css'));
    gulp.watch(['src/scripts/**/*.js'], gulp.registry().get('js-debug'));
})


gulp.task('all', gulp.parallel('html', 'copy', 'css', 'js', 'img', 'font'));
gulp.task('default', gulp.parallel('html', 'css', 'js-debug', 'watch'));