const fs          = require('fs'),
	  gulp        = require('gulp'),
	  mode        = require('gulp-mode')({
		modes: ["production", "development"],
		default: "development",
		verbose: false,
	  }),
	  merge       = require('merge-stream'),
	  browserSync = require('browser-sync').create(),
	  changed     = require('gulp-changed'),
	  sourcemaps  = require('gulp-sourcemaps'),
	  imagemin    = require('gulp-imagemin'),
	  pngquant    = require('imagemin-pngquant'),
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
	const sass         = require('gulp-sass')(require('sass')),
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
		.pipe(sass.sync())
		.pipe(postcss(plugins))
		.pipe(rename('a.css'))
		.pipe(gulp.dest(basedir + '/c'), { sourcemaps: './sourcemaps' });
}
exports.style = style

/* Image */
function svg() {
	return gulp
		.src('./src/images/**/*.svg')
		.pipe(changed(basedir + '/i', {hasChanged: changed.compareContents}))
		.pipe(mode.production(imagemin([imagemin.svgo()])))
		.pipe(gulp.dest(basedir + '/i'))
}
exports.svg = svg
function png() {
	return gulp
		.src('./src/images/**/*.png')
		.pipe(changed(basedir + '/i', {hasChanged: changed.compareContents}))
		.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
		.pipe(gulp.dest(basedir + '/i'))
}
exports.png = png
function thumbWidth() {
	const tasks = thumbScale.map(scale =>
		gulp.src(['./src/images/ic-win81-*.png', './src/images/ic-uap10.0d-*.png'])
			.pipe(rename({suffix: '@' + (10 * scale)}))
			.pipe(imageresize({
				width: 200 * scale,
			}))
			.pipe(mode.production(imagemin([pngquant({quality: [0.4, 0.6], speed: 1})])))
			.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
			.pipe(gulp.dest(basedir + '/i'))
	);
	return merge(tasks);
}
exports.thumbWidth = thumbWidth
function thumbHeight() {
	const tasks = thumbScale.map(scale =>
		gulp.src(['./src/images/ic-wpa81-*.png', './src/images/ic-uap10.0m-*.png', './src/images/ca-ios-*.png'])
			.pipe(rename({suffix: '@' + (10 * scale)}))
			.pipe(imageresize({
				height: 200 * scale,
			}))
			.pipe(mode.production(imagemin([pngquant({quality: [0.4, 0.6], speed: 1})])))
			.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
			.pipe(gulp.dest(basedir + '/i'))
	);
	return merge(tasks);
}
exports.thumbHeight = thumbHeight

function webp() {
	const webp = require('gulp-webp')
	return gulp
		.src([`${basedir}/i/**/*.png`, `!${basedir}/i/**/*@*.png`])
		.pipe(changed(basedir + '/i', {extension: '.webp', hasChanged: changed.compareContents}))
		.pipe(webp({lossless: true}))
		.pipe(gulp.dest(basedir + '/i'))
}
exports.webp = webp

function webpthumb() {
	const webp = require('gulp-webp')
	return gulp
		.src(`${basedir}/i/**/*@*.png`)
		.pipe(changed(basedir + '/i', {extension: '.webp', hasChanged: changed.compareContents}))
		.pipe(webp())
		.pipe(gulp.dest(basedir + '/i'))
}
exports.webpthumb = webpthumb

function avif() {
	const avif  = require('gulp-avif')
	return gulp
		.src([`${basedir}/i/**/*.png`, `!${basedir}/i/**/*@*.png`])
		.pipe(changed(basedir + '/i', {extension: '.avif', hasChanged: changed.compareContents}))
		.pipe(avif({lossless: true, quality: 70, speed: 1}))
		.pipe(gulp.dest(basedir + '/i'))
}
exports.avif = avif

function avifthumb() {
	const avif  = require('gulp-avif')
	return gulp
		.src(`${basedir}/i/**/*@*.png`)
		.pipe(changed(basedir + '/i', {extension: '.avif', hasChanged: changed.compareContents}))
		.pipe(avif({speed: 2, quality: 40}))
		.pipe(gulp.dest(basedir + '/i'))
}
exports.avifthumb = avifthumb

/* Favicon */
function favicon() {
	return gulp.src('./src/favicon.ico')
		.pipe(changed(basedir, {hasChanged: changed.compareContents}))
		.pipe(gulp.dest(basedir))
}
exports.favicon = favicon

/* .htaccess */
function htaccess() {
	return gulp.src('./src/.htaccess')
		.pipe(changed(basedir, {hasChanged: changed.compareContents}))
		.pipe(gulp.dest(basedir))
}
exports.htaccess = htaccess

/* Build */
const defaultTasks = gulp.parallel(ejs, typescript, style, favicon, htaccess)
gulp.task('image', gulp.series(gulp.parallel(svg, png, thumbWidth, thumbHeight), gulp.parallel(webp, webpthumb, avif, avifthumb)));
gulp.task('build', defaultTasks);
gulp.task('rebuild', gulp.series(clean, defaultTasks));

/* Watch files */
const browserSyncOption = {
	port: 8080,
	server: {
		baseDir: basedir,
		index: 'index.html.ja',
		middleware(req, res, next) {
			const url = req.url;
			if (url.indexOf('.ja') > -1) {
				res.setHeader('Content-Type', 'text/html');
			} else if (url.indexOf('.en') > -1) {
				res.setHeader('Content-Type', 'text/html');
			}

			next();
		}
	},
	reloadOnRestart: true,
};
function browsersync(done) {
	browserSync.init(browserSyncOption);
	done();
}
function watchFiles() {
	const browserReload = () => {
		browserSync.reload();
		done();
	};
	gulp.watch('./src/templates/**/*.ejs', gulp.series(ejs, browserReload))
	gulp.watch('./src/ts/**/*.ts', gulp.series(typescript, browserReload))
	gulp.watch('./src/styles/app.scss', gulp.series(style, browserReload))
	gulp.watch('./src/favicon.ico', gulp.series(favicon, browserReload))
	gulp.watch('./src/.htaccess', gulp.series(htaccess, browserReload))
}
gulp.task('watch', gulp.series(browsersync, watchFiles));
