require 'interface'

# A common namespace for all calendar providers to live in. A calendar provider
# must define at least three methods:
#  - list_calendars: returns a list of calendars accessible by this provider
#  - list_events(id, params): returns a list of events for a particular
#                             calendar
#  - auth: checks if the user is authorized to access this provider
module CalendarProviders
  Interface = interface do
    required_methods :list_calendars, :list_events, :auth
  end

  # This exception should be raised when list_events cannot find a calendar by
  # the given calendar ID.
  class NoCalendarFound < StandardError
  end

  # This exception should be raised when the provider returns another error.
  class GenericCalendarError < StandardError
  end
end

require_relative 'calendars/google.rb'
