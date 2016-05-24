var app = app || {};

/* Models */
app.Profile = Backbone.Model.extend({
  urlRoot: 'contacts/gravatar'
});

/* Collections */

// A small collection definition for the multiple calendar list. We use the
// base Backbone model definition since we don't need anything fancy.
app.Sources = Backbone.Collection.extend({
  url: 'sources'
});

// A collection to manage an event's attendees
app.Attendees = Backbone.Collection.extend({
  comparator: 'email'
});

// Cache profile lookups so that we don't have a round trip every time.
app.ProfileCache = new Backbone.Collection();

// Events are managed by FullCalendar, so we don't need a collection for those.

/* Layouts */
app.SidePane = Backbone.View.extend({
  className: 'side'
});

app.MainPane = Backbone.View.extend({
  className: 'main'
});

/* Views */

// The base view for the app -- renders the other elements on the page.
app.RootView = Backbone.View.extend({
  el: 'body',
  layouts: {},
  views: {},
  render: function() {
    this.layouts.main = new app.MainPane();
    this.layouts.main.render();
    this.$el.append(this.layouts.main.$el);

    this.layouts.side = new app.SidePane();
    this.layouts.side.render();
    this.$el.append(this.layouts.side.$el);

    this.views.cal = new app.CalendarView();
    this.views.cal.render();
    this.layouts.main.$el.append(this.views.cal.$el);

    this.views.list = new app.SourceListView({collection: new app.Sources()});
    this.views.list.render();
    this.layouts.side.$el.append(this.views.list.$el);

    this.views.contact = new app.ContactListView({collection: new app.Attendees()});
    this.views.contact.render();
    this.layouts.side.$el.append(this.views.contact.$el);
  }
});

// A view for a particular list entry in the list of calendars. Controls the
// visibility of the calendar's events, as well as the calendar colours.
app.SourceListRowView = Backbone.View.extend({
  tagName: 'tr',
  events: {
    'click': 'toggleVisibility'
  },
  // We can force the visibility of a calendar instead of having to toggle it
  // conditionally.
  forceVisibility: function(visibility) {
    this.model.set('visible', !!visibility);
    this.render();
  },
  toggleVisibility: function() {
    this.forceVisibility(!this.model.get('visible'));
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
    var checkbox = $("<input type='checkbox' />"), self = this;
    checkbox.each(function() { this.checked = self.model.get('visible'); });
    this.$el.append(checkbox);
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
  profileFetched: false,
  initialize: function() {
    var self = this;
    var id = this.model.get('email');
    this.profile = app.ProfileCache.get(id);
    if (this.profile) {
      this.profileFetched = true;
    } else {
      this.profile = new app.Profile({id: id});
      $.when(this.profile.fetch()).then(function() {
        app.ProfileCache.add(self.profile);
        self.profileFetched = true;
        self.render();
      });
    }
  },
  render: function() {
    this.$el.empty();
    this.$el.append("<span>");
    if (this.profileFetched) {
      this.$el.append("<img src='" + this.profile.get('image') + "' />");
    }
    this.$el.append(this.model.get('name') || this.model.get('email'));
    this.$el.append("</span>");
  }
});

// A generic list view to render lists of things.
app.ListView = Backbone.View.extend({
  tagName: 'table',
  title: '',
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
      this.$el.find('.no-entries').toggle(!this._rowViews.length);
    }
  },
  remove: function(source) {
    var view = _.select(this._rowViews, function(el) { return el.model === source; })[0];
    this._rowViews = _.without(this._rowViews, view);
    view.remove();
    this.$el.find('.no-entries').toggle(!this._rowViews.length);
  },
  render: function() {
    this._rendered = true;
    var self = this;
    this.$el.empty();
    this.$el.append("<h3>" + this.title + "</h3>");
    _.each(this._rowViews, function(rv) {
      self.$el.append(rv.render().$el);
    });
    this.$el.append("<span class='no-entries'>(no entries)</span>");
    this.$el.find('.no-entries').toggle(!this._rowViews.length);
  }
});

// Responsible for rendering the collection of calendars to the page.
app.SourceListView = app.ListView.extend({
  title: "Calendars",
  rowView: app.SourceListRowView
});

// Responsible for showing meeting attendees
app.ContactListView = app.ListView.extend({
  title: "Event Attendees",
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

