const fs           = require('fs'),
	  gulp         = require('gulp'),
	  mode         = require('gulp-mode')({
		modes: ["production", "development"],
		default: "development",
		verbose: false,
	  }),
	  runSequence  = require('run-sequence'),
	  merge        = require('merge-stream'),
	  clean        = require('gulp-clean'),
	  gzip         = require('gulp-gzip'),
	  brotli       = require('gulp-brotli'),
	  ejs          = require('gulp-ejs'),
	  htmlmin      = require('gulp-htmlmin'),
	  typescript   = require('gulp-tsc'),
	  uglify       = require('gulp-uglify'),
	  less         = require('gulp-less'),
	  autoprefixer = require('gulp-autoprefixer'),
	  cleancss     = require('gulp-clean-css'),
	  sourcemaps   = require('gulp-sourcemaps'),
	  imagemin     = require('gulp-imagemin'),
	  webp         = require('gulp-webp'),
	  imageresize  = require('gulp-image-resize'),
	  rename       = require('gulp-rename');

const basedir = mode.production() ? './prod' : './dst';
const lang = ['ja', 'en'];
const gzipLevel = 9;
const brotliLevel = 11;
const thumbScale = [1, 1.5, 2, 3];

/* Clean */
gulp.task('clean', () =>
	gulp.src(basedir)
		.pipe(clean())
);

/* EJS */
gulp.task('ejs', () => {
	const res = JSON.parse(fs.readFileSync('./src/resources/res.json'));
	const tasks = lang.map(targetLang =>
		gulp.src(['./src/templates/**/*.ejs', '!src/templates/**/_*.ejs'])
			.pipe(ejs(Object.assign(res.res[targetLang], {rev: Math.floor(Date.now() / 1000)}), {}, {ext: '.html.' + targetLang}))
			.pipe(mode.production(htmlmin({
				collapseWhitespace: true,
				removeComments: true,
				removeTagWhitespace: true,
			})))
			.pipe(gulp.dest(basedir))
	);
	return merge(tasks);
});
gulp.task('ejs-compress', () => {
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
gulp.task('typescript', () =>
	gulp.src('./src/ts/**/*.ts')
		.pipe(mode.development(sourcemaps.init()))
		.pipe(typescript({
			target: "es5",
		}))
		.pipe(mode.production(uglify({
			compress: true,
			sourceMap: true,
		})))
		.pipe(mode.development(sourcemaps.write('./')))
		.pipe(gulp.dest(basedir + '/j'))
);
gulp.task('typescript-compress', () => {
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

/* LESS */
gulp.task('less', () =>
	gulp.src('./src/less/app.less')
		.pipe(mode.development(sourcemaps.init()))
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['last 3 version', 'iOS >= 8.1', 'Android >= 4.4'],
			cascade: false,
		}))
		.pipe(rename('a.css'))
		.pipe(mode.production(cleancss({level: 2})))
		.pipe(mode.development(sourcemaps.write('./')))
		.pipe(gulp.dest(basedir + '/c'))
);
gulp.task('less-compress', () => {
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
		.pipe(mode.production(imagemin([imagemin.svgo()])))
		.pipe(gulp.dest(basedir + '/i'))
);
gulp.task('svg-compress', () => {
	if (mode.production()) {
		const gzipTask = gulp.src(basedir + '/i/**/*.svg')
			.pipe(gzip({gzipOptions: {level: gzipLevel}}))
			.pipe(gulp.dest(basedir + '/i'));
		const brotliTask = gulp.src(basedir + '/i/**/*.svg')
			.pipe(brotli.compress({quality: brotliLevel}))
			.pipe(gulp.dest(basedir + '/i'));
		return merge(gzipTask, brotliTask);
	}
});
gulp.task('png', () =>
	gulp.src('./src/images/**/*.png')
		.pipe(mode.production(imagemin([imagemin.optipng({optimizationLevel: 6})])))
		.pipe(gulp.dest(basedir + '/i'))
		.pipe(webp({lossless: true}))
		.pipe(gulp.dest(basedir + '/i'))
);
gulp.task('thumb-width', () => {
	const tasks = thumbScale.map(scale =>
		gulp.src(['./src/images/ic-win81-*.png', './src/images/ic-uap10.0d-*.png'])
			.pipe(imageresize({
				width: 200 * scale,
			}))
			.pipe(rename({suffix: '-t' + (10 * scale)}))
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
			.pipe(imageresize({
				height: 200 * scale,
			}))
			.pipe(rename({suffix: '-t' + (10 * scale)}))
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
		.pipe(gulp.dest(basedir))
);
gulp.task('favicon-compress', () => {
	if (mode.production()) {
		const gzipTask = gulp.src('./src/favicon.ico')
			.pipe(gzip({gzipOptions: {level: gzipLevel}}))
			.pipe(gulp.dest(basedir));
		const brotliTask = gulp.src('./src/favicon.ico')
			.pipe(brotli.compress({quality: brotliLevel}))
			.pipe(gulp.dest(basedir));
		return merge(gzipTask, brotliTask);
	}
});

/* .htaccess */
gulp.task('htaccess', () =>
	gulp.src('./src/.htaccess')
		.pipe(gulp.dest(basedir))
);

/* Build */
gulp.task('build', () => runSequence(
	['ejs', 'typescript', 'less', 'svg', 'favicon', 'htaccess'],
	['ejs-compress', 'typescript-compress', 'less-compress', 'svg-compress', 'favicon-compress']
));
gulp.task('rebuild', () => runSequence('clean', 'build'));

/* Watch */
gulp.task('watch', ['ejs', 'typescript', 'less', 'svg', 'favicon', 'htaccess'], () => {
	gulp.watch('./src/templates/**/*.ejs', ['ejs']);
	gulp.watch('./src/ts/**/*.ts', ['typescript']);
	gulp.watch('./src/less/app.less', ['less']);
	gulp.watch('./src/images/**/*.svg', ['svg']);
	gulp.watch('./src/favicon.ico', ['favicon']);
	gulp.watch('./src/.htaccess', ['htaccess']);
});
