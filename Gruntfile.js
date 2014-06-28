module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/bmoor.js',
				dest: 'build/bmoor.min.js'
			}
		},
		concat: {
			options: {
				separator: ';',
			},
			dist: {
				src: [
					'src/bMoor.js',
					'src/bmoor/build/**.js',
					'src/bmoor/defer/Stack.js',
					'src/bmoor/comm/**.js',
					'src/bmoor/core/**.js',
					'src/bmoor/error/**.js'
				],
				dest: 'build/bmoor.js',
			},
		},
		jshint: {
			jshintrc : true,
			evil : true,
			all : ['src/bmoor/**/*.js']
		},
		karma: {
			options: {
				configFile: 'karma.conf.js'
			},
			simple:{
				singleRun: true,
				browsers: ['PhantomJS']
			},
			windows:{
				singleRun: true,
				browsers: ['Chrome','Firefox','Internet Explorer']
			},
			mac:{
				singleRun: true,
				browsers: ['Chrome','Firefox','Safari']
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');

	// Default task(s).
	grunt.registerTask('default', ['jshint:all','concat','uglify','karma:simple']);
	grunt.registerTask('hint', ['jshint:all']);
	grunt.registerTask('test', ['karma:simple']);
	grunt.registerTask('make', ['concat','uglify']);
};
