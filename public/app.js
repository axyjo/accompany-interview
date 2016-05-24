var app = app || {};

/* Router */

app.Router = Backbone.Router.extend({
  routes: {
    "*path": "indexRoute"
  },

  indexRoute: function() {
  }
});

// Get the app started once the DOM is good to go.

$(function() {
  app.route = new app.Router();
  Backbone.history.start({pushState: true});
});

