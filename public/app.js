var app = app || {};

/* Collections */

// A small collection definition for the multiple calendar list. We use the
// base Backbone model definition since we don't need anything fancy.
app.Sources = Backbone.Collection.extend({
  url: 'sources'
});

/* Views */

// The base view for the app -- renders the other elements on the page.
app.RootView = Backbone.View.extend({
  el: 'body',
  views: {},
  render: function() {
    this.views.list = new app.SourceListView({collection: new app.Sources()});
    this.$el.append(this.views.list.$el);
    this.views.list.render();
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
    this.$el.empty();
    if (this.model.get('visible')) {
      this.$el.css('color', this.model.get('textColor'));
      this.$el.css('background-color', this.model.get('color'));
    } else {
      this.$el.css('color', 'inherit');
      this.$el.css('background-color', 'inherit');
    }
    this.$el.append(this.model.get('title'));
  }
});


// Responsible for rendering the collection of calendars to the page.
app.SourceListView = Backbone.View.extend({
  tagName: 'table',
  initialize: function () {
    _.bindAll(this, 'add', 'remove');
    this._rowViews = [];

    // Bind events on source list
    this.collection.each(this.add);
    this.collection.bind('add', this.add);
    this.collection.bind('remove', this.remove);
    this.collection.fetch();
  },
  add: function(source) {
    var view = new app.SourceListRowView({model: source});
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

