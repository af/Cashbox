(function(window, $) {

var CASH = window.CASH = (window.CASH || {});
CASH.views = CASH.views || {};

CASH.views.TableView = Backbone.View.extend({
    el: $('#expenses'),
    template: Handlebars.compile($('#expense_list').text()),
    initialize: function() {
        this.collection.bind('reset', this.render, this);
    },
    render: function() {
        var rendered_html = this.template(this.collection.toJSON());
        $(this.el).html(rendered_html);
        return this;
    }
});

}(window, jQuery));
