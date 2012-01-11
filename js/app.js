(function($, window) {
var Store = window.Store;

var Expense = Backbone.Model.extend({
    url: '/expense',
    defaults: {
        description: '',
        amount: 0,
        date: null,
        balance: null,
        imported_at: null
    },
});


var ImportedExpenses = Backbone.Collection.extend({
    model: Expense,
    localStorage: new Store('Expense')
});


var TableView = Backbone.View.extend({
    el: $('#expenses'),
    template: null
});


// Helper class for parsing CSV files.
// Provides a parse() function, which accepts a File object and a success callback.
//
// Example usage:
// var p = new CSVParser();
// p.parse(myFile, function(outpu) { ... })
var CSVParser = function() {
    this.expected_type = 'text/csv';
};

CSVParser.prototype.parse = function(file, callback) {
    var self = this,
        reader = new FileReader();

    reader.onload = function(e) {
        var output = self._process_data(e.target.result);
        callback && callback(output);
    };
    reader.onerror = function(e) { this._raise_error('ERROR while reading file'); };

    if (file.type === this.expected_type) {
        reader.readAsText(file);    // Note: This fails on Chrome if loading the page via a file:// url
    }
    else {
        this._raise_error('Invalid file type provided. Expected ' + this.expected_type +
                          ' and got ' + file.type);
    }
};

CSVParser.prototype._raise_error = function(message) {
    throw new Error(message || 'CSV parsing error');
}

// Accepts raw CSV text data and returns an array of newly created Expense objects.
// This is a very naive and inflexible first implementation.
CSVParser.prototype._process_data = function(data) {
    var lines = data.split('\n'),
        fields = ['date', 'description', 'amount', 'credit_amount', 'balance',],     // Assume a fixed field order for now
        import_time = new Date(),
        output = [],
        collection = new ImportedExpenses();

    // Iterate through each line of the csv file, and create a new Expense for
    // each using our assumed field order. This is basic, but more configurable
    // parsing can come later.
    _(lines).each(function(l) {
        // Create a hash, mapping field names to strings of csv data:
        var zipped = _.zip(fields, l.split(','));
        var attr_hash = _.reduce(zipped, function(memo, x) {
            memo[x[0]] = x[1] || null;
            return memo;
        }, {});
        attr_hash.imported_at = import_time;
        output.push(new Expense(attr_hash));
    });
    collection.add(output);
    return collection;
};


// Toy usage of CSVParser from a FileInput:
$(document).ready(function() {
    function parse_files(fileList) {
        var f, parser;
        for (var i=0; i < fileList.length; i += 1) {
            f = fileList[i];
            parser = new CSVParser();
            parser.parse(f, function(expense_list) {
                // Save each individual expense to localstorage (there is no
                // save method on the collection)
                expense_list.each(function(e) {
                    e.save();
                });
            });
        }
    }

    $('input[type=file]').change(function(e) {
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
