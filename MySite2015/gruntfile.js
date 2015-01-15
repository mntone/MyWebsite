"use strict";

module.exports = function ( grunt )
{
	var FileFilter = ( function ()
	{
		function FileFilter( element )
		{
			this.element = element;
			this.fileSystem = require( "fs" );
		}
		FileFilter.prototype.compare = function ( src, dst )
		{
			var isNewer = true;
			if( this.fileSystem.existsSync( dst ) )
			{
				isNewer = this.fileSystem.statSync( src ).mtime > this.fileSystem.statSync( dst ).mtime;
			}
			return isNewer;
		};
		FileFilter.prototype.isNewer = function ( dst )
		{
			var self = this;
			return function ( src )
			{
				return self.compare( src, dst );
			};
		};
		FileFilter.prototype.isNewerAny = function ( src, dst )
		{
			var self = this;
			var ret;
			return function ( file )
			{
				if( typeof value !== "undefined" ) return ret;
				if( typeof src === "string" )
				{
					src = eval( src );
				}
				else if( !( src instanceof Array ) )
				{
					src = [src];
				}
				ret = src.some( function ( s )
				{
					return self.compare( s, dst );
				} );
				grunt.log.debug( "isNewerAny: ", ret ? "yes" : "no", " (src: ", src, ")" );
				return ret;
			};
		};
		return FileFilter;
	} )();
	var ff = new FileFilter();

	var paths = {
		src: {
			root: "src/",
			res: "src/resources/",
			ejs: "src/ejs/",
			less: "src/less/",
			ts: "src/ts/",
		},
		dst: {
			debug: "../bin/debug/",
			release: "../bin/release/",
			releaseObj: "../obj/release/",
		},
	};
	var baseTemplates = ["base/header.ejs", "base/head.ejs", "base/footer.ejs", "base/foot.ejs"].map( function ( item ) { return paths.src.ejs + item; } );
	var config = {
		pkg: grunt.file.readJSON( "package.json" ),
		paths: paths,

		// EJS, HTML
		ejs: {
			debugJa: {
				options: grunt.file.readJSON( paths.src.res + "lang-ja.json" ),
				files: [
					{
						src: paths.src.ejs + "index.ejs",
						dest: paths.dst.debug + "index.html",
						filter: ff.isNewerAny( [paths.src.ejs + "index.ejs"].concat( baseTemplates ), paths.dst.debug + "index.html" ),
					},
				],
			},
			debugEn: {
				options: grunt.file.readJSON( paths.src.res + "lang-en.json" ),
				files: [
					{
						src: paths.src.ejs + "index.ejs",
						dest: paths.dst.debug + "en/index.html",
						filter: ff.isNewerAny( [paths.src.ejs + "index.ejs"].concat( baseTemplates ), paths.dst.debug + "en/index.html" ),
					},
				],
			},
			releaseJa: {
				options: grunt.file.readJSON( paths.src.res + "lang-ja.json" ),
				files: [
					{
						src: paths.src.ejs + "index.ejs",
						dest: paths.dst.releaseObj + "index.html",
						filter: ff.isNewerAny( [paths.src.ejs + "index.ejs"].concat( baseTemplates ), paths.dst.releaseObj + "index.html" ),
					},
				],
			},
			releaseEn: {
				options: grunt.file.readJSON( paths.src.res + "lang-en.json" ),
				files: [
					{
						src: paths.src.ejs + "index.ejs",
						dest: paths.dst.releaseObj + "en/index.html",
						filter: ff.isNewerAny( [paths.src.ejs + "index.ejs"].concat( baseTemplates ), paths.dst.releaseObj + "en/index.html" ),
					},
				],
			},
		},
		htmlmin: {
			release: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
				},
				files: grunt.file.expand( { cwd: paths.dst.releaseObj }, "**/*.html" ).map( function ( fn )
				{
					return {
						src: paths.dst.releaseObj + fn,
						dest: paths.dst.release + fn,
						filter: ff.isNewer( paths.dst.release + fn ),
					};
				} ),
			},
		},

		// LESS, CSS
		lesslint: {
			options: {
				csslint: {
					ids: false,
					"box-model": false,
					"box-sizing": false,
					"unique-headings": false,
					"font-faces": false,
					"bulletproof-font-face": false,
					"known-properties": false,
				},
			},
			debug: {
				src: [paths.src.less + "app.less"],
			},
			release: {
				src: [paths.src.less + "app.less"],
			},
		},
		less: {
			debug: {
				options: {
					sourceMap: true,
					strictUnits: true,
				},
				files: [
					{
						src: paths.src.less + "app.less",
						dest: paths.dst.debug + "c/a.css",
						filter: ff.isNewerAny( [paths.src.less + "mixins.less", paths.src.less + "app.less"], paths.dst.debug + "c/a.css" ),
					},
				],
			},
			release: {
				options: {
					cleancss: true,
					strictUnits: true,
				},
				files: [
					{
						src: paths.src.less + "app.less",
						dest: paths.dst.release + "c/a.css",
						filter: ff.isNewerAny( [paths.src.less + "mixins.less", paths.src.less + "app.less"], paths.dst.release + "c/a.css" ),
					},
				],
			},
		},

		// Other
		copy: {
			debug: {
				files: [
					// LESS
					{
						src: paths.src.root + "less/app.less",
						dest: paths.dst.debug + "c/a.less",
						filter: ff.isNewer( paths.dst.debug + "c/a.less" ),
					},

					// JavaScript
					{
						src: paths.src.root + "js/p.js",
						dest: paths.dst.debug + "j/p.js",
						filter: ff.isNewer( paths.dst.debug + "j/p.js" ),
					},

					// .htaccess
					{
						src: paths.src.root + ".htaccess",
						dest: paths.dst.debug + ".htaccess",
						filter: ff.isNewer( paths.dst.debug + ".htaccess" ),
					},
				],
			},
			release: {
				files: [
					// JavaScript
					{
						src: paths.src.root + "js/p.js",
						dest: paths.dst.release + "j/p.js",
						filter: ff.isNewer( paths.dst.release + "j/p.js" ),
					},

					// .htaccess
					{
						src: paths.src.root + ".htaccess",
						dest: paths.dst.release + ".htaccess",
						filter: ff.isNewer( paths.dst.release + ".htaccess" ),
					},
				],
			},
		},
		compress: {
			release: {
				options: {
					mode: "gzip",
					level: 5,
				},
				files: [
					{
						expand: true,
						src: paths.dst.release + "**/*.html",
						dst: paths.dst.release,
						ext: ".html.gz",
					},
					{
						expand: true,
						src: paths.dst.release + "**/*.js",
						dst: paths.dst.release,
						ext: ".js.gz",
					},
					{
						expand: true,
						src: paths.dst.release + "**/*.css",
						dst: paths.dst.release,
						ext: ".css.gz",
					},
				],
			},
		},
		watch: {
			ejs: {
				files: [paths.src.ejs + "**/*.ejs"],
				tasks: ["ejs:debugJa", "ejs:debugEn"],
			},
			less: {
				files: [paths.src.less + "**/*.less"],
				tasks: ["lesslint:debug", "less:debug"],
			},
			ts: {
				files: [paths.src.ts + "**/*.ts"],
				tasks: ["tslint:debug", "typescript:debug"],
			},
			copy: {
				files: [paths.src.root + "less/app.less", paths.src.root + "ts/app.ts", paths.src.root + ".htaccess"],
				tasks: ["copy:debug"],
			},
		},
		connect: {
			server: {
				options: {
					hostname: "localhost",
					port: 88,
					base: paths.dst.debug,
				},
			},
		},
	};
	grunt.initConfig( config );
	for( var taskName in config.pkg.devDependencies )
	{
		if( taskName.substring( 0, 6 ) == "grunt-" )
		{
			grunt.loadNpmTasks( taskName );
		}
	}
	grunt.registerTask( "debug-nowatch", ["ejs:debugJa", "ejs:debugEn", "lesslint:debug", "less:debug", "copy:debug"] );
	grunt.registerTask( "debug", ["debug-nowatch", "connect", "watch"] );
	grunt.registerTask( "default", ["debug"] );
	grunt.registerTask( "release", ["ejs:releaseJa", "ejs:releaseEn", "lesslint:release", "htmlmin:release", "less:release", "copy:release", "compress:release"] );
	grunt.registerTask( "all", ["debug-nowatch", "release"] );
};