"use strict";

module.exports = function (grunt) {
    var paths = {
        src: {
            root: "src/",
            res: "src/resources/",
            img: "src/image/",
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
    var baseTemplates = ["base/head.ejs", "base/foot.ejs"].map(function (item) { return paths.src.ejs + item; });
    var htmlFiles = ["index", "splatoon", "univschedule/index", "univschedule/privacy", "tvupl/index", "tvupl/privacy", "ikaconnect/index", "ikaconnect/privacy", "winrtlib/privacy"];
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        paths: paths,

        // EJS, HTML
        ejs: {
            debugJa: {
                options: grunt.file.readJSON(paths.src.res + "lang-ja.json"),
                files: htmlFiles.map(function (v) {
                    return {
                        src: paths.src.ejs + v + ".ejs",
                        dest: paths.dst.debug + v + ".html",
                    };
                }),
            },
            debugEn: {
                options: grunt.file.readJSON(paths.src.res + "lang-en.json"),
                files: htmlFiles.map(function (v) {
                    return {
                        src: paths.src.ejs + v + ".ejs",
                        dest: paths.dst.debug + "en/" + v + ".html",
                    };
                }),
            },
            releaseJa: {
                options: grunt.file.readJSON(paths.src.res + "lang-ja.json"),
                files: htmlFiles.map(function (v) {
                    return {
                        src: paths.src.ejs + v + ".ejs",
                        dest: paths.dst.releaseObj + v + ".html",
                    };
                }),
            },
            releaseEn: {
                options: grunt.file.readJSON(paths.src.res + "lang-en.json"),
                files: htmlFiles.map(function (v) {
                    return {
                        src: paths.src.ejs + v + ".ejs",
                        dest: paths.dst.releaseObj + "en/" + v + ".html",
                    };
                }),
            },
        },
        htmlmin: {
            release: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                },
                files: [{
                    expand: true,
                    cwd: paths.dst.releaseObj,
                    src: ["**/*.html"],
                    dest: paths.dst.release,
                    ext: ".html",
                }],
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
                    "font-sizes": false,
                    "fallback-colors": false,
                    "overqualified-elements": false,
                    "adjoining-classes": false,
                    "display-property-grouping": false,
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
					},
                ],
            },
        },

        // TypeScript, JavaScript
        uglify: {
            options: {
                mangle: true,
                compress: true
            },
            release: {
                files: [
					{
					    src: paths.src.root + "ts/p.js",
					    dest: paths.dst.release + "j/p.js",
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
					},

					// CSS
					{
					    src: paths.src.root + "css/mnuik.css",
					    dest: paths.dst.debug + "c/mnuik.css",
					},

					// JavaScript
					{
					    src: paths.src.root + "ts/p.js",
					    dest: paths.dst.debug + "j/p.js",
					},

					// Images
					{
					    expand: true,
					    cwd: paths.src.img,
					    src: ["*.png", "*.jpg", "*.svg"],
					    dest: paths.dst.debug + "i/",
					},

					// .htaccess
					{
					    src: paths.src.root + ".htaccess",
					    dest: paths.dst.debug + ".htaccess",
					},
                ],
            },
            release: {
                files: [
					// JavaScript
					{
					    src: paths.src.root + "js/p.js",
					    dest: paths.dst.release + "j/p.js",
					},

					// Images
					{
					    expand: true,
					    cwd: paths.src.img,
					    src: ["*.png", "*.jpg", "*.svg"],
					    dest: paths.dst.release + "i/",
					},

					// .htaccess
					{
					    src: paths.src.root + ".htaccess",
					    dest: paths.dst.release + ".htaccess",
					},
                ],
            },
        },
        compress: {
            release: {
                options: {
                    mode: "gzip",
                    level: 9,
                },
                files: [
					{
					    expand: true,
					    cwd: paths.dst.release,
					    src: ["**/*.html"],
					    dest: paths.dst.release,
					    ext: ".html.gz",
					},
					{
					    expand: true,
					    cwd: paths.dst.release,
					    src: ["**/*.js"],
					    dest: paths.dst.release,
					    ext: ".js.gz",
					},
					{
					    expand: true,
					    cwd: paths.dst.release,
					    src: ["**/*.css"],
					    dest: paths.dst.release,
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
            copy: {
                files: [paths.src.root + "less/app.less", paths.src.root + "ts/p.js", paths.src.root + ".htaccess"],
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
    grunt.initConfig(config);
    for (var taskName in config.pkg.devDependencies) {
        if (taskName.substring(0, 6) == "grunt-") {
            grunt.loadNpmTasks(taskName);
        }
    }
    grunt.registerTask("debug-nowatch", ["ejs:debugJa", "ejs:debugEn", "lesslint:debug", "less:debug", "copy:debug"]);
    grunt.registerTask("debug", ["debug-nowatch", "connect", "watch"]);
    grunt.registerTask("default", ["debug"]);
    grunt.registerTask("release", ["ejs:releaseJa", "ejs:releaseEn", "lesslint:release", "htmlmin:release", "less:release", "uglify:release", "copy:release", "compress:release"]);
    grunt.registerTask("all", ["debug-nowatch", "release"]);
};