/*
 * grunt-syncFolder
 * https://github.com/alekart/grunt-syncFolder
 *
 * Sync two folders. The files absent in source folder are removed in the dest folder, the files absent in dest folder are copied from source folder
 *
 * Copyright (c) 2016 Aleksei Polechin
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {
	/**
	 * Sync images (original) with img (compressed)
	 * if and image in compressed folder does not exist
	 * in original folder it will be deleted
	 */
	grunt.registerMultiTask('syncFolder', '', function () {
		// `folder` will be compared to the source folder
		// all files in 'folder' that do not exist in 'source' folder will be deleted
		// if tinypng sigs file is provided: the source files paths that are present in the sigs file will be removed
		// so the pictures can be minified again to the dest folder

		// merge options with defaults
		var options = this.options({
			folder: '',
			source: '',
			tinypng: false
		});

		var originals = grunt.file.expand(options.source + '/**'),
			compressed = grunt.file.expand(options.folder + '/**'),
			folders = [],
			files = [],
			deletedFiles = 0,
			deletedFolders = 0;

		// log start of the task
		grunt.log.writeln('\n>> Syncing ' + options.folder['yellow'].bold +
			' folder with ' + options.source['yellow'].bold + '\n');

		var cleanTinypng = function (files) {
			var tinySigsF = options.source + '/tinypng.json';
			if (!grunt.file.exists(tinySigsF))
				return;

			var tinySigs = grunt.file.readJSON(tinySigsF);

			files.forEach(function (path) {
				if (tinySigs.hasOwnProperty(path)) {
					delete tinySigs[path];
				}
			});

			grunt.file.write(tinySigsF, JSON.stringify(tinySigs, null, '\t'));
		};

		var filter = function (obj) {
			return originals.indexOf(obj.replace(options.folder + '/', options.source + '/')) == -1;
		};
		var diff = compressed.filter(filter);

		// remove files that does not exist in source folder
		diff.forEach(function (path) {
			if (path !== options.folder) {
				// if path is folder, just push it in the folder list to check later if need to be deleted or not
				if (grunt.file.isDir(path)) {
					folders.push(path);
				}
				else {
					// check is path exists the delete the file
					if (grunt.file.exists(path)) {
						grunt.file.delete(path);
						var original = path.replace(options.folder + '/', options.source + '/');
						files.push(original);
						deletedFiles++;

						grunt.log.writeln('del '['red'].bold + path['cyan']);
					}
				}
			}
		});

		// remove folders listed in the folder list that do not exists in source folder
		folders.forEach(function (path) {
			var dir = path.replace(options.folder + '/', options.source + '/');
			if (!grunt.file.isDir(dir) && grunt.file.exists(path)) {
				grunt.file.delete(path);
				deletedFolders++;

				grunt.log.writeln('del '['red'].bold + path['yellow']);
			}
		});

		// list deleted files
		if (deletedFiles || deletedFolders) {
			grunt.log.writeln('    These files/folders were deleted because there is no equivalent in the original folder'['grey']);
			grunt.log.writeln('------');

			// remove the image from tinypng sig file so it can be compressed again if same file is put back
			if(options.tinypng){
				cleanTinypng(files);
			}
		}
		if (deletedFiles)
			grunt.log.writeln('Files '['cyan'].bold + 'deleted:   ' + deletedFiles);
		if (deletedFolders)
			grunt.log.writeln('Folders '['yellow'].bold + 'deleted: ' + deletedFolders);
		if (!deletedFiles && !deletedFolders)
			grunt.log.ok('There is no compressed files that has no original equivalent. Nothing was deleted.');
	});
};
