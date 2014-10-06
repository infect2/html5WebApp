module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "concat": {
      'temp/planet-arcade-1.0.js': ['js/jquery-1.8.0.min.js', 'js/idangerous.swiper.min.js', 'js/polyfill.js', 'js/cubeView.js', 'js/idleTimer.js', 'js/main.js']
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
          'temp/planet-arcade-1.0.min.js': ['temp/planet-arcade-1.0.js']
        }
      }
    },
    "copy": {
      main: {
        files: [
          {expand: true, src: ['index.html', 'css/*.css' ,'img/*.jpg', 'img/*.png', 'img/*.gif', 'js/jquery-1.8.0.min.js', 'js/cubeView.js', 'js/idangerous.swiper.min.js', 'js/idleTimer.js', 'js/main.js', 'js/polyfill.js', 'snowfalling.js'], dest: '../build/ocbArcade/'},
          {expand: true, cwd: 'temp/', src: ['*.min.js'], dest: './js'},
        ]
      }
    },
    "clean": {
      build: ["temp"]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-closure-compiler');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'copy', 'clean']);
};
