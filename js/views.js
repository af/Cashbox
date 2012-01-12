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
// Sets up our initial collection and handles file upload events.
CASH.views.AppView = Backbone.View.extend({
    el: $('body'),
    drop_zone: this.$('#drop_zone'),
    hover_layer: this.$('#hover_cover'),

    events: {
        // Handle change events on file inputs as if they were uploads:
        'change input[type=file]': 'handle_file_upload',

        // Drag and drop events:
        'dragenter':            'show_drop_zone',
        'dragover #drop_zone':  'cancel_event',
        'dragleave #drop_zone': 'hide_drop_zone',
        'dragenter #drop_zone': 'show_hover_layer',
        'drop      #drop_zone': 'handle_file_drop',
    },

    initialize: function() {
        var table;
        _.bindAll(this);

        this.collection = new CASH.models.ImportedExpenses();
        table = new CASH.views.TableView({ collection: this.collection });
        this.collection.fetch();
    },

    // Handle a file upload event (from a file drop or a FileInput),
    // and pass it to a CSVParser for processing
    handle_file_upload: function(e, file_list) {
        var self = this;
        file_list = file_list || e.target.files;
        CASH.utils.handle_fileList(file_list, function() {
            self.collection.fetch();
        });
    },

    // Helper method for cancelling drag and drop events:
    cancel_event: function(e) { e.stopPropagation(); e.preventDefault(); },

    // Only reveal the drop zone and the hover layer when a file is dragged over the page:
    show_drop_zone: function(e) {
        this.cancel_event(e);
        this.drop_zone.show();
    },

    // Hide the full-page element we use for capturing drop events, so that it
    // doesn't hijack all other events from the rest of the page.
    hide_drop_zone: function(e) {
        this.cancel_event(e);
        this.hover_layer.hide();
        this.drop_zone.hide();
    },

    // Shows a full-page layer over the app when dragging a file over it.
    show_hover_layer: function(e) {
        this.cancel_event(e);
        this.hover_layer.show();
    },

    // Once a file is dropped onto the page, handle the event and process the file data.
    handle_file_drop: function(e) {
        var original_evt = e.originalEvent;
        this.hide_drop_zone(e);

        // Pass the W3C event, which contains the file data (unlike jQuery's wrapper):
        this.handle_file_upload(original_evt, original_evt.dataTransfer.files);
    },
});

}(window, jQuery));
