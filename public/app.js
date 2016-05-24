var app = app || {};

/* Views */

// The base view for the app -- renders the other elements on the page.
app.RootView = Backbone.View.extend({
  el: 'body',
  render: function() {
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

