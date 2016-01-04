angular.module('app').directive('comparisonTable', ['$state', '$translate', '$rootScope', function($state, $translate, $rootScope) {

  function tblHeader(facets) {
    var r1 = ['<tr class="main"><th rowspan="2" class="prop" prop="name">', $translate.instant('SHIP'), '</th><th rowspan="2" class="prop" prop="buildName">', $translate.instant('BUILD'), '</th>'];
    var r2 = [];
    for (var i = 0, l = facets.length; i < l; i++) {
      if (facets[i].active) {
        var f = facets[i];
        var p = f.props;
        var pl = p.length;
        r1.push('<th rowspan="', f.props.length == 1 ? 2 : 1, '" colspan="', pl, '"');

        if (pl == 1) {
          r1.push(' prop="', p[0], '" class="prop"');
        } else {
          for (var j = 0; j < pl; j++) {
            r2.push('<th prop="', p[j], '" class="prop ', j === 0 ? 'lft' : '', '">', $translate.instant(f.lbls[j]), '</th>');
          }
        }

        r1.push('>', $translate.instant(f.title), '</th>');
      }
    }
    r1.push('</tr><tr>');
    r1.push(r2.join(''));
    r1.push('</tr>');
    return r1.join('');
  }

  function tblBody(facets, builds) {
    var body = [];

    if (builds.length === 0) {
      return '<td colspan="100" class="cen">No builds added to comparison!</td>';
    }

    for (var i = 0, l = builds.length; i < l; i++) {
      var b = builds[i];
      body.push('<tr class="tr">');
      var href = $state.href('outfit', { shipId: b.id, code: b.code, bn: b.buildName });
      body.push('<td class="tl"><a href="', href, '">', b.name, '</a></td>');
      body.push('<td class="tl"><a href="', href, '">', b.buildName, '</a></td>');

      for (var j = 0, fl = facets.length; j < fl; j++) {
        if (facets[j].active) {
          var f = facets[j];
          var p = f.props;
          for (var k = 0, pl = p.length; k < pl; k++) {
            body.push('<td>', $rootScope[f.fmt](b[p[k]]), '<u> ', $translate.instant(f.unit), '</u></td>');
          }
        }
      }
      body.push('</tr>');
    }

    return body.join('');
  }

  return {
    restrict: 'A',

    link: function(scope, element) {
      var header = angular.element('<thead></thead>');
      var body = angular.element('<tbody></tbody>');
      element.append(header);
      element.append(body);

      var updateAll = function() {
        header.html(tblHeader(scope.facets));
        body.html(tblBody(scope.facets, scope.builds));
      };

      scope.$watchCollection('facets', updateAll);
      scope.$watch('tblUpdate', updateAll);
      scope.$watchCollection('builds', function() {
        body.html(tblBody(scope.facets, scope.builds));
      });
    }
 };
}]);
