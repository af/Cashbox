(function($, window) {

$(document).ready(function() {
    $('input[type=file]').change(function(e) {
        var f = e.target.files[0];

        var r = new FileReader();
        r.onload = function(e) { console.log('file is: ', e.target.result); };
        r.onerror = function(e) { console.error('ERROR while loading file:', e); };
        r.readAsText(f);    // This fails on Chrome if loading the page via a file:// url
    });
});

}(jQuery, window));
