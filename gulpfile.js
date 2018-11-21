const fs          = require('fs'),
	  gulp        = require('gulp'),
	  mode        = require('gulp-mode')({
		modes: ["production", "development"],
		default: "development",
		verbose: false,
	  }),
	  runSequence = require('run-sequence'),
	  merge       = require('merge-stream'),
	  changed     = require('gulp-changed'),
	  gzip        = require('gulp-gzip'),
	  brotli      = require('gulp-brotli'),
	  sourcemaps  = require('gulp-sourcemaps'),
	  imagemin    = require('gulp-imagemin'),
	  pngquant    = require('imagemin-pngquant'),
	  webp        = require('gulp-webp'),
	  imageresize = require('gulp-image-resize'),
	  rename      = require('gulp-rename');

const basedir = mode.production() ? './prod' : './dst';
const lang = ['ja', 'en'];
const gzipLevel = 9;
const brotliLevel = 11;
const thumbScale = [1, 1.5, 2, 3];

/* Clean */
gulp.task('clean', () => {
	const clean = require('gulp-clean');
	return gulp.src(basedir)
		.pipe(clean())
});

/* EJS */
gulp.task('ejs', () => {
	const ejs          = require('gulp-ejs'),
		  minifyinline = require('gulp-minify-inline'),
		  htmlmin      = require('gulp-htmlmin');
	const res = JSON.parse(fs.readFileSync('./src/resources/res.json'));
	const tasks = lang.map(targetLang =>
		gulp.src(['./src/templates/**/*.ejs', '!./src/templates/**/_*.ejs'])
			.pipe(ejs(Object.assign(res.res[targetLang], {rev: Math.floor(Date.now() / 1000)}), {}, {ext: '.html.' + targetLang}))
			.pipe(mode.production(minifyinline()))
			.pipe(mode.production(htmlmin({
				collapseWhitespace: true,
				removeComments: true,
				removeTagWhitespace: true,
			})))
			.pipe(gulp.dest(basedir))
	);
	return merge(tasks);
});
gulp.task('ejs:compress', () => {
	if (mode.production()) {
		for (const target of lang) {
			gulp.src(basedir + '/**/*.html.' + target)
				.pipe(gzip({gzipOptions: {level: gzipLevel}}))
				.pipe(gulp.dest(basedir));
			gulp.src(basedir + '/**/*.html.' + target)
				.pipe(brotli.compress({quality: brotliLevel}))
				.pipe(gulp.dest(basedir));
		}
	}
});

/* TypeScript */
gulp.task('typescript', () => {
	const typescript = require('gulp-tsc'),
		  uglify     = require('gulp-uglify');
	return gulp.src('./src/ts/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(typescript({target: "es5"}))
		.pipe(mode.production(uglify({
			compress: true,
			sourceMap: true,
		})))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(basedir + '/j'))
});
gulp.task('typescript:compress', () => {
	if (mode.production()) {
		const gzipTask = gulp.src(basedir + '/j/**/*.js')
			.pipe(gzip({gzipOptions: {level: gzipLevel}}))
			.pipe(gulp.dest(basedir + '/j'));
		const brotliTask = gulp.src(basedir + '/j/**/*.js')
			.pipe(brotli.compress({quality: brotliLevel}))
			.pipe(gulp.dest(basedir + '/j'));
		return merge(gzipTask, brotliTask);
	}
});

/* Styles */
gulp.task('style', () => {
	const sass         = require('gulp-sass'),
		  postcss      = require('gulp-postcss'),
		  autoprefixer = require('autoprefixer'),
		  mqpacker     = require("css-mqpacker"),
		  cssnano      = require('cssnano');
	let plugins = [
		autoprefixer({
			browsers: ['last 3 version', 'IE 9', 'last 4 iOS major versions', 'Android >= 4.4'],
			cascade: false,
		}),
	];
	if (mode.production()) {
		plugins = plugins.concat([
			mqpacker(),
			cssnano({ precision: 4, autoprefixer: false }),
		]);
	}
	return gulp.src('./src/styles/app.scss')
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(postcss(plugins))
		.pipe(sourcemaps.write('./'))
		.pipe(rename('a.css'))
		.pipe(gulp.dest(basedir + '/c'));
});
gulp.task('style:compress', () => {
	if (mode.production()) {
		const gzipTask = gulp.src(basedir + '/c/**/*.css')
			.pipe(gzip({gzipOptions: {level: gzipLevel}}))
			.pipe(gulp.dest(basedir + '/c'));
		const brotliTask = gulp.src(basedir + '/c/**/*.css')
			.pipe(brotli.compress({quality: brotliLevel}))
			.pipe(gulp.dest(basedir + '/c'));
		return merge(gzipTask, brotliTask);
	}
});

/* Image */
gulp.task('svg', () =>
	gulp.src('./src/images/**/*.svg')
		.pipe(changed(basedir + '/i'))
		.pipe(mode.production(imagemin([imagemin.svgo()])))
		.pipe(gulp.dest(basedir + '/i'))
);
gulp.task('svg:compress', () => {
	if (mode.production()) {
		const gzipTask = gulp.src(basedir + '/i/**/*.svg')
			.pipe(changed(basedir + '/i'))
			.pipe(gzip({gzipOptions: {level: gzipLevel}}))
			.pipe(gulp.dest(basedir + '/i'));
		const brotliTask = gulp.src(basedir + '/i/**/*.svg')
			.pipe(changed(basedir + '/i'))
			.pipe(brotli.compress({quality: brotliLevel}))
			.pipe(gulp.dest(basedir + '/i'));
		return merge(gzipTask, brotliTask);
	}
});
gulp.task('png', () =>
	gulp.src('./src/images/**/*.png')
		.pipe(changed(basedir + '/i'))
		.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
		.pipe(gulp.dest(basedir + '/i'))
		.pipe(webp({lossless: true}))
		.pipe(gulp.dest(basedir + '/i'))
);
gulp.task('thumb-width', () => {
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
});
gulp.task('thumb-height', () => {
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
});

/* Favicon */
gulp.task('favicon', () =>
	gulp.src('./src/favicon.ico')
		.pipe(changed(basedir, {hasChanged: changed.compareSha1Digest}))
		.pipe(gulp.dest(basedir))
);
gulp.task('favicon:compress', () => {
	if (mode.production()) {
		const gzipTask = gulp.src(basedir + '/favicon.ico')
			.pipe(changed(basedir))
			.pipe(gzip({gzipOptions: {level: gzipLevel}}))
			.pipe(gulp.dest(basedir));
		const brotliTask = gulp.src(basedir + '/favicon.ico')
			.pipe(changed(basedir))
			.pipe(brotli.compress({quality: brotliLevel}))
			.pipe(gulp.dest(basedir));
		return merge(gzipTask, brotliTask);
	}
});

/* .htaccess */
gulp.task('htaccess', () =>
	gulp.src('./src/.htaccess')
		.pipe(changed(basedir, {hasChanged: changed.compareSha1Digest}))
		.pipe(gulp.dest(basedir))
);

/* Build */
gulp.task('build', () => runSequence(
	['ejs', 'typescript', 'style', 'svg', 'favicon', 'htaccess'],
	['ejs:compress', 'typescript:compress', 'style:compress', 'svg:compress', 'favicon:compress']
));
gulp.task('rebuild', () => runSequence('clean', 'build'));

/* Watch */
gulp.task('watch', ['ejs', 'typescript', 'style', 'svg', 'favicon', 'htaccess'], () => {
	gulp.watch('./src/templates/**/*.ejs', ['ejs']);
	gulp.watch('./src/ts/**/*.ts', ['typescript']);
	gulp.watch('./src/styles/app.scss', ['style']);
	gulp.watch('./src/images/**/*.svg', ['svg']);
	gulp.watch('./src/favicon.ico', ['favicon']);
	gulp.watch('./src/.htaccess', ['htaccess']);
});
