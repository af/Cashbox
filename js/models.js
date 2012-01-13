(function(window, $) {

var CASH = window.CASH = (window.CASH || {});
CASH.models = CASH.models || {};

var Store = window.Store;

CASH.models.Expense = Backbone.Model.extend({
    url: '/expense',

    defaults: {
        description: '',
        amount: 0,
        date: null,
        balance: null,
        imported_at: null
    },

    initialize: function(attrs) {
        // If an amount values was provided, coerce it to a float:
        attrs.amount && (attrs.amount = parseFloat(attrs.amount));
        this.set(attrs, {silent: true });
    },
});


CASH.models.ImportedExpenses = Backbone.Collection.extend({
    model: CASH.models.Expense,
    localStorage: new Store('Expense'),

    comparator: function(item) {
        // FIXME: dates are just strings right now, and don't sort properly
        // when spread across multiple years
        return item.get('date');
    },
});

}(window, jQuery));
