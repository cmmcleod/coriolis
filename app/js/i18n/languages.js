angular.module('app').config(['$translateProvider', function($translateProvider) {
  $translateProvider
    .useSanitizeValueStrategy('escapeParameters')
    .useStorage('Persist')
    .fallbackLanguage('en')   // Use English as default/fallback language
    .registerAvailableLanguageKeys(['en', 'de', 'it', 'fr', 'ru'], {  // TODO: add 'es' to the array when ready
      'en*': 'en',
      'de*': 'de',
      'it*': 'it',
      //'es*': 'es',
      'fr*': 'fr',
      'ru*': 'ru'
    })
    .determinePreferredLanguage();
}])
.value('Languages', {
  en: 'English',
  de: 'Deutsh',
  it: 'Italiano',
  //es: 'Español',
  fr: 'Français',
  ru: 'ру́сский'
});
