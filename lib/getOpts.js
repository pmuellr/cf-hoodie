// Licensed under the Apache License. See footer for details.

fs   = require("fs")
path = require("path")

_    = require("underscore")
nopt = require("nopt")

utils = require("./utils")

utils.exports(exports)
utils.exportFunction(parse)
utils.exportFunction(printHelp)

//------------------------------------------------------------------------------
function parse(args, optsSpec) {
  if (args[0] == "?") return printHelp()

  optsSpec = optsSpec || {}
  optsSpec.verbose = [ "v", Boolean ],
  optsSpec.help    = [ "h", Boolean ]

  var longOpts   = {}
  var shortOpts  = {}
  var defValues  = {}

  for (var name in optsSpec) {
    var opt = optsSpec[name]

    var shortName = opt[0]
    var type      = opt[1]
    var defValue  = opt[2]

    if (type == Boolean) defValue = false

    shortOpts[shortName] = "--#{name}"
    longOpts[name]       = type

    if (defValue != null) {
      defValues[name] = defValue
    }
  }

  var parsed = nopt(longOpts, shortOpts, args, 0)

  if (parsed.help) printHelp()

  var opts

  args = parsed.argv.remain
  opts = _.pick(parsed, _.keys(longOpts))
  opts = _.defaults(opts, defValues)

  utils.verbose(opts.verbose)

  return [args, opts]
}

//------------------------------------------------------------------------------
function printHelp() {
  var helpFile = path.join(__dirname, utils.PROGRAM + "-help.txt" )
  var content  = fs.readFileSync(helpFile, "utf8")

  content = content.replace(/%PROGRAM%/g,     utils.PROGRAM    )
  content = content.replace(/%PACKAGE%/g,     utils.PACKAGE    )
  content = content.replace(/%VERSION%/g,     utils.VERSION    )
  content = content.replace(/%DESCRIPTION%/g, utils.DESCRIPTION)
  content = content.replace(/%HOMEPAGE%/g,    utils.HOMEPAGE   )

  console.log(content)
  process.exit(1)
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
