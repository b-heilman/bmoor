'use strict';

var gulp = require( 'gulp' );
var map = require('map-stream');
var watch = require('gulp-watch');

// testing and linting
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var yuidoc = require('gulp-yuidoc');
var karma = require('karma').server;

// demo ability
var express = require( 'express' );
var server = express();

// minify javascript
var pkg = require('./package.json');
var concat = require('gulp-concat');
var uglify = require('gulp-uglifyjs');
var header = require('gulp-header');
var footer = require('gulp-footer');

// other settings
var buildDir = './dist/',
	demoDir = './demo/',
	docDir = './doc/',
	externals = [
	],
	jsSrc = [
        './src/bmoor/core.js',
		'./src/bmoor/build/*.js',
		'./src/bmoor/defer/*.js',
		'./src/bmoor/flow/*.js',
		'./src/bmoor/error/*.js',
        './src/bmoor/extender/*.js'
    ],
    jsOut = 'bmoor.js',
    jsMin = 'bmoor.min.js',
    jsHeader = '/** <%= pkg.name %> v<%= pkg.version %> **/\n';

gulp.task( 'launch-server', function() {
	externals.forEach(function( src ){
		gulp.src( src ).pipe( gulp.dest(demoDir) );
	});

    server.use(express.static(demoDir));
    server.listen( 9000 );
});

gulp.task( 'watch', function(){
    gulp.watch( jsSrc, ['build-js'] );
});

gulp.task( 'serve', ['watch', 'launch-server'] );

gulp.task('doc', function() {
    gulp.src( jsSrc )
        .pipe( yuidoc() )
        .pipe( gulp.dest(docDir) );
});

gulp.task('concat-js', function() {
    gulp.src( jsSrc )
        .pipe( concat(jsOut) )
        .pipe( header(';(function(){\n' + jsHeader, {pkg:pkg }) )
        .pipe( footer('\n}());') )
        .pipe( gulp.dest(buildDir) )
        .pipe( gulp.dest(demoDir) );

    gulp.src( './src/bmock/**/*.js' )
        .pipe( concat('bmock.js') )
        .pipe( gulp.dest(buildDir) );
});

gulp.task('build-js', ['concat-js'], function(){
    gulp.src( jsSrc )
        .pipe( uglify(jsMin, {
            outSourceMap: true
        }) )
        .pipe( header(';(function(){\n' + jsHeader, {pkg:pkg}) )
        .pipe( footer('\n}());') )
        .pipe( gulp.dest(buildDir) )
        .pipe( gulp.dest(demoDir) );
});

var failOnError = function() {
    return map(function(file, cb) {
        if (!file.jshint.success) {
            process.exit(1);
        }
        cb(null, file);
    });
};

gulp.task('build-lint', function() {
    gulp.src( jsSrc )
        .pipe( jshint() )
        .pipe( jshint.reporter(stylish) )
        .pipe( failOnError() );
});

gulp.task('lint', function() {
    gulp.src( jsSrc )
        .pipe( jshint() )
        .pipe( jshint.reporter(stylish) );
});

gulp.task('test', function (done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true,
		browsers: ['PhantomJS']
	}, done);
});

/*
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
*/
gulp.task( 'build', ['test', 'build-lint','build-js'] );

gulp.task( 'build-serve', ['build','serve'] );
