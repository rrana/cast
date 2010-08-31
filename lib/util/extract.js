/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The extract_tarball implementation is based heavily on code from NPM:
 *
 *   <http://github.com/isaacs/npm/blob/master/lib/utils/exec.js>
 *
 * Copyright 2009, 2010 Isaac Zimmitti Schlueter. All rights reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

var fs = require('fs');
var sys = require('sys');
var spawn = require('child_process').spawn;
var log = require('util/log');
var config = require('util/config');
var fsutil = require('util/fs');

exports.extract_tarball = function(tarball, target, mode, cb) {
  fs.mkdir(target, mode, function(err) {
    if (err) {
      return cb(err);
    }

    var err_state = false;

    function on_error(err) {
      err_state = true;
      fsutil.rmtree(target, function() {
        return cb(err);
      });
    }

    var gzip = spawn(config.get().gzip, ['--decompress', '--stdout', tarball]);
    var tar = spawn(config.get().tar, ['vx', '--strip-components=1', '-C', target], {
      cwd: undefined,
      env: process.env,
      customFds: [gzip.stdout.fd, -1, -1]
    });

    gzip.on('exit', function(code) {
      if (code && !err_state) {
        log.err("Error decompressing bundle, gzip exited with code: " + code);
        try {
          tar.kill();
        }
        catch (err) {
          log.warn("Unable to kill tar: " + err);
        }
        return on_error(new Error("Error decompressing bundle"));
      }
    });

    tar.on('exit', function(code) {
      if (!err_state) {
        if (code) {
          return on_error(new Error("Error extracting tarball"));
        }
        cb();
      }
    });
  });
};
