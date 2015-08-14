var gulp        = require('gulp'),
    stylus      = require('gulp-stylus'),
    concat      = require('gulp-concat'),
    cssmin      = require('gulp-cssmin'),
    uglify      = require('gulp-uglify'),
    minifyHTML  = require('gulp-minify-html'),
    bump        = require('gulp-bump'),
    tagVersion  = require('gulp-tag-version'),
    replace     = require('gulp-replace'),
    filter      = require('gulp-filter'),
    autopfixer  = require('gulp-autoprefixer'),
    git         = require('gulp-git'),
    rename      = require('gulp-rename'),
    connect     = require('gulp-connect');

/* Style Task */
gulp.task('styles', function () {
    return gulp.src('css/styles.styl')
        .pipe(stylus())
        .pipe(autopfixer())
        .pipe(cssmin())
        .pipe(rename('styles.min.css'))
        .pipe(gulp.dest('css/'))
        .pipe(connect.reload());
});

/* Script Task */
gulp.task('scripts', function () {
    return gulp.src('js/scripts.js')
        .pipe(uglify())
        .pipe(rename('scripts.min.js'))
        .pipe(gulp.dest('js/'))
        .pipe(connect.reload());
});

/* HTML compress Task */
gulp.task('html', function () {
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var version = 'v' + obj.version;

    return gulp.src('dev_index.html')
        .pipe(minifyHTML())
        .pipe(rename('index.html'))
        .pipe(replace('{{version}}', version))
        .pipe(gulp.dest('./'))
        .pipe(connect.reload());
});

/* Webserver Task */
gulp.task('webserver', function() {
    connect.server({
        livereload: true
    });
});


/* Versioning Tasks */

function inc(importance) {
    // get all the files to bump version in
    return gulp.src('./package.json')
        // bump the version number in those files
        .pipe(bump({type: importance}))
        .pipe(gulp.dest('./'))
}

gulp.task('bump:patch', function () { return inc('patch'); });
gulp.task('bump:minor', function () { return inc('minor'); });
gulp.task('bump:major', function () { return inc('major'); });


/* Watch Task */
gulp.task('watch', function() {
    gulp.watch('css/*.styl', ['styles']);
    gulp.watch('js/*.js', ['scripts']);
    gulp.watch('dev_index.html', ['html']);
});

gulp.task('default', ['html', 'styles', 'scripts', 'webserver', 'watch']);