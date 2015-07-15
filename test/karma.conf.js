module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'fixture'],
    preprocessors: {
      '../build/schemas/**/*.json': ['json_fixtures'],
      'fixtures/**/*.json': ['json_fixtures']
    },
    files: [
      '../build/lib*.js',
      '../node_modules/angular-mocks/angular-mocks.js',
      '../node_modules/jsen/dist/jsen.js',
      '../build/app*.js',
      '../build/schemas/**/*.json',
      'fixtures/**/*.json',
      'tests/**/*.js',
    ],
    jsonFixturesPreprocessor: {
      stripPrefix: '.*(/build/)',
      variableName: '__json__'
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: false
  });
};
