var gulp            = require('gulp'),
    less            = require('gulp-less'),
    jshint          = require('gulp-jshint'),
    minifyCSS       = require('gulp-minify-css'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglify'),
    sourcemaps      = require('gulp-sourcemaps'),
    templateCache   = require('gulp-angular-templatecache'),
    htmlmin         = require('gulp-htmlmin'),
    template        = require('gulp-template'),
    mainBowerFiles  = require('main-bower-files'),
    del             = require('del'),
    runSequence     = require('run-sequence'),
    exec            = require('child_process').exec,
    RevAll          = require('gulp-rev-all'),
    ftp             = require( 'vinyl-ftp' ),
    gutil           = require( 'gulp-util' ),
    pkg             = require('./package.json');

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

gulp.task('lint', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(jshint({
      undef: true,
      unused: true,
      curly: true,
      predef: [ "angular",'DB','d3' ]
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('bower', function(){
  return gulp.src(mainBowerFiles())
    .pipe(uglify({mangle: false}).on('error',function(e){
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
  return gulp.src(['app/images/**','app/fonts/**'], {base: 'app/'})
    .pipe(gulp.dest('build'));
});

gulp.task('generateIndexHTML', function() {
  return gulp.src('app/index.html')
    .pipe(template({
      version: pkg.version,
      date : (new Date()).toLocaleDateString(),
      uaTracking: process.env.CORIOLIS_UA_TRACKING
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

gulp.task('serve-stop', function(cb) {
  exec('kill -QUIT $(cat nginx.pid)', function (err, stdout, stderr) {
    if (stderr) console.log(stderr); else cb(err);
  });
});

gulp.task('watch', function() {
  gulp.watch('app/index.html', ['generateIndexHTML']);
  gulp.watch(['app/images/**','app/fonts/**'], ['copy']);
  gulp.watch('app/less/*.less', ['less']);
  gulp.watch('app/views/**/*', ['html2js']);
  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch('data/**/*.json', ['jsonToDB']);
});

gulp.task('cache-bust', function(done) {
  var revAll = new RevAll({ dontRenameFile: ['.html','db.json'] });
  var stream = gulp.src('build/**')
    .pipe(revAll.revision())
    .pipe(gulp.dest('build'))
    .pipe(revAll.manifestFile())
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

gulp.task('upload', function() {
  var conn = ftp.create({
    host:     'ftp.coriolis.io',
    user:     process.env.CORIOLIS_FTP_USER,
    password: process.env.CORIOLIS_FTP_PASS,
    parallel: 5,
    log:      gutil.log
  });

  return gulp.src(['build/**'], { base: 'build', buffer: true })
    .pipe(conn.dest('/'));

});

gulp.task('clean', function (done) { del(['build'], done); });
gulp.task('build', function (done) { runSequence('clean', ['html2js','jsonToDB'], ['generateIndexHTML','bower','js','less','copy'], done); });
gulp.task('deploy', function (done) { runSequence('build','cache-bust', 'upload', done); });
gulp.task('dev', function (done) { runSequence('build', 'serve','watch', done); });
gulp.task('default', ['dev']);

