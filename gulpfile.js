var gulp = require('gulp'),
    connect = require('gulp-connect');

gulp.task('connect', function() {
    connect.server({
        root: '',
        port: 9000,
        livereload: true
    });
});

gulp.task('default', ['connect']);