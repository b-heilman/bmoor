module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/bMoor.js',
				dest: 'build/bmoor.min.js'
			}
		},
		concat: {
			options: {
				separator: ';',
				banner:';(function(){',
				footer: '\n}());',
			},
			dist: {
				src: [
					'src/bmoor/core.js',
					'src/bmoor/build/*.js',
					'src/bmoor/defer/*.js',
					'src/bmoor/flow/*.js',
					'src/bmoor/core/*.js',
					'src/bmoor/data/*.js',
					'src/bmoor/error/*.js'
				],
				dest: 'build/bmoor.js',
			},
		},
		jshint: {
			options : {
				jshintrc : true,
				verbose : true
			},
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
	grunt.registerTask('lint', ['jshint:all']);
	grunt.registerTask('test', ['karma:simple']);
	grunt.registerTask('make', ['concat','uglify']);
};
