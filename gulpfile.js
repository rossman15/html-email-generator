/****************************
 HTML Email Builder
 Max Lapides
 September 2014
****************************/

'use strict';

// includes
var _              = require('lodash');
var browserSync    = require('browser-sync');
var gulp           = require('gulp');
var q              = require('q');

// imports

var utils = require('./lib/utils.js');

var Build = utils.require('build');

var config = utils.requireAndInit('config', __dirname);
var templateInfo = utils.requireAndInit('templateInfo', config);

/*** GULP TASKS ***/

gulp.task('default', ['start']);
gulp.task('dev-only', ['disableProdBuilds', 'start']);
gulp.task('prod-only', ['disableDevBuilds', 'start']);

gulp.task('start', ['compile', 'watch']);

gulp.task('compile', compile);

gulp.task('watch', function() {
	gulp.watch(config.dirs.common + '/**/*', compile);
	gulp.watch(config.dirs.templates + '/**/*', compile);
});

gulp.task('disableDevBuilds', function() {
	config.buildsEnabled.dev = false;

});

gulp.task('disableProdBuilds', function() {
	config.buildsEnabled.prod = false;
});

/*** BUILD METHODS ***/

function compile(event) {
	templateInfo.getTplNames(event.path)
		.then(generateEmails)
		.then(reload)
		.done();
}

function generateEmails(templates) {

	var defer = q.defer();
	var allPromises = [];

	_.each(templates, function(tplName) {
		var build = new Build(config, tplName);
		allPromises.push(build.compile());
	});

	q.all(allPromises).then(function() {
		defer.resolve();
		utils.logSuccess('Emails compiled and saved.');
	});

	return defer.promise;

}

function reload() {

	var defer = q.defer();

	if(browserSync.active) {
		browserSync.reload();
	}

	else {
		startServer();
	}

	return defer.promise;

}

function startServer() {
	browserSync({
		server: {
			baseDir: 'build',
			directory: true
		}
	});
}
