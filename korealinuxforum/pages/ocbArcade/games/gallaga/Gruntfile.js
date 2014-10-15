/*
 * Copyright (c) 2014. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        "concat": {
            'temp/game.all.js' : ['../common/localStorage.js','js/game.js','js/util.js','js/application.js']
        },
        "uglify": {
            options: {
                preserveComments:'some'
            },
            my_target: {
                files: {
                    'temp/game.min.js':['temp/game.all.js']
                }
            }
        },
        "copy": {
           main:{
               files: [
                   {expand: true, cwd: 'temp/', src: ['*.min.js'], dest: 'js/'}
               ]
           }
        },
        "clean": {
            build:["temp"]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-closure-compiler');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'copy', 'clean']);

};