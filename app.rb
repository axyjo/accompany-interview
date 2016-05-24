require 'sinatra/base'
require 'sinatra/json'
require 'tilt/erb'

require_relative 'lib/calendars'

class AccompanyInterview < Sinatra::Application
  def initialize
    @calendar_providers = {google: CalendarProviders::GoogleCalendar.new()}
    super
  end

  get '/' do
    erb :index
  end

  get '/sources' do
    json []
  end

  get '/events/:provider/:id' do
    json []
  end
end
