/**
 * BBCode Generator functions for embedding in the Elite Dangerous Forums
 */
angular.module('app').factory('Utils', ['$state','$http', function ($state, $http) {

  var shortenAPI = 'https://www.googleapis.com/urlshortener/v1/url?key=';

  function shortenUrl(url) {
    return $http.post(shortenAPI + GAPI_KEY, {longUrl:url}).then(function(response) {
      return response.data.id;
    });
  }

  function comparisonBBCode(facets, builds, link) {
    var colCount = 2, i,j,k, l = [];

    for (i = 0; i < facets.length; i++) {
      if (facets[i].active) {
        var f = facets[i];
        var p = f.props;

        if (p.length == 1) {
          l.push('[th][B][COLOR=#FF8C0D]', f.title, '[/COLOR][/B][/th]');
          colCount++;
        } else {
          for (j = 0; j < p.length; j++) {
            l.push('[th][B][COLOR=#FF8C0D]', f.title, '\n', f.lbls[j], '[/COLOR][/B][/th]');
            colCount++;
          }
        }
      }
    }
    l.push('[/tr]\n');

    for (i = 0; i < builds.length; i++) {
      var b = builds[i];
      //var href = $state.href('outfit',{shipId: b.id, code: b.code, bn: b.buildName}, {absolute: true});
      l.push('[tr][td]', b.name,'[/td][td]', b.buildName ,'[/td]');

      for (j = 0, fl = facets.length; j < fl; j++) {
        if (facets[j].active) {
          var f = facets[j];
          var p = f.props;
          for (var k = 0, pl = p.length; k < pl; k++) {
            l.push('[td="align: right"]', f.fmt(b[p[k]]), ' [size=-2]', f.unit, '[/size][/td]');
          }
        }
      }
      l.push('[/tr]\n');
    }
    l.push('[tr][td="align: center, colspan:',colCount,'"][size=-3]\n[url=', link,']Interactive Comparison at Coriolis.io[/url][/td][/tr]\n[/size][/table]');
    l.unshift('[table="width:', colCount * 90,',align: center"]\n[tr][th][B][COLOR=#FF8C0D]Ship[/COLOR][/B][/th][th][B][COLOR="#FF8C0D"]Build[/COLOR][/B][/th]');
    return l.join('');
  }

  return {
    comparisonBBCode: comparisonBBCode,
    shortenUrl: shortenUrl
  };

}]);
