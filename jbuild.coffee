# Licensed under the Apache License. See footer for details.

#-------------------------------------------------------------------------------
# use this file with jbuild: https://www.npmjs.org/package/jbuild
# install jbuild with:
#    linux/mac: sudo npm -g install jbuild
#    windows:        npm -g install jbuild
#-------------------------------------------------------------------------------

path = require "path"

tmpAppDir   = "tmp-app"
cfHoodieApp = path.join("node_modules", ".bin", "cf-hoodie")
pidFile     = path.join("tmp", "cf-hoodie.pid")

#-------------------------------------------------------------------------------
tasks = defineTasks exports,
  watch: "watch for source file changes, then run build and server"
  serve: "run the test server stand-alone"
  build: "build the server"
  test:  "run tests"

WatchSpec = "lib lib/**/* tmp-app-static tmp-app-static/**/*"

#-------------------------------------------------------------------------------
mkdir "-p", "tmp"

#-------------------------------------------------------------------------------
tasks.build = ->
  log "running build"

  unless test "-d", "node_modules"
    log "build: installing node_modules"
    exec "npm install"

  unless test "-d", tmpAppDir
    log "build: creating hoodie app in " + tmpAppDir
    exec "hoodie new " + tmpAppDir

  try
    log "build: installing cf-hoodie in in " + tmpAppDir
    cd tmpAppDir
    exec "npm install .. --save"
  finally
    cd ".."

  cp "-f", "tmp-app-static/*",  tmpAppDir
  cp "-f", "tmp-app-static/.*", tmpAppDir

#-------------------------------------------------------------------------------
tasks.watch = ->
  watchIter()

  watch
    files: WatchSpec.split " "
    run:   watchIter

  watchFiles "jbuild.coffee" :->
    log "jbuild file changed; exiting"
    process.exit 0

#-------------------------------------------------------------------------------
tasks.serve = ->
  tasks.build() unless test "-d", tmpAppDir
  tasks.build() unless test "-f", path.join(tmpAppDir, cfHoodieApp)

  log "starting hoodie"

  command = [cfHoodieApp, "--verbose", "start"]
  env     = JSON.parse(JSON.stringify(process.env))
  options = {
    env:    env,
    cwd:    tmpAppDir
  }

  server.start pidFile, "node", command, options

#-------------------------------------------------------------------------------
watchIter = ->
  tasks.build()
  tasks.serve()

#-------------------------------------------------------------------------------
cleanDir = (dir) ->
  mkdir "-p", dir
  rm "-rf", "#{dir}/*"

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
