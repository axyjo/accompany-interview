require 'sinatra/base'
require 'sinatra/json'
require 'tilt/erb'

require_relative 'lib/calendars'

class AccompanyInterview < Sinatra::Application
  def initialize
    @calendar_providers = {google: CalendarProviders::GoogleCalendar.new()}
    super
  end

  # Google specific route to authenticate the user.
  get '/googleauth' do
    if @calendar_providers[:google].authed?
      redirect '/'
    else
      redirect @calendar_providers[:google].auth
    end
  end

  # Google specific route once the user authenticates
  get '/oauth2callback' do
    if !params['code'].empty?
      @calendar_providers[:google].auth(params['code'])
    end
    redirect '/'
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
