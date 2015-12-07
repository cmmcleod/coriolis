angular.module('app').config(['$translateProvider', function($translateProvider) {
  $translateProvider
    .useSanitizeValueStrategy('escapeParameters')
    .useStorage('Persist')
    .fallbackLanguage('en')   // Use English as default/fallback language
    .registerAvailableLanguageKeys(['en', 'de', 'es', 'fr', 'it', 'ru'], {
      'en*': 'en',
      'de*': 'de',
      'es*': 'es',
      'fr*': 'fr',
      'it*': 'it',
      'ru*': 'ru'
    })
    .determinePreferredLanguage();
}])
.value('Languages', {
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
  fr: 'Français',
  ru: 'ру́сский'
});
