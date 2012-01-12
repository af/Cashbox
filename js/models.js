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
});


CASH.models.ImportedExpenses = Backbone.Collection.extend({
    model: CASH.models.Expense,
    localStorage: new Store('Expense')
});

}(window, jQuery));
