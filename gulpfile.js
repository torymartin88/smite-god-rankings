var gulp        = require('gulp'),
    stylus      = require('gulp-stylus'),
    concat      = require('gulp-concat'),
    cssmin      = require('gulp-cssmin'),
    uglify      = require('gulp-uglify'),
    minifyHTML  = require('gulp-minify-html'),
    rename      = require('gulp-rename');

gulp.task('styles', function () {
    gulp.src('css/styles.css')
        .pipe(cssmin())
        .pipe(rename('styles.min.css'))
        .pipe(gulp.dest('css/'));
});

gulp.task('scripts', function () {
    gulp.src('js/scripts.js')
        .pipe(uglify())
        .pipe(rename('scripts.min.js'))
        .pipe(gulp.dest('js/'));
});

gulp.task('html', function () {
    gulp.src('dev_index.html')
        .pipe(minifyHTML())
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['html', 'styles', 'scripts']);