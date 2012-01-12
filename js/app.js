(function($, window) {

var CASH = window.CASH = (window.CASH || {});


// Toy usage of CSVParser from a FileInput:
$(document).ready(function() {
    var c = new CASH.models.ImportedExpenses();
    var tv = new CASH.views.TableView({ collection: c });
    c.fetch();

    function parse_files(fileList) {
        var f, parser;
        for (var i=0; i < fileList.length; i += 1) {
            f = fileList[i];
            parser = new CASH.utils.CSVParser();
            parser.parse(f, function(expense_list) {
                // Save each individual expense to localstorage (there is no
                // save method on the collection)
                expense_list.each(function(e) {
                    e.save();
                });
                c.fetch();
            });
        }
    }

    $('body').on('change', 'input[type=file]', function(e) {
        parse_files(e.target.files);
    });

    // Basic drag & drop support:
    var drop_zone = $('#drop_zone');
    var hover_cover = $('#hover_cover');
    var cancel_event = function(e) { e.stopPropagation(); e.preventDefault(); };

    // Only reveal the drop zone and the hover layer when a file is dragged
    // over the page:
    document.body.addEventListener('dragenter', function(e) {
        cancel_event(e);
        drop_zone.show();
    });

    drop_zone[0].addEventListener('dragover', cancel_event);
    drop_zone[0].addEventListener('dragenter', function(e) {
        cancel_event(e);
        hover_cover.show();
    });
    drop_zone[0].addEventListener('dragleave', function(e) {
        cancel_event(e);
        hover_cover.hide();
        drop_zone.hide();
    });
    drop_zone[0].addEventListener('drop', function(e) {
        cancel_event(e);
        drop_zone.hide();
        hover_cover.hide();
        parse_files(e.dataTransfer.files);
    });
});

}(jQuery, window));
