/*
 * grunt-hogan
 * https://github.com/automatonic/grunt-hogan
 *
 * Copyright (c) 2013 Elliott B. Edwards
 * Licensed under the MIT license.
 */

var fs = require('fs'),
  when = require("when"),
  Hogan = require("hogan.js-template/lib/hogan"),
  nodepath = require('path');


module.exports = function(grunt) {
  'use strict';

  function compile(filename, cb) {

    var d = when.defer();
    fs.readFile(filename, function(err, data) {
      if (err) {
        d.reject(err);
      }
      var html = data.toString(),
        rows = html.split("\n");
      rows = rows.map(function(row) {
        return row.replace(/<!--(.*?)-->/g, '').trim();
      });
      var r = "define(function() { return " + Hogan.compile(rows.join(''), {asString: true}) + "; });";
      d.resolve(r);
    });
    return d.promise;
  };

  function compileFile(filename, options) {
    var path = nodepath.dirname(filename),
      html_filepath = filename,
      html_filename = nodepath.basename(filename),
      js_filename = options.nameFunc(html_filename),
      js_filepath = path + '/' + js_filename,
      modTime = function(path) {
        return fs.statSync(path).mtime;
      };
    if (!fs.existsSync(js_filepath) || modTime(html_filepath) >= modTime(js_filepath)) {
      return when(compile(html_filepath)).then(function(data) {
        fs.writeFile(js_filepath, data, function(err) {
          if (err) {
            grunt.log.error(err);
          }
          grunt.log.ok("Compiled " + js_filename);
        });
      });
    } else {
      return when.reject("File dont need compiling.");
    }
  };

  grunt.registerMultiTask('hogan', 'Compile a hogan template.', function() {

    var done = this.async(),
    target = this.target,
      options = this.data,
      output = null,
      templates = options.templates || options.template,
      templateFilePaths = grunt.file.expand(templates);

    options.nameFunc = options.nameFunc || function(fileName) {
      return nodepath.basename(fileName, nodepath.extname(fileName)) + ".js";
    };

    var compiled = templateFilePaths.map(function(file) {
      return compileFile(file, options);
    });
    when.all(compiled).then(function() {
      done();
    }, function() {
      done();
    });
  });
};
