
angular.module('app').provider('localeFormat', function localeFormatProvider() {
  var formats = {
    en: {
      decimal: '.',
      thousands: ',',
      grouping: [3],
      currency: ['$', ''],
      dateTime: '%a %b %e %X %Y',
      date: '%m/%d/%Y',
      time: '%H:%M:%S',
      periods: ['AM', 'PM'],
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  };

  function LocaleFormat(formatMap) {
    this.formatMap = formatMap;

    this.get = function(lang) {
      return this.formatMap[lang] ? this.formatMap[lang] : this.formatMap.en;
    };
  }

  this.addFormat = function(langCode, formatDetails) {
    formats[langCode] = formatDetails;
  };

  this.$get = [function() {
    return new LocaleFormat(formats);
  }];

});
