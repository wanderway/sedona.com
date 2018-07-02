'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var config = {
    notify: false,
    logPrefix: '_blank',
    logFileChanges: false,
    server: ['build', 'src'],
    logSnippet: false
};

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: 'build/*'
};

gulp.task('webserver', function () {
    browserSync.init(config);
});
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html', function () {
    return gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js', function () {
    return gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify()).on('error', function (error) {
            console.log(error.toString());
            this.emit('end');
        })
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style', function () {
    return gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({ sourceMap: true, errLogToConsole: true })).on('error', function (error) {
            console.log(error.toString());
            this.emit('end');
        })
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image', function (cb) {
    rimraf(path.build.img, cb);
    return gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts', function () {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', gulp.parallel('html', 'js', 'style', 'fonts', 'image'));


gulp.task('watch', function () {
    gulp.watch([path.watch.html], gulp.series('html'));
    gulp.watch([path.watch.style], gulp.series('style'));
    gulp.watch([path.watch.js], gulp.series('js'));
    gulp.watch([path.watch.img], gulp.series('image'));
    gulp.watch([path.watch.fonts], gulp.series('fonts'));
});


gulp.task('default', gulp.series('clean', gulp.parallel('build', 'webserver', 'watch')));