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
  var ships = {}, internal = {}, hardpoints = {};
  var shipOrder = Object.keys(arr[0]).sort();
  var internalOrder = Object.keys(arr[3]).sort();
  var hpOrder = [
    "Pulse Lasers",
    "Burst Lasers",
    "Beam Lasers",
    "Multi-cannons",
    "Cannons",
    "Fragment Cannons",
    "Rail Guns",
    "Plasma Accelerators",
    "Missile Racks",
    "Torpedo Pylons",
    "Mine Launchers",
    "Mining Lasers",
    "Cargo Scanners",
    "Countermeasures",
    "Frame Shift Wake Scanners",
    "Kill Warrant Scanners",
    "Shield Boosters"
  ];

  for (var i = 0; i < internalOrder.length; i++) {
    internal[internalOrder[i]] = arr[3][internalOrder[i]];
  }

  for (var j = 0; j < hpOrder.length; j++) {
    hardpoints[hpOrder[j]] = arr[2][hpOrder[j]];
  }

  for (var s = 0; s < shipOrder.length; s++) {
    ships[shipOrder[s]] = arr[0][shipOrder[s]];
  }

  try {
    var db = {
      ships: ships,
      components: {
        common: arr[1],
        hardpoints: hardpoints,
        internal: internal,
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

  fs.open('./app/db.json', 'w', function() {
    fs.writeFile('./app/db.json', JSON.stringify(db), function(err) {});
  });
}
