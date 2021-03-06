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

var pluginManager = require('plugins/manager').pluginManager;

function getAvailablePlugins(callback) {
  pluginManager.getAvailablePlugins(callback);
}

function getEnabledPlugins(callback) {
  pluginManager.getEnabledPlugins(callback);
}

function getPluginSettings(pluginName, callback) {
  pluginManager.getPluginSettings(pluginName, callback);
}

function getPluginManifest(pluginName, callback) {
  pluginManager.getPluginManifest(pluginName, callback);
}

exports.getAvailablePlugins = getAvailablePlugins;
exports.getEnabledPlugins = getEnabledPlugins;
exports.getPluginSettings = getPluginSettings;
exports.getPluginManifest = getPluginManifest;
