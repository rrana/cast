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

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

var async = require('extern/async');

var ps = require('util/pubsub');

var deployment;

exports['test get available instances'] = function(assert, beforeExit) {
  var n = 0;

  deployment.get_available_instances('test_bundle_name', function(error, instances) {
    n++;

    assert.equal(error, undefined);
    assert.length(instances, 0);
  });

  async.series([
    async.apply(exec, 'mkdir -p .tests/data_root/applications/foo_bar_bundle@1.0.0-0'),
    async.apply(exec, 'mkdir -p .tests/data_root/applications/foo_bar_bundle@1.0.0-1'),
    async.apply(exec, 'mkdir -p .tests/data_root/applications/foo_bar_bundle@1.0.0-2'),
    async.apply(exec, 'mkdir -p .tests/data_root/applications/foo_bar_bundle@1.0.1-0'),
    async.apply(exec, 'mkdir -p .tests/data_root/applications/foo_bar_bundle@1.0.1-1')
  ],

  function(error) {
    assert.equal(error, undefined);

    deployment.get_available_instances('test_bundle_name', function(error, instances) {
      n++;

      assert.equal(error, undefined);
      assert.length(instances, 0);
    });

    deployment.get_available_instances('foo_bar_bundle@1.0.0', function(error, instances) {
      n++;

      assert.equal(error, undefined);
      assert.length(instances, 3);
      assert.deepEqual(instances[0], [ 'foo_bar_bundle@1.0.0', 0 ]);
      assert.deepEqual(instances[1], [ 'foo_bar_bundle@1.0.0', 1 ]);
    });
  });

  beforeExit(function(){
    assert.equal(3, n, 'Callbacks called');
  });
};

exports['test create service'] = function(assert, beforeExit) {
  var n = 0;

  var service_path = '.tests/services/available/test_bundle_name@1.0.0-0';
  deployment.create_service('test_bundle_name@1.0.0-0', '/path/to/instance', 'entry.js', 'nodejs', function(error) {
    n++;

    assert.equal(error, undefined);
    assert.isDefined(fs.statSync(service_path).ino);
    assert.isDefined(fs.statSync(path.join(service_path, 'run')).ino);
  });

  beforeExit(function(){
    assert.equal(1, n, 'Callbacks called');
  });
};

exports.setup = function(done) {
  async.series([
    async.apply(ps.ensure, "config"),
    async.apply(exec, "mkdir -p .tests/services"),
    async.apply(exec, "mkdir -p .tests/services/available"),
    async.apply(exec, "mkdir -p .tests/services/enabled"),
    async.apply(exec, "mkdir -p .tests/data_root/applications"),

    function(callback) {
      deployment = require('deployment');

      callback();
    },
  ],
  done);
};