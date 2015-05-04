angular.module('app').directive('componentSelect', [ function() {
  return {
    restrict: 'A',
    scope:{
      opts: '=',  // Component Options object
      mass: '='   // Current ship mass
    },
    link: function(scope, element) {
      var list = [], o, id;
      var opts = scope.opts;
      var mass = scope.mass || 0;
      // Generting the HTML in this manner is MUCH faster than using an angular template.
      for (id in opts) {
        o = opts[id];
        list.push('<li class="');
        list.push(o.name? 'lc' : 'c');
        if (o.maxmass && mass > o.maxmass) { // Omit id if mass is exceeded making it 'disabled'
          list.push(' disabled"');
        } else {
          list.push('" id="');
        }
        list.push(id);
        list.push('">');
        list.push(o.class);
        list.push(o.rating);
        if(o.mode) {
          list.push('/' + o.mode);
          if(o.missile) {
            list.push(o.missile);
          }
        }
        if(o.name) {
          list.push(' ' + o.name);
        }
        list.push('</li>');
      }

      element.html('<ul>' + list.join('') + '</ul>');
    }
  };
}]);