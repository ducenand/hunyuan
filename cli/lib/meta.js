var async = require('async');
var Metalsmith = require('metalsmith');
var prompt = require('cli-prompt');
var render = require('consolidate').handlebars.render;
debugger
/**
 * Build.
 */

var metalsmith = Metalsmith(__dirname)
.use(ask)
.use(template)
.build(function(err,files){
  if (err) throw err;
  console.log(files)
});

/**
 * Prompt plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function ask(files, metalsmith, done){
  var prompts = ['name', 'repository', 'description', 'license'];
  var metadata = metalsmith.metadata();
  async.eachSeries(prompts, run, done);

  function run(key, done){
    prompt('  ' + key + ': ', function(val){
      metadata[key] = val;
      done();
    });
  }
}

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function template(files, metalsmith, done){
  var keys = Object.keys(files);
  console.log(keys)
  var metadata = metalsmith.metadata();

  async.each(keys, run, done);

  function run(file, done){
    var str = files[file].contents.toString();
    console.log(metadata)
    render(str, metadata, function(err, res){
      if (err) return done(err);
      files[file].contents = new Buffer(res);
      done();
    });
  }
}