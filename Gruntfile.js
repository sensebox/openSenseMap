// Generated on 2014-05-20 using generator-angular 0.8.0

'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  var modRewrite = require('connect-modrewrite');
  var serveStatic = require('serve-static');
  var { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    env: {
      dev: {
        src: ".env"
      }
    },

    replace: {
      control: {
        options: {
          usePrefix: false,
          patterns: [
            {
              match: 'controls',
              replacement: 'controls="map.controls"'
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['<%= yeoman.dist %>/views/explore2.map.html'], dest: '<%= yeoman.dist %>/views/' }
        ]
      },
      urls: {
        options: {
          patterns: [
            {
              match: 'OPENSENSEMAP_API_URL',
              replacement: '<%= OPENSENSEMAP_API_URL %>'
            },
            {
              match: 'OPENSENSEMAP_STYLE_URL',
              replacement: '<%= OPENSENSEMAP_STYLE_URL %>'
            },
            {
              match: 'OPENSENSEMAP_ACCESS_TOKEN',
              replacement: '<%= OPENSENSEMAP_ACCESS_TOKEN %>'
            },
            {
              match: 'VERSION',
              replacement: '<%= pkg.version %>'
            },
            {
              match: 'REVISION',
              replacement: '<%= gitinfo.local.branch.current.shortSHA %>'
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['<%= yeoman.dist %>/scripts/*.scripts.js'], dest: '<%= yeoman.dist %>/scripts/' }
        ]
      },
      devapi: {
        options: {
          patterns: [
            {
              match: 'OPENSENSEMAP_API_URL',
              replacement: '<%= OPENSENSEMAP_API_URL %>'
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['.tmp/scripts/constants.js'], dest: '.tmp/scripts' },
          { expand: true, flatten: true, src: ['.tmp/scripts/services/opensensemapapi.js'], dest: '.tmp/scripts/services' }
        ]
      },
      devmaps: {
        options: {
          patterns: [
            {
              match: 'OPENSENSEMAP_STYLE_URL',
              replacement: '<%= OPENSENSEMAP_STYLE_URL %>'
            },
            {
              match: 'OPENSENSEMAP_ACCESS_TOKEN',
              replacement: '<%= OPENSENSEMAP_ACCESS_TOKEN %>'
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['.tmp/components/leaflet.directive.js'], dest: '.tmp/components' }
        ]
      },
      version: {
        options: {
          patterns: [
            {
              match: 'VERSION',
              replacement: '<%= pkg.version %>'
            },
            {
              match: 'REVISION',
              replacement: '<%= gitinfo.local.branch.current.shortSHA %>'
            },
            {
              match: 'NAME',
              replacement: '<%= OPENSENSEMAP_RELEASE_NAME %>'
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['.tmp/scripts/constants.js'], dest: '.tmp/scripts' }
        ]
      }
    },

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
      },
      js: {
        files: [
          '<%= yeoman.app %>/scripts/{,*/}*.js',
          '<%= yeoman.app %>/components/{,*/}*.js'
        ],
        tasks: ['newer:eslint'],
        options: {
          livereload: true
        }
      },
      //jsTest: {
      //  files: ['test/spec/{,*/}*.js'],
      //  tasks: ['newer:jshint:test', 'karma']
      //},
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      html: {
        files: ['<%= yeoman.app %>/index.html'],
        tasks: ['languages'],
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      devs: {
        files: [
          '<%= yeoman.app %>/scripts/controllers/map.js',
          '<%= yeoman.app %>/scripts/controllers/register.js',
          // '<%= yeoman.app %>/scripts/services/opensenseboxapi.js',
          '<%= yeoman.app %>/scripts/services/opensensemapapi.js',
          '<%= yeoman.app %>/scripts/services/map.js',
          '<%= yeoman.app %>/components/leaflet.directive.js',
          '<%= yeoman.app %>/components/charts.directive.js',
          '<%= yeoman.app %>/components/calendar.directive.js',
          '<%= yeoman.app %>/components/badge.directive.js',
          '<%= yeoman.app %>/components/loader.directive.js',
          '<%= yeoman.app %>/components/clipboard.directive.js'
        ],
        tasks: [
          // 'newer:copy:api',
          'loadconst',
          'newer:copy:apinew',
          'newer:copy:maps',
          'replace:devapi',
          'newer:copy:components',
          'replace:devmaps'
        ],
        options: {
          livereload: true
        }
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35729,
        base: 'app'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ],
          middleware: function (connect, options) {
            var middlewares = [];
            middlewares.push(modRewrite(['!\\.html|\\.js|\\.css|\\.svg|\\.jp(e?)g|\\.png|\\.woff2|\\.gif|\\.ttf$ /index.html']));
            options.base.forEach(function (base) {
              middlewares.push(serveStatic(base));
            });

            return middlewares;
          }
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    eslint: {
      target: ['<%= yeoman.app %>/scripts/{,*/}*.js']
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp/',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp/'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    bowerInstall: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: '<%= yeoman.app %>/'
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/scripts/{,*/}*.js.map',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '!<%= yeoman.dist %>/images/placeholder.png',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>'],
        blockReplacements: {
          js: function (block) {
            console.log(block.dest);

            return `<script defer src="${block.dest}"><\/script>`;
          }
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    ngAnnotate: {
      options: {
        add: true,
        singleQuotes: true
      },
      dist: {
        files: [
          {
            expand: true,
            src: ['<%= yeoman.dist %>/scripts/scripts.js']
          },
          {
            expand: true,
            src: ['<%= yeoman.dist %>/translations/angular/*.js']
          }
        ]
      }
    },

    uglify: {
      options: {
        mangle: true,
        sourceMap: true
      },
      dist: {
        files: [
          {
            expand: true,
            src: ['<%= yeoman.dist %>/scripts/*.js']
          },
          {
            expand: true,
            src: ['<%= yeoman.dist %>/translations/angular/*.js']
          }
        ]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      translations: {
        files: [
          {
            expand: true,
            cwd: 'node_modules/angular-i18n/',
            dest: '.tmp/translations/angular',
            src: ['angular-locale_{<%= pkg.languages %>}.js']
          }
        ]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'browserconfig.xml',
            'site.webmanifest',
            'views/{,*/}*.html',
            'components/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'images/{,*/}*.{gif}',
            'fonts/*.*',
            'fonts/webfonts/*.*'
          ]
        },
        {
          expand: true,
          cwd: 'node_modules/angular-i18n/',
          dest: 'dist/translations/angular',
          src: ['angular-locale_{<%= pkg.languages %>}.js']
        },
        {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/bower_components/leaflet/dist',
          src: ['images/*.*'],
          dest: '<%= yeoman.dist %>/styles/'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/bower_components/font-awesome',
          src: ['fonts/*.*'],
          dest: '<%= yeoman.dist %>'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/bower_components/bootstrap-css-only',
          src: ['fonts/*.*'],
          dest: '<%= yeoman.dist %>'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/bower_components/bootstrap-languages',
          src: ['languages.png'],
          dest: '<%= yeoman.dist %>/styles/'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/images',
          src: ['*.gif'],
          dest: '<%= yeoman.dist %>/images/'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/images',
          src: ['*.jpg'],
          dest: '<%= yeoman.dist %>/images/'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/images',
          src: ['*.png'],
          dest: '<%= yeoman.dist %>/images/'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/images',
          src: ['*.ico'],
          dest: '<%= yeoman.dist %>/images/'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/bower_components/Leaflet.awesome-markers/dist',
          src: ['images/*.*'],
          dest: '<%= yeoman.dist %>/styles/'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      },
      app: {
        expand: true,
        cwd: '<%= yeoman.app %>/scripts',
        dest: '.tmp/scripts',
        src: ['app.js', 'constants.js']
      },
      components: {
        expand: true,
        cwd: '<%= yeoman.app %>/components',
        dest: '.tmp/components',
        src: ['{,*/}*.js']
      },
      // api: {
      //   expand: true,
      //   cwd: '<%= yeoman.app %>/scripts/services',
      //   dest: '.tmp/scripts/services',
      //   src: ['opensenseboxapi.js', 'map.js']
      // },
      apinew: {
        expand: true,
        cwd: '<%= yeoman.app %>/scripts/services',
        dest: '.tmp/scripts/services',
        src: 'opensensemapapi.js'
      },
      maps: {
        expand: true,
        cwd: '<%= yeoman.app %>/scripts/controllers',
        dest: '.tmp/scripts/controllers',
        src: ['map.js', 'register.js']
      },
      images: {
        expand: true,
        cwd: '<%= yeoman.app %>/images',
        dest: '.tmp/images',
        src: 'favicon.svg'
      }
    },

    // gzip html, css and js files
    compress: {
      gzip: {
        options: {
          mode: 'gzip'
        },
        files: [
          { expand: true, src: ['dist/*.html'], dest: './', ext: '.html.gz' },
          { expand: true, src: ['dist/views/*.html'], dest: './', extDot: 'last', ext: '.html.gz' },
          { expand: true, src: ['dist/components/*.html'], dest: './', extDot: 'last', ext: '.html.gz' },
          { expand: true, src: ['dist/scripts/*.vendor.js'], dest: './', extDot: 'last', ext: '.js.gz' },
          { expand: true, src: ['dist/scripts/*.scripts.js'], dest: './', extDot: 'last', ext: '.js.gz' },
          { expand: true, src: ['dist/styles/*.css'], dest: './', extDot: 'last', ext: '.css.gz' },
          { expand: true, src: ['dist/translations/angular/*.js'], dest: './', extDot: 'last', ext: '.js.gz' },
          { expand: true, src: ['dist/images/*.svg'], dest: './', extDot: 'last', ext: '.svg.gz' }

        ]
      },
      brotli: {
        options: {
          mode: 'brotli'
        },
        files: [
          { expand: true, src: ['dist/*.html'], dest: './', ext: '.html.br' },
          { expand: true, src: ['dist/views/*.html'], dest: './', extDot: 'last', ext: '.html.br' },
          { expand: true, src: ['dist/components/*.html'], dest: './', extDot: 'last', ext: '.html.br' },
          { expand: true, src: ['dist/scripts/*.vendor.js'], dest: './', extDot: 'last', ext: '.js.br' },
          { expand: true, src: ['dist/scripts/*.scripts.js'], dest: './', extDot: 'last', ext: '.js.br' },
          { expand: true, src: ['dist/styles/*.css'], dest: './', extDot: 'last', ext: '.css.br' },
          { expand: true, src: ['dist/translations/angular/*.js'], dest: './', extDot: 'last', ext: '.js.br' },
          { expand: true, src: ['dist/images/*.svg'], dest: './', extDot: 'last', ext: '.svg.br' }
        ]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles',
        'copy:app',
        'copy:components',
        // 'copy:api',
        'copy:apinew',
        'copy:maps',
        'copy:images',
        'copy:translations'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma-unit.conf.js',
        singleRun: true
      }
    }
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'env:dev',
      'loadconst',
      'bowerInstall',
      'concurrent:server',
      'autoprefixer',
      'replace:devapi',
      'replace:devmaps',
      'gitinfo',
      'replace:version',
      'languages',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([`serve:${target}`]);
  });

  grunt.registerTask('loadconst', 'Load constants', function (target) {
    console.log('Load constants: ', process.env.OPENSENSEMAP_API_URL, process.env.OPENSENSEMAP_STYLE_URL, process.env.OPENSENSEMAP_ACCESS_TOKEN);
    grunt.config('OPENSENSEMAP_API_URL', process.env.OPENSENSEMAP_API_URL);
    grunt.config('OPENSENSEMAP_STYLE_URL', process.env.OPENSENSEMAP_STYLE_URL);
    grunt.config('OPENSENSEMAP_ACCESS_TOKEN', process.env.OPENSENSEMAP_ACCESS_TOKEN);

    var  shortName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals], // colors can be omitted here as not used
      length: 2
    }); // big-donkey

    console.log(shortName);
    grunt.config('OPENSENSEMAP_RELEASE_NAME', shortName);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    // 'karma'
  ]);

  grunt.registerTask('testBuild', ['env:dev', 'build']);

  grunt.registerTask('build', [
    'clean:dist',
    'loadconst',
    'gitinfo',
    'bowerInstall',
    'useminPrepare',
    'concurrent:dist',
    'copy:dist',
    'autoprefixer',
    'concat',
    'languages',
    'ngAnnotate',
    'cssmin',
    'rev',
    'uglify',
    'usemin',
    'htmlmin',
    'replace:control',
    'replace:urls',
    'compress'
  ]);

  grunt.registerTask('default', [
    'newer:eslint',
    'test',
    'build'
  ]);

  grunt.registerTask('languages', '', function () {
    var target = grunt.option('target');
    var targetFile = '.tmp/index.html';
    if (target === 'build' || target === 'testBuild') {
      targetFile = 'dist/index.html';
    }
    var fs = require('fs');
    var done = this.async();
    fs.readFile('app/index.html', 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      var html = '';
      var pkg = grunt.file.readJSON('package.json');
      for (let index = 0; index < pkg.i18n.length; index++) {
        const languageCode = pkg.i18n[index];
        var language = languageCode.split('_')[0];
        html = html + ('<li><a ng-click="header.changeLang(\'' + languageCode + '\')"><span class="lang-sm lang-lbl-full" lang="' + language + '"></span></a></li>');
      }

      var resultStart = data.split('<!-- languages-start -->');
      var resultEnd = data.split('<!-- languages-end -->');
      var res = `${resultStart[0]}<!-- languages-start -->${html}<!-- languages-end -->${resultEnd[1]}`;

      fs.writeFile(targetFile, res, 'utf8', function (err) {
        if (err) { return console.log(err); }
        // grunt.file.copy('.tmp/index.html','app/index.html');
        done();
      });
    });
  });
};
