// Build / Built-in dependencies
var gulp  = require('gulp'),
    exec  = require('child_process').exec,
    pkg   = require('./package.json');

// Package.json / Gulp Dependencies
var appCache        = require("gulp-manifest"),
    concat          = require('gulp-concat'),
    del             = require('del'),
    eslint          = require('gulp-eslint');
    gutil           = require('gulp-util'),
    htmlmin         = require('gulp-htmlmin'),
    jsonlint        = require("gulp-jsonlint"),
    karma           = require('karma').server,
    less            = require('gulp-less'),
    mainBowerFiles  = require('main-bower-files'),
    minifyCSS       = require('gulp-minify-css'),
    revAll          = require('gulp-rev-all'),
    runSequence     = require('run-sequence'),
    sourcemaps      = require('gulp-sourcemaps'),
    svgstore        = require('gulp-svgstore'),
    svgmin          = require('gulp-svgmin'),
    template        = require('gulp-template'),
    templateCache   = require('gulp-angular-templatecache'),
    uglify          = require('gulp-uglify');

var cdnHostStr = '';

gulp.task('less', function() {
  return gulp.src('app/less/app.less')
    .pipe(less({paths: ['less/app.less']}).on('error',function(e){
      console.log('File:', e.fileName);
      console.log('Line:', e.lineNumber);
      console.log('Message:', e.message);
      this.emit('end');
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('build'));
});

gulp.task('js-lint', function() {
  return gulp.src(['app/js/**/*.js', '!app/js/template_cache.js', '!app/js/db.js'])
    .pipe(eslint({
      globals: { angular:1, DB:1, d3:1, ga:1, GAPI_KEY:1, LZString: 1 },
      rules: {
        quotes: [2, 'single'],
        strict: 'global',
        eqeqeq: 'smart',
        'space-after-keywords': [2, 'always'],
        'no-use-before-define': 'no-func',
        'space-before-function-paren': [2, 'never'],
        'space-before-blocks': [2, 'always'],
        'object-curly-spacing': [2, "always"],
        'brace-style': [2, '1tbs', { allowSingleLine: true }]
      },
      envs: ['browser']
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('json-lint', function() {
  return gulp.src(['data/**/*.json' , 'app/schemas/**/*.json'])
    .pipe(jsonlint())
    .pipe(jsonlint.reporter())
    .pipe(jsonlint.failAfterError());
});

gulp.task('bower', function(){
  return gulp.src(mainBowerFiles())
    .pipe(uglify({mangle: false, compress: false}).on('error',function(e){
      console.log('Bower File:', e.fileName);
      console.log('Line:', e.lineNumber);
      console.log('Message:', e.message);
    }))
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('html2js', function() {
  return gulp.src('app/views/**/*.html')
    .pipe(htmlmin({
      'collapseBooleanAttributes': true,
      'collapseWhitespace': true,
      'removeAttributeQuotes': true,
      'removeComments': true,
      'removeEmptyAttributes': true,
      'removeRedundantAttributes': true,
      'removeScriptTypeAttributes': true,
      'removeStyleLinkTypeAttributes': true
    }).on('error',function(e){
      console.log('File:', e.fileName);
      console.log('Message:',e.message);
    }))
    .pipe(templateCache({
      'module': 'app.templates',
      'standalone': true,
      'root': 'views',
      'filename': 'template_cache.js'
    }))
    .pipe(gulp.dest('app/js'))
});

gulp.task('jsonToDB', function(cb) {
  exec('node scripts/json-to-db.js', cb);
});

gulp.task('js', function() {
  return gulp.src([
      'app/js/db.js',
      'app/js/**/module-*.js',
      'app/js/template_cache.js',
      'app/js/app.js',
      'app/js/**/*.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(uglify({mangle: false}).on('error',function(e){
      console.log('File:', e.fileName);
      console.log('Line:', e.lineNumber);
      console.log('Message:', e.message);
      this.emit('end');
    }))
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('copy', function() {
  return gulp.src(['app/images/**','app/fonts/**','app/db.json', 'app/schemas/**'], {base: 'app/'})
    .pipe(gulp.dest('build'));
});

gulp.task('generateIndexHTML', function(done) {
  // Generate minified inline svg of all icons for svg spriting
  gulp.src('app/icons/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(gutil.buffer(function(err, files) {
      var svgIconsContent = files[0].contents.toString();
      gulp.src('app/index.html')
        .pipe(template({
          version: pkg.version,
          date : new Date().toISOString().slice(0, 10),
          uaTracking: process.env.CORIOLIS_UA_TRACKING || false,
          svgContent: svgIconsContent,
          gapiKey: process.env.CORIOLIS_GAPI_KEY
        }))
        .pipe(htmlmin({
          'collapseBooleanAttributes': true,
          'collapseWhitespace': true,
          'removeAttributeQuotes': true,
          'removeComments': true,
          'removeEmptyAttributes': true,
          'removeRedundantAttributes': true,
          'removeScriptTypeAttributes': true,
          'removeStyleLinkTypeAttributes': true
        }).on('error',function(e){
          console.log('File:', e.fileName);
          console.log('Message:',e.message);
        }))
        .pipe(gulp.dest('build'));
        done();
      }));
});

gulp.task('serve', function(cb) {
  exec('nginx -p $(pwd) -c nginx.conf', function (err, stdout, stderr) {
    if (stderr) {
      console.warn(stderr);
      console.warn('Is NGINX already running?\n');
    }
    cb();
  });
});

// Windows command to launch nginx serv
gulp.task('serve-win', function(cb) {
  exec('nginx -p %cd% -c nginx.conf', function (err, stdout, stderr) {
    if (stderr) {
      console.warn(stderr);
      console.warn('Is NGINX already running?\n');
    }
    cb();
  });
});

gulp.task('serve-stop', function(cb) {
  exec('kill -QUIT $(cat nginx.pid)', function (err, stdout, stderr) {
    if (stderr) console.log(stderr); else cb(err);
  });
});

gulp.task('watch', function() {
  gulp.watch(['app/index.html','app/icons/*.svg'], ['generateIndexHTML']);
  gulp.watch(['app/images/**','app/fonts/**', 'app/db.json', 'app/schemas/**'], ['copy']);
  gulp.watch('app/less/*.less', ['less']);
  gulp.watch('app/views/**/*', ['html2js']);
  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch('data/**/*.json', ['jsonToDB']);
  gulp.watch(['build/**', '!**/*.appcache'], ['appcache']);
});

gulp.task('cache-bust', function(done) {
  var rev_all = new revAll({ prefix: cdnHostStr, dontRenameFile: ['.html','.json'] });
  var stream = gulp.src('build/**')
    .pipe(rev_all.revision())
    .pipe(gulp.dest('build'))
    .pipe(rev_all.manifestFile())
    .pipe(gulp.dest('build'));

  stream.on('end', function() {
    var manifest = require('./build/rev-manifest.json');
    var arr = [];
    for(var origFileName in manifest) {
      if(origFileName != manifest[origFileName]) { // For all files busted/renamed
        arr.push('./build/' + origFileName);       // Add the original filename to the list
      }
    }
    del(arr, done);     // Delete all originals files the were not busted/renamed
  });
  stream.on('error', done);
});

gulp.task('appcache', function(done) {
  // Since using a CDN manually build file list rather than using appCache mechanisms
  gulp.src(['build/**', '!build/index.html', '!**/*.json', '!**/logo/*', '!**/*.map','!**/*.appcache'])
    .pipe(gutil.buffer(function(err, stream) {
      var files = [];
      for (var i = 0; i < stream.length; i++) {
        if (!stream[i].isNull()) {
          files.push(cdnHostStr + '/' + stream[i].relative);
        }
      }

      gulp.src([])
        .pipe(appCache({
          preferOnline: true,
          cache: files,
          filename: 'coriolis.appcache',
          timestamp: true
         }))
        .pipe(gulp.dest('build'))
        .on('end', done);
    }));
});

gulp.task('upload', function(done) {
  exec([
      "rsync -e 'ssh -i ", process.env.CORIOLIS_PEM, "' -a --delete build/ ", process.env.CORIOLIS_USER, "@", process.env.CORIOLIS_HOST, ":~/www"
    ].join(''),
    done
  );
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, function(exitStatus) {
      done(exitStatus ? new gutil.PluginError('karma', { message: 'Unit tests failed!' }) : undefined);
  });
});

gulp.task('lint', ['js-lint', 'json-lint']);

gulp.task('clean', function (done) { del(['build'], done); });

gulp.task('build', function (done) { runSequence('clean', ['html2js','jsonToDB'], ['generateIndexHTML','bower','js','less','copy'], done); });
gulp.task('build-cache', function (done) { runSequence('build', 'appcache', done); });
gulp.task('build-prod', function (done) { runSequence('build', 'cache-bust', 'appcache', done); });

gulp.task('dev', function (done) { runSequence('build-cache', 'serve','watch', done); });

gulp.task('deploy', function (done) {
  cdnHostStr = '//cdn.' + process.env.CORIOLIS_HOST;
  runSequence('build-prod', 'upload', done);
});

gulp.task('default', ['dev']);

