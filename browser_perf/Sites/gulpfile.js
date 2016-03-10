var gulp = require('gulp');
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('css', function() {
  gulp.src('src/css/*')
  .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
  .pipe(minifycss())
  .pipe(gulp.dest('dist/css/'));
});

zhu

gulp.task('watch', function() {
  gulp.watch('src/*.html', ['cpy']);
  gulp.watch('src/css/*', ['css']);
  gulp.watch('dist/app/*', ['cpy']);
});

gulp.task('default', ['cpy', 'css','watch']);
