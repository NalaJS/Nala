var gulp = require('gulp'),
browserify = require('browserify'),
reactify = require('reactify'),
watchify = require('watchify'),
source = require('vinyl-source-stream');

gulp.task('browserify', scripts);

function scripts(){
	var bundler = browserify('./client/main.js');

	var watcher = watchify(bundler);

	return watcher
		.on('update', function(){
			var updateStart = Date.now();
			watcher
			.transform(reactify)
			.bundle()
			.on('error', function(err){
				console.log('Error compiling components', err.message);
			})
			.pipe(source('bundle.js'))
			.pipe(gulp.dest('./client/build'));
			console.log('Updated!', (Date.now() - updateStart) + 'ms');
		})
		.transform(reactify)
		.bundle()
		.on('error', function(err){
			console.log('Error compiling components', err.message);
		})
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('./client/build/'));
};

gulp.task('default', ['browserify']);
