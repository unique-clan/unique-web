$(document).ready(function() {
    var params = tw.getParams();
    if (params.map) {
      tw.init({ mapUrl: params.map })
    }
});
