angular.module('app').directive('componentSelect', function() {

  // Generting the HTML in this manner is MUCH faster than using an angular template.

  function appendGroup(list, opts, cid, mass, wrap) {
    var prevClass = null, prevRating = null;
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i];
      var id = o.id || (o.class + o.rating);  // Common components' ID is their class and rating
      list.push('<li class="', o.name? 'lc' : 'c');
      if(wrap && o.class != prevClass) list.push(' cl');
      if (cid == o.id) list.push(' active');
      list.push((o.maxmass && mass > o.maxmass)? ' disabled"' : '" cpid="', id, '">', o.class, o.rating);
      if(o.mode) {
        list.push('/' + o.mode);
        if(o.missile) {
          list.push(o.missile);
        }
      }
      if(o.name) list.push(' ' + o.name);
      list.push('</li>');
      prevClass = o.class;
      prevRating= o.rating;
    }
  }

  return {
    restrict: 'A',
    scope:{
      opts: '=',    // Component Options object
      groups: '=',  // Groups of Component Options
      mass: '=',    // Current ship unladen mass
      s: '=',       // Current Slot
      wrap: '@'     // Wrap on class
    },
    link: function(scope, element) {
      var list = [];
      var cid = scope.s.id; // Slot's current component id
      var component = scope.s.c;  // Slot's Current Component (may be null/undefined)
      var opts = scope.opts;
      var groups = scope.groups;
      var mass = scope.mass || 0;
      var wrap = scope.wrap;

      if(groups) {
        // At present time slots with grouped options (Hardpoints and Internal) can be empty
        list.push('<div class="empty-c" cpid="empty">EMPTY</div>');
        for (g in groups) {
          var grp = groups[g];
          var grpCode = grp[Object.keys(grp)[0]].grp; // Nasty operation to get the grp property of the first/any single component
          list.push('<div id="', grpCode ,'" class="select-group">', g, '</div><ul>');
          appendGroup(list, grp, cid, mass, wrap);
          list.push('</ul>');
        }
      } else {
        list.push('<ul>');
        appendGroup(list, opts, cid, mass, wrap);
        list.push('</ul>');
      }

      element.html(list.join(''));
      // If groups are present and a component is already selectd
      if (groups && component && component.grp) {
          var groupElement = angular.element(document.getElementById(component.grp));
          var parentElem =  element[0].parentElement;
          parentElem.scrollTop = groupElement[0].offsetTop; // Scroll to currently selected group
      }
    }
  };
});