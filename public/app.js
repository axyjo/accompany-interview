var app = app || {};

/* Collections */

// A small collection definition for the multiple calendar list. We use the
// base Backbone model definition since we don't need anything fancy.
app.Sources = Backbone.Collection.extend({
  url: 'sources'
});

// A collection to manage an event's attendees
app.Attendees = Backbone.Collection.extend({
});

// Events are managed by FullCalendar, so we don't need a collection for those.

/* Views */

// The base view for the app -- renders the other elements on the page.
app.RootView = Backbone.View.extend({
  el: 'body',
  views: {},
  render: function() {
    this.views.cal = new app.CalendarView();
    this.views.cal.render();
    this.$el.append(this.views.cal.$el);

    this.views.list = new app.SourceListView({collection: new app.Sources()});
    this.views.list.render();
    this.$el.append(this.views.list.$el);

    this.views.contact = new app.ContactListView({collection: new app.Attendees()});
    this.views.contact.render();
    this.$el.append(this.views.contact.$el);
  }
});

// A view for a particular list entry in the list of calendars. Controls the
// visibility of the calendar's events, as well as the calendar colours.
app.SourceListRowView = Backbone.View.extend({
  tagName: 'tr',
  events: {
    'click': 'toggleVisibility'
  },
  toggleVisibility: function() {
    this.model.set('visible', !this.model.get('visible'));
    this.render();
  },
  render: function() {
    var $cal = app.root.views.cal.$el;
    this.$el.empty();
    if (this.model.get('visible')) {
      this.$el.css('color', this.model.get('textColor'));
      this.$el.css('background-color', this.model.get('color'));
      $cal.fullCalendar('addEventSource', this.eventSource());
    } else {
      this.$el.css('color', 'inherit');
      this.$el.css('background-color', 'inherit');
      $cal.fullCalendar('removeEventSource', this.eventSource());
    }
    this.$el.append(this.model.get('title'));
  },
  eventSource: function() {
    return {
      backgroundColor: this.model.get('color'),
      textColor: this.model.get('textColor'),
      url: this.model.get('url')
    };
  }
});

app.ContactListRowView = Backbone.View.extend({
  tagName: 'tr',
  render: function() {
    this.$el.empty();
    this.$el.append(this.model.get('name'));
  }
});

// A generic list view to render lists of things.
app.ListView = Backbone.View.extend({
  tagName: 'table',
  autoFetch: true,
  initialize: function () {
    _.bindAll(this, 'add', 'remove');
    var self = this;
    this._rowViews = [];

    // Bind events on source list
    this.collection.each(this.add);
    this.collection.bind('add', this.add);
    this.collection.bind('remove', this.remove);
    this.collection.bind('reset', function(collection, opts) {
      _(opts.previousModels).each(self.remove);
      collection.each(self.add);
    });

    if (this.autoFetch) {
      this.collection.fetch();
    }
  },
  add: function(source) {
    var view = new this.rowView({model: source});
    this._rowViews.push(view);

    if (this._rendered) {
      view.render();
      this.$el.append(view.$el);
    }
  },
  remove: function(source) {
    var view = _.select(this._rowViews, function(el) { return el.model === source; })[0];
    this._rowViews = _.without(this._rowViews, view);
    view.remove();
  },
  render: function() {
    this._rendered = true;
    var self = this;
    this.$el.empty();
    _.each(this._rowViews, function(rv) {
      self.$el.append(rv.render().$el);
    });
  }
});

// Responsible for rendering the collection of calendars to the page.
app.SourceListView = app.ListView.extend({
  rowView: app.SourceListRowView
});

// Responsible for showing meeting attendees
app.ContactListView = app.ListView.extend({
  autoFetch: false,
  rowView: app.ContactListRowView
});

// Renders the FullCalendar widget
app.CalendarView = Backbone.View.extend({
  eventMouseover: function(event) {
    // Create a collection of attendees first.
    app.root.views.contact.collection.reset(event.attendees);
  },
  render: function() {
    var self = this;
    setTimeout(function() {
      self.$el.fullCalendar({eventMouseover: self.eventMouseover});
    }, 0);
  }
});

/* Router */

app.Router = Backbone.Router.extend({
  routes: {
    "*path": "indexRoute"
  },

  indexRoute: function() {
    app.root = new app.RootView();
    app.root.render();
  }
});

// Get the app started once the DOM is good to go.

$(function() {
  app.route = new app.Router();
  Backbone.history.start({pushState: true});
});

