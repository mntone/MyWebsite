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
    var res = grunt.file.readJSON(paths.src.res + "res.json");
    var getFilteredFunc = function (language) {
        return function (f) {
            return f.lang.some(function (l) { return l == language; });
        };
    };
    var getFileMappingFunc = function (language, dir) {
        return function (f) {
            return {
                src: paths.src.ejs + f.file + ".ejs",
                dest: dir + f.file + ".html." + language,
            };
        };
    };
    var htmlFilesFunc = function (language, dir) {
        return res.files.filter(getFilteredFunc(language)).map(getFileMappingFunc(language, dir));
    };
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        paths: paths,

        // EJS, HTML
        ejs: {
            debugJa: {
                options: res.res["ja"],
                files: htmlFilesFunc("ja", paths.dst.debug),
            },
            debugEn: {
                options: res.res["en"],
                files: htmlFilesFunc("en", paths.dst.debug),
            },
            debugFr: {
                options: res.res["fr"],
                files: htmlFilesFunc("fr", paths.dst.debug),
            },
            debugFrCa: {
                options: res.res["fr"],
                files: htmlFilesFunc("fr-ca", paths.dst.debug),
            },
            debugEs: {
                options: res.res["es"],
                files: htmlFilesFunc("es", paths.dst.debug),
            },
            debugEs419: {
                options: res.res["es"],
                files: htmlFilesFunc("es-419", paths.dst.debug),
            },
            debugDe: {
                options: res.res["de"],
                files: htmlFilesFunc("de", paths.dst.debug),
            },
            debugIt: {
                options: res.res["it"],
                files: htmlFilesFunc("it", paths.dst.debug),
            },
            releaseJa: {
                options: res.res["ja"],
                files: htmlFilesFunc("ja", paths.dst.releaseObj),
            },
            releaseEn: {
                options: res.res["en"],
                files: htmlFilesFunc("en", paths.dst.releaseObj),
            },
            releaseFr: {
                options: res.res["fr"],
                files: htmlFilesFunc("fr", paths.dst.releaseObj),
            },
            releaseFrCa: {
                options: res.res["fr"],
                files: htmlFilesFunc("fr-ca", paths.dst.releaseObj),
            },
            releaseEs: {
                options: res.res["es"],
                files: htmlFilesFunc("es", paths.dst.releaseObj),
            },
            releaseEs419: {
                options: res.res["es"],
                files: htmlFilesFunc("es-419", paths.dst.releaseObj),
            },
            releaseDe: {
                options: res.res["de"],
                files: htmlFilesFunc("de", paths.dst.releaseObj),
            },
            releaseIt: {
                options: res.res["it"],
                files: htmlFilesFunc("it", paths.dst.releaseObj),
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
                    src: ["**/*.html.*"],
                    dest: paths.dst.release,
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
                    "bulletproof-font-face": false,
                    "known-properties": false,
                    "font-sizes": false,
                    "fallback-colors": false,
                    "overqualified-elements": false,
                    "adjoining-classes": false,
                    "display-property-grouping": false,
                    "floats": false,
                    "qualified-headings": false,
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

					// JavaScript
					{
					    expand: true,
					    cwd: paths.src.root + "ts/",
					    src: ["*.ts", "*.js.map", "*.js"],
					    dest: paths.dst.debug + "j/",
					},

					// Images
					{
					    expand: true,
					    cwd: paths.src.img,
					    src: ["*.png", "*.png.*", "*.svg"],
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
					    expand: true,
					    cwd: paths.src.root + "ts/",
					    src: ["*.ts", "*.js.map", "*.js"],
					    dest: paths.dst.debug + "j/",
					},

					// Images
					{
					    expand: true,
					    cwd: paths.src.img,
					    src: ["*.svg"],
					    dest: paths.dst.release + "i/",
					},

					// .htaccess
					{
					    src: paths.src.root + ".htaccess",
					    dest: paths.dst.release + ".htaccess",
					},
                ],
            },
            releaseImage: {
                files: [
                    // Images
                    {
                        expand: true,
                        cwd: paths.src.img,
                        src: ["*.png.*"],
                        dest: paths.dst.release + "i/",
                    },
                ]
            },
        },
        compress: {
            release: {
                options: {
                    mode: "gzip",
                    level: 9,
                },
                files: [
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.ja"], dest: paths.dst.release, extDot: "last", ext: ".ja.gz" },
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.en"], dest: paths.dst.release, extDot: "last", ext: ".en.gz" },
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.fr"], dest: paths.dst.release, extDot: "last", ext: ".fr.gz" },
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.fr-ca"], dest: paths.dst.release, extDot: "last", ext: ".fr-ca.gz" },
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.es"], dest: paths.dst.release, extDot: "last", ext: ".es.gz" },
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.es-419"], dest: paths.dst.release, extDot: "last", ext: ".es-419.gz" },
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.de"], dest: paths.dst.release, extDot: "last", ext: ".de.gz" },
					{ expand: true, cwd: paths.dst.release, src: ["**/*.html.it"], dest: paths.dst.release, extDot: "last", ext: ".it.gz" },
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
					{
					    expand: true,
					    cwd: paths.dst.release,
					    src: ["i/**/*.svg"],
					    dest: paths.dst.release,
					    ext: ".svg.gz"
					},
                ],
            },
            releaseImage: {
                files: [
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.ja"], dest: paths.dst.release, extDot: "last", ext: ".ja.gz" },
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.en"], dest: paths.dst.release, extDot: "last", ext: ".en.gz" },
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.fr"], dest: paths.dst.release, extDot: "last", ext: ".fr.gz" },
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.fr-ca"], dest: paths.dst.release, extDot: "last", ext: ".fr-ca.gz" },
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.es"], dest: paths.dst.release, extDot: "last", ext: ".es.gz" },
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.es-419"], dest: paths.dst.release, extDot: "last", ext: ".es-419.gz" },
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.de"], dest: paths.dst.release, extDot: "last", ext: ".de.gz" },
                    { expand: true, cwd: paths.dst.release, src: ["i/**/*.png.it"], dest: paths.dst.release, extDot: "last", ext: ".it.gz" },
                ]
            },
        },
        watch: {
            ejs: {
                files: [paths.src.ejs + "**/*.ejs"],
                tasks: ["ejs:debugJa", "ejs:debugEn", "ejs:debugFr", "ejs:debugFrCa", "ejs:debugEs", "ejs:debugEs419", "ejs:debugDe", "ejs:debugIt"],
            },
            less: {
                files: [paths.src.less + "**/*.less"],
                tasks: ["lesslint:debug", "less:debug"],
            },
            copy: {
                files: [
                    paths.src.root + "less/app.less",
                    paths.src.img + "**/*.svg",
                    paths.src.root + "ts/**/*.ts",
                    paths.src.root + "ts/**/*.js.map",
                    paths.src.root + "ts/**/*.js",
                    paths.src.root + ".htaccess"
                ],
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
    grunt.registerTask("debug-nowatch", [
        "ejs:debugJa",
        "ejs:debugEn",
        "ejs:debugFr",
        "ejs:debugFrCa",
        "ejs:debugEs",
        "ejs:debugEs419",
        "ejs:debugDe",
        "ejs:debugIt",
        "lesslint:debug",
        "less:debug",
        "copy:debug"
    ]);
    grunt.registerTask("debug", ["debug-nowatch", "connect", "watch"]);
    grunt.registerTask("default", ["debug"]);
    grunt.registerTask("release", [
        "ejs:releaseJa",
        "ejs:releaseEn",
        "ejs:releaseFr",
        "ejs:releaseFrCa",
        "ejs:releaseEs",
        "ejs:releaseEs419",
        "ejs:releaseDe",
        "ejs:releaseIt",
        "lesslint:release",
        "htmlmin:release",
        "less:release",
        "uglify:release",
        "copy:release",
        "compress:release"
    ]);
    grunt.registerTask("releaseImage", ["copy:releaseImage", "compress:releaseImage"]);
    grunt.registerTask("all", ["debug-nowatch", "release"]);
};