// Licensed under the Apache License. See footer for details.

// version of hoodie-server/lib/core/environment.js, for Cloud Foundry

URL  = require("url")
path = require("path")

ports = require("ports")
cfenv = require("cfenv")

pkg   = require(path.join(process.cwd(), "package.json"))
utils = require("./utils")

//------------------------------------------------------------------------------
utils.exports(exports)
utils.exportFunction(getConfig)

//------------------------------------------------------------------------------
function logError(message) {
  utils.log("error: " + message)
  return
}

//------------------------------------------------------------------------------
function getConfig(platform, env, cwd, opts) {
  var currentDir   = process.cwd()
  var appEnv       = cfenv.getAppEnv()
  var wwwPort      = ports.getPort(appEnv.name + "-www")
  var adminPort    = ports.getPort(appEnv.name + "-admin")
  var couchPort    = ports.getPort(appEnv.name + "-couch")
  var proxyPort    = ports.getPort(appEnv.name + "-proxy")
  var couchService = appEnv.getService(/.*hoodie-data.*/)
  var adminService = appEnv.getService(/.*hoodie-admin.*/)
  var isLocal      = appEnv.isLocal
  var couchURL
  var couchURLparts
  var couchConfig
  var adminPassword
  var result

  // running on cloud foundry
  if (!isLocal) {
    if (!couchService)             return logError("service with name matching /.*hoodie-data.*/ not found")
    if (!couchService.credentials) return logError("service named `" + couchService.name + "` has no credentials")

    couchURL      = couchService.credentials.url || couchService.credentials.uri
    couchURLparts = URL.parse(couchURL)

    couchConfig = {
      url:  couchURL,
      host: couchURLparts.hostname,
      port: couchURLparts.port
    }

    if (!couchURL) return logError("service named `" + couchService.name + "` has no credentials.[url|uri]")

    if (!adminService)                      return logError("service with name matching /.*hoodie-admin.*/ not found")
    if (!adminService.credentials)          return logError("service named `" + adminService.name + "` has no credentials")
    if (!adminService.credentials.password) return logError("service named `" + adminService.name + "` has no credentials.password")

    adminPassword = adminService.credentials.password
  }

  // not running on cloud foundry
  else {
    couchURL      = "http://localhost:" + couchPort
    couchURLparts = URL.parse(couchURL)

    couchConfig = {
      run:  true,
      url:  couchURL,
      host: couchURLparts.hostname,
      port: couchURLparts.port
    }
  }

  result = {
    default_file:   path.join(currentDir, "www", "index.html"),
    project_dir:    currentDir,
    www_root:       path.join(currentDir, "www"),
    admin_root:     path.join(currentDir, "node_modules","hoodie-server","node_modules","hoodie-admin-dashboard","www"),
    host:           appEnv.bind,
    app:            JSON.parse(JSON.stringify(pkg)),
    domain:         "wat",
    verbose:        opts.verbose,
    local_tld:      undefined,
    platform:       process.platform,
    boring:         false,
    id:             pkg.name,
    hoodie: {
      env:          env,
      app_path:     currentDir,
      data_path:    path.join(currentDir, "data")
    },
    open_browser:   false,
    www_port:       wwwPort,
    admin_port:     adminPort,
    couch:          couchConfig,
    admin_password: adminPassword
  }

  result.cfIsLocal   = isLocal
  result.cfProxyPort = proxyPort

  // not running on cloud foundry
  if (isLocal) {
    result.cfWwwLink   = "http://"  + result.host + ":" + result.www_port
    result.cfAdminLink = "http://"  + result.host + ":" + result.admin_port
  }

  // not running on cloud foundry
  else {
    result.cfWwwLink   = appEnv.urls.filter(function(url){
      return !URL.parse(url).hostname.match(/admin/)
    })[0]

    result.cfAdminLink = appEnv.urls.filter(function(url){
      return URL.parse(url).hostname.match(/admin/)
    })[0]

    if (!result.cfWwwLink)   return logError("unable to determine www link")
    if (!result.cfAdminLink) return logError("unable to determine admin link")
  }

  result.www_link   = function () { return result.cfWwwLink }
  result.admin_link = function () { return result.cfAdminLink }

  return result
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
#-------------------------------------------------------------------------------
*/
