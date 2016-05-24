require 'interface'

module CalendarProviders 
  Interface = interface{
    required_methods :list_calendars, :list_events, :auth
  }

  class NoCalendarFound < StandardError
  end

  class GenericCalendarError < StandardError
  end
end

require_relative 'calendars/google.rb'

