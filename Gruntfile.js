module.exports = function(grunt) {
  grunt.initConfig({

    // configure apidoc 
    apidoc: {
      myapp: {
            src: "app/",
            dest: "apidoc/"
          }
    },

    // configure jshint
    jshint: {
            all: ['Gruntfile.js', 'app/**/**/*.js']
    },

    // configure watch
    watch: {
        files: ['Gruntfile.js', 'app/**/**/*.js'],
        tasks: ['jshint', 'apidoc', 'nodemon']
    },

    // configure nodemon
    nodemon: {
      dev: {
        script: 'server.js'
      }
    }
  });

  // load npm tasks
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-apidoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // register the nodemon task when we run grunt
  grunt.registerTask('default', ['apidoc:myapp', 'jshint:all', 'nodemon']);  

};
