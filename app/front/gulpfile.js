var gulp = require('gulp');
var	minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var usemin = require("gulp-usemin");
var ngmin = require('gulp-ngmin');
var insert = require('gulp-insert-lines');
var replace = require('gulp-regex-replace');
var templateCache = require("gulp-angular-templatecache");


// Assets
gulp.task("fonts", function () {
	gulp.src("front/assets/fonts/*")
		.pipe(gulp.dest("dist/assets/fonts"));
});
gulp.task("fontawesome", function () {
	gulp.src("front/bower_components/components-font-awesome/fonts/*")
		.pipe(gulp.dest("dist/assets/fonts"));
});
gulp.task("img", function () {
	gulp.src("front/assets/img/*")
		.pipe(gulp.dest("dist/assets/img"));
});

// Templates
gulp.task("templates", function () {
	gulp.src("front/app/templates/**/*.html")
		.pipe(templateCache("templates.js", {
			standalone: true,
			root: 'front/app/templates'
		}))
		.pipe(gulp.dest("front/app"));
	gulp.src("front/index.html")
		.pipe(insert({
			'before': '<script src="front/app/app.js"></script>',
			'lineBefore': '<script src="front/app/templates.js"></script>'
		}))
		.pipe(gulp.dest("front"));
	gulp.src("front/app/app.js")
		.pipe(insert({
			'before': 'prescrisurApp.commonsServices',
			'lineBefore': "'templates',"
		}))
		.pipe(gulp.dest("front/app"));
});

// index.html
gulp.task("usemin", ["templates"], function () {
	return gulp.src("front/index.html")
		.pipe(usemin({
			path: process.env.ASSETS_DIR || '../prescrisur',
			lib: [uglify()],
			app: [ngmin(), uglify()],
			css: [minifyCSS()]
		}))
		.pipe(replace({regex:'href="assets\/css', replace:'href="front/assets/css'}))
		.pipe(replace({regex:'src="js', replace:'src="front/js'}))
		.pipe(gulp.dest("dist"));
});

gulp.task('build',['usemin', 'fonts', 'fontawesome', 'img']);