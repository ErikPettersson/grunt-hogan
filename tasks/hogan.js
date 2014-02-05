/*
 * grunt-hogan
 * https://github.com/automatonic/grunt-hogan
 *
 * Copyright (c) 2013 Elliott B. Edwards
 * Licensed under the MIT license.
 */

var fs = require('fs')
  Hogan = require("hogan.js-template/lib/hogan"),
  nodepath = require('path');


module.exports = function (grunt) {
  'use strict';

  function compile(filename) {

    var data = fs.readFileSync(filename);
    var html = data.toString(),
      rows = html.split("\n");
    rows = rows.map(function (row) {
      return row.replace(/<!--(.*?)-->/g, '').trim();
    });
    return "define(function() { return " + Hogan.compile(rows.join(''), {asString: true}) + "; });";
  }

  function compileFile(filename, options) {
    var path = nodepath.dirname(filename),
      //html_filepath = filename,
      html_filename = nodepath.basename(filename),
      js_filename = options.nameFunc(html_filename),
      js_filepath = path + '/' + js_filename,
      modTime = function (path) {
        return fs.statSync(path).mtime;
      };
    if (!fs.existsSync(js_filepath) || modTime(filename) >= modTime(js_filepath)) {
      var data = compile(filename);
      fs.writeFileSync(js_filepath, data);
      fs.unlinkSync(filename);
      grunt.log.ok("Compiled " + js_filename);
      return js_filename;
    }
  }

  grunt.registerMultiTask('hogan', 'Compile a hogan template.', function () {

    var options = this.data,
      templates = options.templates || options.template,
      templateFilePaths = grunt.file.expand(templates);

    options.nameFunc = options.nameFunc || function (fileName) {
      return nodepath.basename(fileName, nodepath.extname(fileName)) + ".js";
    };

    var compiled = templateFilePaths.map(function (file) {
      return compileFile(file, options);
    });

    grunt.log.ok("Compiled " + compiled.length + " templates");
  });
};
