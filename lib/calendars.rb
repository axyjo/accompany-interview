require 'interface'

module CalendarProviders
  Interface = interface do
    required_methods :list_calendars, :list_events, :auth
  end

  class NoCalendarFound < StandardError
  end

  class GenericCalendarError < StandardError
  end
end

require_relative 'calendars/google.rb'
