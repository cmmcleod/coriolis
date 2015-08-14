angular.module('app').directive('loader', function() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.addClass('loader');
      element.html('<svg viewbox="0 0 40 40" width="100%" height="100%"><path d="m5,8l5,8l5,-8z" class="l1 d1" /><path d="m5,8l5,-8l5,8z" class="l1 d2" /><path d="m10,0l5,8l5,-8z" class="l1 d3" /><path d="m15,8l5,-8l5,8z" class="l1 d4" /><path d="m20,0l5,8l5,-8z" class="l1 d5" /><path d="m25,8l5,-8l5,8z" class="l1 d6" /><path d="m25,8l5,8l5,-8z" class="l1 d7" /><path d="m30,16l5,-8l5,8z" class="l1 d8" /><path d="m30,16l5,8l5,-8z" class="l1 d9" /><path d="m25,24l5,-8l5,8z" class="l1 d10" /><path d="m25,24l5,8l5,-8z" class="l1 d11" /><path d="m20,32l5,-8l5,8z" class="l1 d13" /><path d="m15,24l5,8l5,-8z" class="l1 d14" /><path d="m10,32l5,-8l5,8z" class="l1 d15" /><path d="m5,24l5,8l5,-8z" class="l1 d16" /><path d="m5,24l5,-8l5,8z" class="l1 d17" /><path d="m0,16l5,8l5,-8z" class="l1 d18" /><path d="m0,16l5,-8l5,8z" class="l1 d20" /><path d="m10,16l5,-8l5,8z" class="l2 d0" /><path d="m15,8l5,8l5,-8z" class="l2 d3" /><path d="m20,16l5,-8l5,8z" class="l2 d6" /><path d="m20,16l5,8l5,-8z" class="l2 d9" /><path d="m15,24l5,-8l5,8z" class="l2 d12" /><path d="m10,16l5,8l5,-8z" class="l2 d15" /></svg>');
    }
 };
});
