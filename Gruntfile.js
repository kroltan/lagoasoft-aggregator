'use strict';

var request = require('request');

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var reloadPort = 35729;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        develop: {
            server: {
                file: 'bin/www'
            }
        },
        sass: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: "app/css/",
                        src: "**/*.scss",
                        dest: "public/css/",
                        ext: ".css"
                    }
                ]
            }
        },
        pug: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: "app/templates",
                        src: "**/*.jade",
                        dest: "public/templates",
                        ext: ".html"
                    }
                ]
            }
        },
        browserify: {
            dist: {
                options: {
                    browserifyOptions: {
                        paths: [
                            "./node_modules",
                            "./public/components"
                        ],
                    },
                    watch: true,

                    transform: [
                        ["babelify", {
                            sourceMap: true,
                            presets: ["es2015"]
                        }]
                    ]
                },
                files: {
                    "public/js/index.js": ["app/js/index.js"]
                }
            }
        },
        watch: {
            options: {
                nospawn: true,
                livereload: reloadPort
            },
            server: {
                files: [
                    'bin/www',
                    'app.js',
                    'routes/*.js',
                    'src/*.js'
                ],
                tasks: ['develop', 'delayed-livereload']
            },
            jade: {
                files: ["app/templates/*.jade"],
                tasks: ["pug"]
            },
            js: {
                files: ['app/js/*.js'],
                //watchify replaces this
                //tasks: ["browserify"],
                options: {
                    livereload: reloadPort
                }
            },
            css: {
                files: [
                    'app/css/*.scss'
                ],
                tasks: ['sass'],
                options: {
                    livereload: reloadPort
                }
            },
            views: {
                files: ['views/*.jade'],
                options: {
                    livereload: reloadPort
                }
            }
        }
    });

    grunt.config.requires('watch.server.files');
    var files = grunt.file.expand(grunt.config('watch.server.files'));

    grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
        var done = this.async();
        setTimeout(function () {
            request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
                    var reloaded = !err && res.statusCode === 200;
                    if (reloaded) {
                        grunt.log.ok('Delayed live reload successful.');
                    } else {
                        grunt.log.error('Unable to make a delayed live reload.');
                    }
                    done(reloaded);
                });
        }, 500);
    });

    grunt.registerTask('default', [
        'browserify',
        'develop',
        'watch'
    ]);
};
