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

var async = require('extern/async');
var fs =  require('fs');
var test = require('util/test');
var certgen = require('security/certgen');
var exec = require('child_process').exec;
var misc = require('util/misc');
var assert = require('assert');

(function() {
  var completed = false;
  async.series([
    async.apply(fs.mkdir, '.tests/certs', 0700),

    function(callback) {
      var hostname = 'testhostnamerare' + misc.randstr(5);
      var keypath = '.tests/certs/t.key';
      var crtpath = '.tests/certs/t.crt';
      certgen.selfsigned(hostname, keypath, crtpath, function(err) {
        assert.ifError(err);
        exec("openssl x509 -noout -subject -in .tests/certs/t.crt", function(err, stdout, stderr) {
          assert.ifError(err);
          assert.equal("subject= /CN=" + hostname, misc.trim(stdout));
          callback();
        });
      });
    }
  ],
  function(err) {
    completed = true;
    assert.ifError(err);
  });

  process.on('exit', function() {
    assert.ok(completed, 'Tests completed');
  });
})();