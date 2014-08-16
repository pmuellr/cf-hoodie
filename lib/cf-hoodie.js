// Licensed under the Apache License. See footer for details.

URL  = require("url")
http = require("http")
util = require("util")

cfenv        = require("cfenv")
hoodieServer = require("hoodie-server")
httpProxy    = require("http-proxy")

utils       = require("./utils")
getOpts     = require("./getOpts")
environment = require("./environment")

//------------------------------------------------------------------------------
utils.exports(exports)
utils.exportFunction(main)

//------------------------------------------------------------------------------
function main(args) {
  utils.setProgramName(__filename)

  var optsSpec = {
    verbose:   [ "v", Boolean ],
    help:      [ "h", Boolean ]
  }

  var argsOpts = getOpts.parse(args, optsSpec)
  var args     = argsOpts[0] || []
  var opts     = argsOpts[1] || {}

  var envConfig = environment.getConfig(
    process.platform,
    process.env,
    process.cwd(),
    opts)

  if (!envConfig) {
    return runDeadServer()
  }

  dumpEnvConfig(envConfig, __filename)

  utils.log("starting hoodie servers")
  hoodieServer.init(envConfig, hoodieServerCB)

  if (envConfig.cfIsLocal) return

  var proxyServer = httpProxy.createProxyServer()
  var appEnv      = cfenv.getAppEnv()

  var server = http.createServer(function (request, response) {
    try {
      var host = request.headers["host"]
      handleProxyRequest(proxyServer, envConfig, request, response)
    }
    catch(e) {
      utils.log("error handling proxy request: " + e)
    }
  })

  server.listen(appEnv.port, appEnv.bind)
  utils.log("starting hoodie wrapper server on " + appEnv.url)
}

//------------------------------------------------------------------------------
function handleProxyRequest(proxyServer, envConfig, request, response) {
  var host  = request.headers["host"]
  var www   = "http://localhost:" + envConfig.www_port
  var admin = "http://localhost:" + envConfig.admin_port

  if (host.match(/admin/)) {
    proxyServer.web(request, response, {target: admin})
    return
  }

  proxyServer.web(request, response, {target: www})
}

//------------------------------------------------------------------------------
function dumpEnvConfig(envConfig, label) {
  if (false) return

  var originalEnv = envConfig.hoodie.env

  envConfig.hoodie.env = "{...}"
  console.log(label, "envConfig:", envConfig)
  envConfig.hoodie.env = originalEnv
}

//------------------------------------------------------------------------------
function hoodieServerCB(err) {
  if (err) return utils.logError(err)

  console.log("")
}

//------------------------------------------------------------------------------
function runDeadServer() {
  var appEnv = cfenv.getAppEnv()

  http.createServer(deadServerRequestHandler).listen(appEnv.port, appEnv.bind)
  utils.log("starting dead server at " + appEnv.url)
}

//------------------------------------------------------------------------------
function deadServerRequestHandler(request, response) {
  response.writeHead(500, {"Content-Type": "text/plain"})
  response.end("error, server not operational, check the logs\n")
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
