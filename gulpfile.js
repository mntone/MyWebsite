const fs          = require('fs'),
	  gulp        = require('gulp'),
	  mode        = require('gulp-mode')({
		modes: ["production", "development"],
		default: "development",
		verbose: false,
	  }),
	  merge       = require('merge-stream'),
	  changed     = require('gulp-changed'),
	  sourcemaps  = require('gulp-sourcemaps'),
	  imagemin    = require('gulp-imagemin'),
	  pngquant    = require('imagemin-pngquant'),
	  webp        = require('gulp-webp'),
	  imageresize = require('gulp-image-resize'),
	  rename      = require('gulp-rename');

const basedir = mode.production() ? './prod' : './dst';
const lang = ['ja', 'en'];
const thumbScale = [1, 1.5, 2, 3];

/* Clean */
function clean() {
	const clean = require('gulp-clean');
	return gulp.src(basedir)
		.pipe(clean())
}
exports.clean = clean

/* EJS */
function ejs() {
	const ejs          = require('gulp-ejs'),
		  minifyinline = require('gulp-minify-inline'),
		  htmlmin      = require('gulp-htmlmin');
	const res = JSON.parse(fs.readFileSync('./src/resources/res.json'));
	const tasks = lang.map(targetLang =>
		gulp.src(['./src/templates/**/*.ejs', '!./src/templates/**/_*.ejs'])
			.pipe(ejs(Object.assign(res.res[targetLang], {rev: Math.floor(Date.now() / 1000)})))
			.pipe(mode.production(minifyinline()))
			.pipe(mode.production(htmlmin({
				collapseWhitespace: true,
				removeComments: true,
				removeTagWhitespace: true,
			})))
			.pipe(rename({extname: '.html.' + targetLang}))
			.pipe(gulp.dest(basedir))
	);
	return merge(tasks);
}
exports.ejs = ejs

/* TypeScript */
function typescript() {
	const typescript = require('gulp-typescript'),
		  uglify     = require('gulp-uglify');
	return gulp
		.src('./src/ts/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(typescript({target: "es5"}))
		.pipe(mode.production(uglify({
			compress: true,
			sourceMap: true,
		})))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(basedir + '/j'))
}
exports.typescript = typescript

/* Styles */
function style() {
	const sass         = require('gulp-sass'),
		  postcss      = require('gulp-postcss'),
		  autoprefixer = require('autoprefixer'),
		  mqpacker     = require("css-mqpacker"),
		  cssnano      = require('cssnano');
	let plugins = [
		autoprefixer(),
	];
	if (mode.production()) {
		plugins = plugins.concat([
			mqpacker(),
			cssnano({ precision: 4, autoprefixer: false }),
		]);
	}
	return gulp
		.src('./src/styles/app.scss', { sourcemaps: true })
		.pipe(sass())
		.pipe(postcss(plugins))
		.pipe(rename('a.css'))
		.pipe(gulp.dest(basedir + '/c'), { sourcemaps: './sourcemaps' });
}
exports.style = style

/* Image */
function svg() {
	return gulp
		.src('./src/images/**/*.svg')
		.pipe(changed(basedir + '/i'))
		.pipe(mode.production(imagemin([imagemin.svgo()])))
		.pipe(gulp.dest(basedir + '/i'))
}
exports.svg = svg
function png() {
	return gulp
		.src('./src/images/**/*.png')
		.pipe(changed(basedir + '/i'))
		.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
		.pipe(gulp.dest(basedir + '/i'))
		.pipe(webp({lossless: true}))
		.pipe(gulp.dest(basedir + '/i'))
}
exports.png = png
function thumbWidth() {
	const tasks = thumbScale.map(scale =>
		gulp.src(['./src/images/ic-win81-*.png', './src/images/ic-uap10.0d-*.png'])
			.pipe(rename({suffix: '-t' + (10 * scale)}))
			.pipe(imageresize({
				width: 200 * scale,
			}))
			.pipe(mode.production(imagemin([pngquant({quality: '40-60', speed: 1})])))
			.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
			.pipe(gulp.dest(basedir + '/i'))
			.pipe(webp({lossless: true}))
			.pipe(gulp.dest(basedir + '/i'))
	);
	return merge(tasks);
}
exports.thumbWidth = thumbWidth
function thumbHeight() {
	const tasks = thumbScale.map(scale =>
		gulp.src(['./src/images/ic-wpa81-*.png', './src/images/ic-uap10.0m-*.png', './src/images/ca-ios-*.png'])
			.pipe(rename({suffix: '-t' + (10 * scale)}))
			.pipe(imageresize({
				height: 200 * scale,
			}))
			.pipe(mode.production(imagemin([pngquant({quality: '40-60', speed: 1})])))
			.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
			.pipe(gulp.dest(basedir + '/i'))
			.pipe(webp({lossless: true}))
			.pipe(gulp.dest(basedir + '/i'))
	);
	return merge(tasks);
}
exports.thumbHeight = thumbHeight

/* Favicon */
function favicon() {
	return gulp.src('./src/favicon.ico')
		.pipe(changed(basedir, {hasChanged: changed.compareSha1Digest}))
		.pipe(gulp.dest(basedir))
}
exports.favicon = favicon

/* .htaccess */
function htaccess() {
	return gulp.src('./src/.htaccess')
		.pipe(changed(basedir, {hasChanged: changed.compareSha1Digest}))
		.pipe(gulp.dest(basedir))
}
exports.htaccess = htaccess

/* Build */
const defaultTasks = gulp.parallel(ejs, typescript, style, favicon, htaccess)
gulp.task('build', defaultTasks);
gulp.task('rebuild', gulp.series(clean, defaultTasks));

/* Watch files */
function watchFiles() {
	gulp.watch('./src/templates/**/*.ejs', ejs)
	gulp.watch('./src/ts/**/*.ts', typescript)
	gulp.watch('./src/styles/app.scss', style)
	gulp.watch('./src/favicon.ico', favicon)
	gulp.watch('./src/.htaccess', htaccess)
}
gulp.task('watch', watchFiles);
