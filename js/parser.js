(function(window, $) {

var CASH = window.CASH = (window.CASH || {});
CASH.utils = CASH.utils || {};

// Helper class for parsing CSV files.
// Provides a parse() function, which accepts a File object and a success callback.
//
// Example usage:
// var p = new CSVParser();
// p.parse(myFile, function(outpu) { ... })
var CSVParser = CASH.utils.CSVParser = function() {
    this.expected_type = 'text/csv';
};

CSVParser.prototype = {

    // Given an HTML5 File object, parse the CSV data and pass an
    // ImportedExpenses collection to the success callback.
    parse: function(file, callback) {
        var self = this,
            reader = new FileReader();

        reader.onload = function(e) {
            var collection = self._process_data(e.target.result);
            callback && callback(collection);
        };
        reader.onerror = function(e) { this._raise_error('ERROR while reading file'); };

        if (file.type === this.expected_type) {
            reader.readAsText(file);    // Note: This fails on Chrome if loading the page via a file:// url
        }
        else {
            this._raise_error('Invalid file type provided. Expected ' + this.expected_type +
                              ' and got ' + file.type);
        }
    },

    _raise_error: function(message) {
        throw new Error(message || 'CSV parsing error');
    },

    // Accepts raw CSV text data and returns an array of newly created Expense objects.
    // This is a very naive and inflexible first implementation.
    _process_data: function(data) {
        var lines = data.split('\n'),
            fields = ['date', 'description', 'amount', 'credit_amount', 'balance',],     // Assume a fixed field order for now
            import_time = new Date(),
            output = [],
            collection = new CASH.models.ImportedExpenses();

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
            output.push(new CASH.models.Expense(attr_hash));
        });
        collection.add(output);
        return collection;
    },
};

}(window, jQuery));
