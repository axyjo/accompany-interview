require 'interface'

module CalendarProviders 
  Interface = interface{
    required_methods :list_calendars, :list_events, :auth
  }
end

require_relative 'calendars/google.rb'

