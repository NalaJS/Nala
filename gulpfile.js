var gulp = require('gulp'),
browserify = require('browserify'),
reactify = require('reactify'),
watchify = require('watchify'),
source = require('vinyl-source-stream'),
notify = require('gulp-notify');

function handleErrors() {
	var args = Array.prototype.slice.call(arguments);
	notify.onError({
		title: 'Compile Error',
		message : '<%= error.message %>'
	}).apply(this, args);

	this.emit('end'); // keeps gulp from hanging on this task
}

function buildScript(file, watch) {
	var props = {
		entries : ['./client/' + file],
		debug : true,
		transform : [reactify]
	}

	var bundler = watch ? watchify(browserify(props)) : browserify(props);

	function rebundle() {
		var stream = bundler.bundle();
		return stream
			.on('error', handleErrors)
			.pipe(source('bundle.js'))
			.pipe(gulp.dest('./client/build/'))
	}

	bundler.on('update', function() {
		var updateStart = Date.now();
		rebundle();
		console.log('Updated!', (Date.now() - updateStart) + "ms");
	});

	return rebundle();
}

gulp.task('scripts', function() {
	return buildScript('main.js', false);
});

gulp.task('default', ['scripts'], function() {
	return buildScript('main.js', true);
});
