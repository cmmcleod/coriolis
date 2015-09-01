angular.module('app').config(['$translateProvider', function($translateProvider) {
  $translateProvider
    .useSanitizeValueStrategy('escapeParameters')
    .useStorage('Persist')
    .fallbackLanguage('en')   // Use English as default/fallback language
    .registerAvailableLanguageKeys(['en', 'de', 'fr', 'ru'], {  // TODO: add 'es' to the array when ready
      'en*': 'en',
      'de*': 'de',
      //'es*': 'es',
      'fr*': 'fr',
      'ru*': 'ru'
    })
    .determinePreferredLanguage();
}])
.value('Languages', {
  en: 'English',
  de: 'Deutsh',
  //es: 'Español',
  fr: 'Français',
  ru: 'ру́сский язы́к'
});
