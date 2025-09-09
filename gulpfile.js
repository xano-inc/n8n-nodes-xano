const { task, src, dest } = require('gulp');

task('build:icons', function() {
	return src('nodes/**/*.svg')
		.pipe(dest('dist/nodes/'));
});