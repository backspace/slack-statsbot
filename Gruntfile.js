module.exports = function(grunt) {
  // FIXME three problems:
  // * had to add --es_staging --use-strict flags to node_modules/grunt-tape/node_modules/tape/bin/tap #! node command
  // * cannot run `grunt test`, but `grunt tape` works
  // * running `npm test` throws an ES6-related error, but running `grunt tape` directly does not!

  grunt.initConfig({
    tape: {
      options: {
        pretty: true,
        output: 'console'
      },
      files: ['test/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-tape');
  grunt.registerTask('test', ['tape:pretty']);
  grunt.registerTask('ci', ['tape:ci']);
  grunt.registerTask('default', ['test']);
};
