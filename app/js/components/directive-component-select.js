angular.module('app').directive('componentSelect', ['$translate', function($translate) {

  // Generting the HTML in this manner is MUCH faster than using an angular template.

  function appendGroup(list, opts, cid, mass, checkWarning) {
    var prevClass = null, prevRating = null;
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i];
      var id = o.id || (o.class + o.rating);  // Standard components' ID is their class and rating

      if (i > 0 && opts.length > 3 && o.class != prevClass && (o.rating != prevRating || o.mode) && o.grp != 'pa') {
        list.push('<br/>');
      }

      list.push('<li class="', o.name ? 'lc' : 'c');

      if (cid == id) {
        list.push(' active');
      }

      if (checkWarning && checkWarning(opts[i])) {
        list.push(' warning');
      }

      list.push(((o.maxmass && (mass + (o.mass ? o.mass : 0)) > o.maxmass) ? ' disabled"' : '" cpid="' + id + '"'), '>');

      if (o.mode) {
        list.push('<svg class="icon lg"><use xlink:href="#mount-', o.mode, '"></use></svg> ');
      }

      list.push('<span>', o.class, o.rating);

      if (o.missile) {
        list.push('/' + o.missile);
      }


      if (o.name) {
        list.push(' ' + $translate.instant(o.name));
      }

      list.push('</span></li>');
      prevClass = o.class;
      prevRating = o.rating;
    }
  }

  return {
    restrict: 'A',
    scope: {
      opts: '=',    // Component Options object
      groups: '=',  // Groups of Component Options
      mass: '=',    // Current ship mass
      s: '=',       // Current Slot
      warning: '='  // Check warning function
    },
    link: function(scope, element) {
      var list = [];
      var cid = scope.s.id; // Slot's current component id
      var component = scope.s.c;  // Slot's Current Component (may be null/undefined)
      var opts = scope.opts;
      var groups = scope.groups;
      var mass = (scope.mass ? scope.mass : 0) - (component && component.mass ? component.mass : 0); // Mass minus the currently selected component

      if (groups) {
        // At present time slots with grouped options (Hardpoints and Internal) can be empty
        list.push('<div class="empty-c upp" cpid="empty">', $translate.instant('empty'), '</div>');
        for (var g in groups) {
          var grp = groups[g];
          var grpCode = grp[Object.keys(grp)[0]].grp; // Nasty operation to get the grp property of the first/any single component
          list.push('<div id="', grpCode, '" class="select-group cap">', $translate.instant(g), '</div><ul>');
          appendGroup(list, grp, cid, mass, scope.warning);
          list.push('</ul>');
        }
      } else {
        list.push('<ul>');
        appendGroup(list, opts, cid, mass, scope.warning);
        list.push('</ul>');
      }

      element.html(list.join(''));
      // If groups are present and a component is already selectd
      if (groups && component && component.grp) {
          var groupElement = angular.element(document.getElementById(component.grp));
          var parentElem = element[0].parentElement;
          parentElem.scrollTop = groupElement[0].offsetTop; // Scroll to currently selected group
      }
    }
  };
}]);
