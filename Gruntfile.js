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

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    replace: {
      control: {
        options: {
          usePrefix: false,
          patterns: [
            {
              match: 'controls',
              replacement: 'controls="controls"'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['<%= yeoman.dist %>/views/explore2.map.html'], dest: '<%= yeoman.dist %>/views/'}
        ]
      },
      urls: {
        options: {
          patterns: [
            {
              match: 'OPENSENSEMAP_API_URL',
              replacement: process.env.OPENSENSEMAP_API_URL
            },
            {
              match: 'OPENSENSEMAP_MAPTILES_URL',
              replacement: process.env.OPENSENSEMAP_MAPTILES_URL
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['<%= yeoman.dist %>/scripts/*.scripts.js'], dest: '<%= yeoman.dist %>/scripts/'}
        ]
      },
      devapi: {
        options: {
          patterns: [
            {
              match: 'OPENSENSEMAP_API_URL',
              replacement: 'https://api.osem.vo1d.space'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['.tmp/scripts/services/opensenseboxapi.js'], dest: '.tmp/scripts/services'},
          {expand: true, flatten: true, src: ['.tmp/scripts/services/opensensemapapi.js'], dest: '.tmp/scripts/services'}
        ]
      },
      devmaps: {
        options: {
          patterns: [
            {
              match: 'OPENSENSEMAP_MAPTILES_URL',
              replacement: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['.tmp/scripts/controllers/map.js', '.tmp/scripts/controllers/register.js'], dest: '.tmp/scripts/controllers'},
          {expand: true, flatten: true, src: ['.tmp/scripts/services/map.js', '.tmp/scripts/services/register.js'], dest: '.tmp/scripts/services'}
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
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      translations: {
        files: ['<%= yeoman.app %>/translations/{,*/}*.json'],
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
          '<%= yeoman.app %>/scripts/services/opensenseboxapi.js',
          '<%= yeoman.app %>/scripts/services/opensensemapapi.js',
          '<%= yeoman.app %>/scripts/services/map.js'
        ],
        tasks: [
          'newer:copy:api',
          'newer:copy:apinew',
          'newer:copy:maps',
          'replace:devapi',
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
          middleware: function(connect, options) {
            var middlewares = [];
            middlewares.push(modRewrite(['!\\.html|\\.js|\\.css|\\.svg|\\.jp(e?)g|\\.png|\\.woff2|\\.gif|\\.ttf$ /index.html']));
            options.base.forEach(function(base) {
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
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
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
              js: ['concat', 'uglifyjs'],
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
          js: function (block){
            console.log(block.dest);
            return '<script defer src="' + block.dest + '"><\/script>';
          }
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    cssmin: {
      options: {
        root: '<%= yeoman.app %>'
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
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/scripts',
            src: '*.js',
            dest: '.tmp/concat/scripts',
            ext: '.annotated.js', // Dest filepaths will have this extension.
            extDot: 'last',
          }
        ]
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        },{
          expand: true,
          cwd: '<%= yeoman.dist %>/translations/angular',
          src: '*.js',
          dest: '<%= yeoman.dist %>/translations/angular'
        }]
      }
    },

    'json-minify': {
      build: {
        files: '<%= yeoman.dist %>/translations/*.json'
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
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
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'images/{,*/}*.{gif}',
            'fonts/*.*',
            'fonts/webfonts/*.*',
            'translations/*.json',
            'translations/angular/*.js'
          ]
        }, {
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
            cwd: '<%= yeoman.app %>/bower_components/bootstrap/dist',
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
      api: {
        expand: true,
        cwd: '<%= yeoman.app %>/scripts/services',
        dest: '.tmp/scripts/services',
        src: ['opensenseboxapi.js', 'map.js']
      },
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
          {expand: true, src: ['dist/*.html'], dest: './', ext: '.html.gz'},
          {expand: true, src: ['dist/views/*.html'], dest: './', extDot: 'last', ext:'.html.gz'},
          {expand: true, src: ['dist/scripts/*.vendor.js'], dest: './', extDot: 'last', ext: '.js.gz'},
          {expand: true, src: ['dist/scripts/*.scripts.js'], dest: './', extDot: 'last', ext: '.js.gz'},
          {expand: true, src: ['dist/styles/*.css'], dest: './', extDot: 'last', ext: '.css.gz'},
          {expand: true, src: ['dist/translations/angular/*.js'], dest: './', extDot: 'last', ext: '.js.gz'},
          {expand: true, src: ['dist/translations/*.json'], dest: './', extDot: 'last', ext: '.json.gz'},
          {expand: true, src: ['dist/images/**/*.png'], dest: './', extDot: 'last', ext: '.png.gz'},
          {expand: true, src: ['dist/styles/images/*.png'], dest: './', extDot: 'last', ext: '.png.gz'},
          {expand: true, src: ['dist/images/*.svg'], dest: './', extDot: 'last', ext: '.svg.gz'}

        ]
      },
      brotli: {
        options: {
          mode: 'brotli'
        },
        files: [
          {expand: true, src: ['dist/*.html'], dest: './', ext: '.html.br'},
          {expand: true, src: ['dist/views/*.html'], dest: './', extDot: 'last', ext:'.html.br'},
          {expand: true, src: ['dist/scripts/*.vendor.js'], dest: './', extDot: 'last', ext: '.js.br'},
          {expand: true, src: ['dist/scripts/*.scripts.js'], dest: './', extDot: 'last', ext: '.js.br'},
          {expand: true, src: ['dist/styles/*.css'], dest: './', extDot: 'last', ext: '.css.br'},
          {expand: true, src: ['dist/translations/angular/*.js'], dest: './', extDot: 'last', ext: '.js.br'},
          {expand: true, src: ['dist/translations/*.json'], dest: './', extDot: 'last', ext: '.json.br'},
          {expand: true, src: ['dist/images/**/*.png'], dest: './', extDot: 'last', ext: '.png.br'},
          {expand: true, src: ['dist/styles/images/*.png'], dest: './', extDot: 'last', ext: '.png.br'},
          {expand: true, src: ['dist/images/*.svg'], dest: './', extDot: 'last', ext: '.svg.br'}
        ]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles',
        'copy:api',
        'copy:apinew',
        'copy:maps',
        'copy:images'
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

    uglify: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>/translations/angular',
            src: '*.js',
            dest: '<%= yeoman.dist %>/translations/angular'
          }
        ]
      }
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
      'bowerInstall',
      'concurrent:server',
      'autoprefixer',
      'replace:devapi',
      'replace:devmaps',
      'languages',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    // 'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'bowerInstall',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    // 'ngmin',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin',
    'json-minify',
    'replace:control',
    'replace:urls',
    'compress'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('languages','',function(){
      var fs = require('fs');
      var done = this.async();
      fs.readFile('app/index.html', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var html = '';
        grunt.file.recurse('app/translations/', function(abspath, rootdir, subdir, filename){
          if (subdir !== undefined) { return; }
          if (filename.indexOf('disabled') === -1) {
            var languageCode = filename.split('.')[0];
            var language = languageCode.split('_')[0];
            html += '<li><a ng-click="header.changeLang(\''+languageCode+'\')"><span class="lang-sm lang-lbl-full" lang="'+language+'"></span></a></li>';
          }
        });
        var resultStart = data.split('<!-- languages-start -->');
        var resultEnd = data.split('<!-- languages-end -->');
        var res = resultStart[0] + '<!-- languages-start -->' + html + '<!-- languages-end -->' + resultEnd[1];

        fs.writeFile('.tmp/index.html', res, 'utf8', function (err) {
           if (err) { return console.log(err); }
           // grunt.file.copy('.tmp/index.html','app/index.html');
           done();
        });
      });
  });
};
