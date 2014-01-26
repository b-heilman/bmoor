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
					'src/bmoor/defer/**.js',
					'src/bmoor/comm/**.js',
					'src/bmoor/core/Decorator.js'
				],
				dest: 'build/bmoor.js',
			},
		},
		jshint: {
			jshintrc : true,
			all : ['src/bmoor/**/*.js']
		},
		jasmine : {
			main : {
				src : [
					'src/bMoor.js',
					'spec/config.js',
					'src/bmoor/build/**.js',
					'src/bmoor/defer/**.js',
					'src/bmoor/comm/**.js',
					'src/bmoor/core/Decorator.js'
				],
				options : {
					specs : [
						'spec/**/*.js'
					]
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');

	// Default task(s).
	grunt.registerTask('default', ['jshint:all','concat','uglify','jasmine:main']);
	grunt.registerTask('hint', ['jshint:all']);
	grunt.registerTask('test', ['jshint:all', 'jasmine:main']);
	grunt.registerTask('make', ['concat','uglify']);
};
