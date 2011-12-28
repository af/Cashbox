(function($, window) {

var Account = Backbone.Model.extend({
    defaults: {
        name: null,
        balance: 0
    }
});
window.Account = Account;


var Expense = Backbone.Model.extend({
    defaults: {
        description: '',
        amount: 0,
        date: null,
        account: null,      // Should be a reference to an Account instance
        balance: null,
        imported_at: null
    },

    // Override JSON serialization so that the expense's account name is returned,
    // rather than a full Account model instance.
    toJSON: function() {
        var attrs = this.attributes;
        attrs.account = this.get('account').get('name');
        return attrs;
    }
});
window.Expense = Expense;


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
        this._raise_error('Invalid file type provided');
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
        output = [];

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
    return output;
};


// Toy usage of CSVParser from a FileInput:
$(document).ready(function() {
    $('input[type=file]').change(function(e) {
        var files = e.target.files,
            f,
            parser;

        for (var i=0, l=files.length; i<l; i+=1) {
            f = files[i];
            parser = new CSVParser();
            parser.parse(f, function(expense_list) {
                console.log(expense_list);
            });
        }
    });
});

}(jQuery, window));
