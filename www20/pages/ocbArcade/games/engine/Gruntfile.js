module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      'dist/pwge.all.js': [
        'module/pwge/config.js',
        'module/pwge/game.js',
        'module/pwge/canvas.js',
        'module/pwge/boardManager.js',
        'module/pwge/entity.js',
        'module/pwge/input.js',
        'module/pwge/loader.js',
        'module/pwge/renderer.js',
        'module/pwge/runtime.js',
        'module/pwge/sound.js',
        'module/pwge/spriteManager.js',
        'module/pwge/util.js'
      ],
      'dist/util.all.js': [
        'module/util/easing.js',
        'module/util/ObjectPool.js',
        'module/util/PubSub.js'
      ]
    },
    "uglify": {
      options: {
        preserveComments:'some',
        compress: {
          global_defs: {
            "DEBUG": false //DEBUG모드일때만 true로 지정
          }
        },
        mangle: {
          except: []
        }
      },
      my_target: {
        files: {
          'dist/pwge.min.js': ['dist/pwge.all.js', 'dist/util.all.js']
        }
      }
    },
    // "closure-compiler": {
    //   build: {
    //     closurePath: "../",
    //     js: "temp/game.all.js",
    //     jsOutputFile: "temp/game.min.js",
    //     maxBuffer: 500,
    //     options: {
    //         // compilation_level: "ADVANCED_OPTIMIZATIONS"
    //         // language_in: "ECMASCRIPT5_STRICT",
    //     }
    //   },
    //   buildand: {
    //     closurePath: "../",
    //     js: "temp/lib.all.js",
    //     jsOutputFile: "temp/lib.min.js",
    //     maxBuffer: 500,
    //     options: {
    //         // compilation_level: "ADVANCED_OPTIMIZATIONS"
    //         // language_in: "ECMASCRIPT5_STRICT",
    //     }
    //   }
    // },
    // "copy": {
    //   main: {
    //     files: [
    //       {expand: true, src: ['index.html', 'images/*', 'js/jquery-1.10.2.min.js'], dest: '../build/ocbgame1/'},
    //       {expand: true, cwd: 'temp/', src: ['*.min.js'], dest: '../build/ocbgame1/js'},
    //     ]
    //   }
    // },
    // "clean": {
    //   build: ["temp"]
    // }
    shell : {
        jsdoc : {
            command: 'jsdoc module/pwge/*.js module/util/*.js -d doc'
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-shell');

  // Default task(s).
  // grunt.registerTask('default', ['concat', 'closure-compiler', 'copy', 'clean']);
  grunt.registerTask('default', ['concat', 'uglify', 'shell:jsdoc']);

};
