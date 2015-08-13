var gulp        = require('gulp'),
    stylus      = require('gulp-stylus'),
    concat      = require('gulp-concat'),
    cssmin      = require('gulp-cssmin'),
    uglify      = require('gulp-uglify'),
    minifyHTML  = require('gulp-minify-html'),
    rename      = require('gulp-rename'),
    connect     = require('gulp-connect');

gulp.task('styles', function () {
    gulp.src('css/styles.styl')
        .pipe(stylus())
        .pipe(cssmin())
        .pipe(rename('styles.min.css'))
        .pipe(gulp.dest('css/'))
        .pipe(connect.reload());
});

gulp.task('scripts', function () {
    gulp.src('js/scripts.js')
        .pipe(uglify())
        .pipe(rename('scripts.min.js'))
        .pipe(gulp.dest('js/'))
        .pipe(connect.reload());
});

gulp.task('html', function () {
    gulp.src('dev_index.html')
        .pipe(minifyHTML())
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'))
        .pipe(connect.reload());
});

gulp.task('webserver', function() {
    connect.server({
        livereload: true
    });
});


gulp.task('watch', function() {
    gulp.watch('css/*.styl', ['styles']);
    gulp.watch('js/*.js', ['scripts']);
    gulp.watch('dev_index.html', ['html']);
});

gulp.task('default', ['html', 'styles', 'scripts', 'webserver', 'watch']);