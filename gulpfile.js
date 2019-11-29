
const gulp = require('gulp');
const mochaRun = require('gulp-mocha');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');

const testFiles = [
	'./src/*.spec.js',
	'./src/**/*.spec.js'
];

const lintFiles = [
	'./src/*.js',
	'./src/**/*.js'
];

function getTestFiles() {
	let fname = require('yargs').argv.file;

	if (fname) {
		return gulp.src([
			// './test/bootstrap.js',
			fname
		], {read: false});
	} else {
		return gulp.src([
			// './test/bootstrap.js',
		].concat(testFiles), {read: false});
	}
}

function runTests(files, onError) {
	let argv = require('yargs').argv;
	let handler = onError || function(ex){
		console.log('error?');
		console.log(ex);
	};

	return files.pipe(
		mochaRun({
			reporter: 'list',
			verbose: argv.verbose
		})
	).on('error', handler);
}

function test() {
	return runTests(getTestFiles());
}

function getLintFiles(){
	let fname = require('yargs').argv.file;

	if (fname) {
		return gulp.src([fname]);
	} else {
		return gulp.src(lintFiles);
	}
}

function runLint(files) {
	return files.pipe(
    	jshint()
    ).pipe(jshint.reporter(stylish));
}

function lint(){
	return runLint(getLintFiles());
}

gulp.task('lint', lint);
gulp.task('test', gulp.series(test, lint));
