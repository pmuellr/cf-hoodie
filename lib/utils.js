/* Licensed under the Apache License. See footer for details. */

path = require("path")

pkg = require("../package.json")

VERBOSE = false

utils = exports

utils.PROGRAM     = pkg.name
utils.PACKAGE     = pkg.name
utils.VERSION     = pkg.version
utils.DESCRIPTION = pkg.description
utils.HOMEPAGE    = pkg.homepage

//------------------------------------------------------------------------------
EXPORTS = null
utils.exports = function exports(exps) {
  EXPORTS = exps
}

//------------------------------------------------------------------------------
utils.exportFunction = function exportFunction(fn) {
  var name = fn.name
  if (name == null) {
    throw new Error("trying to export unnamed function: " + fn)
  }

  utils.exportValue(name, fn)
}

//------------------------------------------------------------------------------
utils.exportValue = function exportFunction(name, value) {
  EXPORTS[name] = value
}

//------------------------------------------------------------------------------
utils.log = function log(message) {
  console.log(utils.PROGRAM + ": " + message)
}

//------------------------------------------------------------------------------
utils.logError = function logError(message) {
  utils.log(message)
  process.exit(1)
}

//------------------------------------------------------------------------------
utils.vlog = function vlog(message) {
  if (!VERBOSE) return

  utils.log(message)
}

//------------------------------------------------------------------------------
utils.verbose = function verbose(value) {
  if (arguments.length == 0) return VERBOSE

  VERBOSE = !!value
  return VERBOSE
}

//------------------------------------------------------------------------------
utils.setProgramName = function setProgramName(fileName) {
  fileName = path.basename(fileName)
  fileName = fileName.split(".")
  fileName.pop()
  fileName = fileName.join(".")

  utils.PROGRAM = fileName
}

//------------------------------------------------------------------------------
utils.JS = function JS(object) {
  return JSON.stringify(object)
}

//------------------------------------------------------------------------------
utils.JL = function JL(object) {
  return JSON.stringify(object, null, 4)
}

/*
#-------------------------------------------------------------------------------
# Copyright IBM Corp. 2014
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
//------------------------------------------------------------------------------
*/
