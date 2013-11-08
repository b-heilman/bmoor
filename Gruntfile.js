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
					'src/addons.js',
					'src/bMoor.js', 
					'src/bmoor/lib/Resource.js',
					'src/bmoor/lib/Bouncer.js',
					'src/bmoor/lib/KeyboardTracker.js',
					'src/bmoor/lib/MouseTracker.js',
					'src/bmoor/lib/WaitFor.js'
				],
				dest: 'build/bmoor.js',
			},
		},
		jshint: {
			options : {
				strict : false,
				laxbreak : true,
				smarttabs : true
			},
			all : ['src/bMoor.js','src/bmoor/lib/*.js']
		},
		jasmine : {
			src : ['spec/config.js','external/jquery.min.js','build/bmoor.min.js'],
			options : {
				specs : 'spec/**/*.js'
			}
		}
  	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');

	// Default task(s).
	grunt.registerTask('default', ['jshint:all','concat','uglify','jasmine']);

};
