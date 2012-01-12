(function(window, $) {

var CASH = window.CASH = (window.CASH || {});
CASH.views = CASH.views || {};


// Simple router for guiding the app through hashbang changes:
// For now, simply triggers a route_change event, passing along the new
// location hash.
var AppRouter = Backbone.Router.extend({
    routes: {},

    initialize: function(options) {
        // Build routes dynamically from a list of hashbangs:
        var hashbangs = options.hashbangs || [],
            self = this;
        this.routes = this.routes || {};
        hashbangs.forEach(function(url) {
            url = url.replace(/^#/, '');
            self.routes[url] = 'trigger_routing_event';
        });
        this._bindRoutes();     // Performs the actual parsing of this.routes
    },

    // Trigger a route_change so listeners can deal with the hash change.
    trigger_routing_event: function() {
        this.trigger('route_change', window.location.hash);
    }
});


CASH.views.TableView = Backbone.View.extend({
    el: $('#expenses'),
    template: Handlebars.compile($('#expense_list').text()),
    initialize: function() {
        _.bindAll(this);
        this.collection.bind('reset', this.render);
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
    nav: this.$('nav#sections'),
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

        // Reset helper, for development:
        'click    #clear_data': 'clear_data',
    },

    initialize: function() {
        var table_view;

        _.bindAll(this);
        this.collection = new CASH.models.ImportedExpenses();
        table_view = new CASH.views.TableView({ collection: this.collection });
        this.collection.fetch();

        // Set up a global Router:
        var hashbangs = this.nav.find('a').map(function() {
            return $(this).attr('href');
        });
        this.router = new AppRouter({ hashbangs: Array.prototype.slice.call(hashbangs) });
        this.router.bind('route_change', this.change_section);
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

    // Change the active section element in the DOM.
    // Right now, we assume a 1 to 1 mapping between hashbang urls and
    // <section> ids.
    change_section: function(new_url) {
        var section_id = new_url.replace(/^#!/, '');
        this.$('#' + section_id).show()
            .siblings('section').hide();

        var selector = 'a[href="' + new_url + '"]';
        this.nav.find(selector).addClass('active');
        this.nav.find('a').not(selector).removeClass('active');
    },

    // Clear all stored data (for development/testing)
    clear_data: function(e) {
        window.localStorage.clear();
        this.collection.reset();
    },
});

}(window, jQuery));
