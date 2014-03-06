// build script from https://raw.github.com/tkellen/requirejs-library-skeleton/master/build.js
// see a complete list of options here:
// https://github.com/jrburke/r.js/blob/master/build/example.build.js
({
  // all modules loaded are relative to this path
  // e.g. require(["grid/core"]) would grab /lib/grid/core.js
  baseUrl: "./lib",

  // specify custom module name paths
  paths: {
    "vendor": "../vendor",
    "globalize": "../vendor/globalize",
    "cultures": "../vendor/cultures",
    "Q": "q"
  },
  shim: {
    "cultures/globalize.culture.en-US": ["globalize"],
    "cultures/globalize.culture.es-US": ["globalize"]//,
//    "Q": { exports: "Q" }
  },

  // target amd loader shim as the main module, path is relative to baseUrl.
  name: "../vendor/almond",

// optimize: "none",
  optimize: "uglify2",
//  preserveLicenseComments: false,

  // files to include along with almond.  only lib/skeleton.js is defined, as
  // it pulls in the rest of the dependencies automatically.
  include: ["yasmf"],
  // code to wrap around the start / end of the resulting build file
  // the global variable used to expose the API is defined here
  wrap: {
    start: "(function(global, define) {\n"+
              // check for amd loader on global namespace
           "  var globalDefine = global.define;\n",

    end:   "  var library = require('yasmf');\n"+
           "  if(typeof module !== 'undefined' && module.exports) {\n"+
                // export library for node
           "    module.exports = library;\n"+
           "  } else if(globalDefine) {\n"+
                // define library for global amd loader that is already present
           "    (function (define) {\n"+
           "      define(function () { return library; });\n"+
           "    }(globalDefine));\n"+
           "  } else {\n"+
                // define library on global namespace for inline script loading
           "    global['_y'] = library;\n"+
           "  }\n"+
           "}(this));\n"
  },

  // build file destination, relative to the build file itself
  out: "./dist/yasmf.js"
})