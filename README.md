cf-hoodie - Cloud Foundry support hood.ie
================================================================================

package to make it easy to run <http://hood.ie/> on Cloud Foundry



quick start - run on Bluemix
================================================================================

* install hood.ie (you may need/want a `sudo` in front of this)

  `$ npm install -g hoodie-cli`

* create a new hoodie app

  `$ hoodie new my-app-name`

* cd into your new hoodie app's directory

  `$ cd my-app-name`

* install this package

  `$ npm install cf-hoodie --save`

* create a CouchDB service named `hoodie-data`; note that you can't use
  Cloudant since hood.ie requires CouchDB >= 1.2.
  [Iris Couch](https://www.iriscouch.com/) works fine.  Provide the
  account URL including the userid/password in the form
  `https://userid:password@hostname:port`

  `$ cf create-user-provided-service hoodie-data -p url`

* create a user-provided service named `hoodie-admin`

  `$ cf create-user-provided-service hoodie-admin -p userid,password`

* create a manifest.yml file with the following contents; the value for the
  `host` property needs to be unique across the `mybluemix.net` domain.

      ---
      applications:
      - name: tmp-app
        host: tmp-app-pjm
        memory: 512M
        command: node node_modules/.bin/cf-hoodie start
        services:
        - hoodie-data
        - hoodie-admin

* push the app

  `$ cf push`

* associate an admin route to the app

  `$ cf map-route tmp-app mybluemix.net -n tmp-app-pjm-admin`

* visit the hoodie site at <http://tmp-app-pjm.mybluxmix.net> and the
  admin site at <http://tmp-app-pjm-admin.mybluxmix.net>




cf-hoodie program
================================================================================

The `cf-hoodie` program is a script installed with the same-named package, so
will be available as the `node_modules\.bin\cf-hoodie` script.  `cf-hoodie`
is a front-end for the `hoodie` program, but changes the semantics of the
`start` command (which takes no parameters).





cf-hoodie API
================================================================================




hacking
================================================================================

If you want to modify the source to play with it, you'll also want to have the
`jbuild` program installed.

To install `jbuild` on Windows, use the command

    npm -g install jbuild

To install `jbuild` on Mac or Linux, use the command

    sudo npm -g install jbuild

The `jbuild` command runs tasks defined in the `jbuild.coffee` file.  The
task you will most likely use is `watch`, which you can run with the
command:

    jbuild watch

When you run this command, the application will be built from source, the server
started, and tests run.  When you subsequently edit and then save one of the
source files, the application will be re-built, the server re-started, and the
tests re-run.  For ever.  Use Ctrl-C to exit the `jbuild watch` loop.

You can run those build, server, and test tasks separately.  Run `jbuild`
with no arguments to see what tasks are available, along with a short
description of them.



license
================================================================================

Apache License, Version 2.0

<http://www.apache.org/licenses/LICENSE-2.0.html>
