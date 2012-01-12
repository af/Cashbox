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


// Main view for the app.
CASH.views.AppView = Backbone.View.extend({
    el: $('body'),
    drop_zone: this.$('#drop_zone'),
    hover_layer: this.$('#hover_cover'),

    events: {
        'change input[type=file]': 'handle_file_upload'
    },

    handle_file_upload: function(e, file_list) {
        var self = this;
        file_list = file_list || e.target.files;
        CASH.utils.handle_fileList(file_list, function() {
            self.collection.fetch();
        });
    },

    initialize: function() {
        var self = this,
            table;

        this.collection = new CASH.models.ImportedExpenses();
        table = new CASH.views.TableView({ collection: this.collection });
        this.collection.fetch();

        // Basic drag & drop support:
        var cancel_event = function(e) { e.stopPropagation(); e.preventDefault(); };

        // Only reveal the drop zone and the hover layer when a file is dragged
        // over the page:
        document.body.addEventListener('dragenter', function(e) {
            cancel_event(e);
            self.drop_zone.show();
        });

        this.drop_zone[0].addEventListener('dragover', cancel_event);
        this.drop_zone[0].addEventListener('dragenter', function(e) {
            cancel_event(e);
            self.hover_layer.show();
        });
        this.drop_zone[0].addEventListener('dragleave', function(e) {
            cancel_event(e);
            self.hover_layer.hide();
            self.drop_zone.hide();
        });
        this.drop_zone[0].addEventListener('drop', function(e) {
            cancel_event(e);
            self.drop_zone.hide();
            self.hover_layer.hide();
            self.handle_file_upload(e, e.dataTransfer.files);
        });
    }
});

}(window, jQuery));
