var fs = require('fs');
var UglifyJS = require('uglify-js');
var jsonConcat = require('json-concat');
var async = require('async');
var db_filename = './app/js/db.js';

async.parallel([
  function(cb) { jsonConcat({ dest: null, src: './data/ships' }, done.bind(cb)); },
  function(cb) {
    var common = [
      JSON.parse(fs.readFileSync('./data/components/common/power_plant.json', 'utf8')),
      JSON.parse(fs.readFileSync('./data/components/common/thrusters.json', 'utf8')),
      JSON.parse(fs.readFileSync('./data/components/common/frame_shift_drive.json', 'utf8')),
      JSON.parse(fs.readFileSync('./data/components/common/life_support.json', 'utf8')),
      JSON.parse(fs.readFileSync('./data/components/common/power_distributor.json', 'utf8')),
      JSON.parse(fs.readFileSync('./data/components/common/sensors.json', 'utf8')),
      JSON.parse(fs.readFileSync('./data/components/common/fuel_tank.json', 'utf8'))
    ];
    cb(null, common);
  },
  function(cb) { jsonConcat({ dest: null, src: './data/components/hardpoints' }, done.bind(cb)); },
  function(cb) { jsonConcat({ dest: null, src: './data/components/internal' }, done.bind(cb)); },
  function(cb) { jsonConcat({ dest: null, src: ['./data/components/bulkheads.json'] }, done.bind(cb)); }
  ], writeDB);

function done(err, json) { this(err,json); }

function writeDB(err, arr) {
  try {
    var db = {
      ships: arr[0],
      components: {
        common: arr[1],
        hardpoints: arr[2],
        internal: arr[3],
        bulkheads: arr[4]
      }
    };
  }
  catch (e) {
    console.error(arguments);
    exit(0);
  }

  var ast = UglifyJS.parse('var DB = ' + JSON.stringify(db));
  var code = ast.print_to_string({beautify: true, indent_level: 2});

  fs.open(db_filename, 'w', function() {
    fs.writeFile(db_filename, code, function(err) {});
  });

  if (!fs.existsSync('./build')){
    fs.mkdirSync('./build');
  }

  fs.open('./build/db.json', 'w', function() {
    fs.writeFile('./build/db.json', JSON.stringify(db), function(err) {});
  });
}
