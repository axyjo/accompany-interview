require 'sinatra/base'
require 'sinatra/json'
require 'tilt/erb'
require 'uri'

require_relative 'lib/calendars'

# This class handles the HTTP requests for the calendar application.
class AccompanyInterview < Sinatra::Application
  def initialize
    # When adding new providers, add a key-value mapping of a symbol to an
    # instance of the calendar provider.
    @calendar_providers = {
      google: CalendarProviders::GoogleCalendar.new
    }
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
    unless params['code'].empty?
      @calendar_providers[:google].auth(params['code'])
    end
    redirect '/'
  end

  # Renders the layout, which contains the Javascript necessary to bootstrap
  # the page.
  get '/' do
    erb :index
  end

  # Gets a list of calendars for all enabled sources.
  get '/sources' do
    calendars = []
    @calendar_providers.each do |key, provider|
      provided_list = provider.list_calendars
      provided_list.map! do |source|
        source[:url] = '/events/' + key.to_s + '/' + URI.escape(source[:id])
        source
      end
      calendars.push(*provided_list)
    end
    json calendars
  end

  # Gets a list of events for a given provider and calendar ID.
  get '/events/:provider/:id' do
    provider_name = params['provider'].to_sym
    provider = @calendar_providers[provider_name]
    return halt(404) if provider.nil?
    id = URI.unescape(params['id'])
    begin
      json provider.list_events(id, params)
    rescue CalendarProviders::NoCalendarFound
      halt(404)
    rescue CalendarProviders::GenericCalendarError
      halt(500)
    end
  end
end
