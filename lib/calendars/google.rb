require 'google/apis/calendar_v3'
require 'googleauth'
require 'googleauth/stores/file_token_store'
require 'interface'
require 'time'

module CalendarProviders
  class GoogleCalendar
    APPLICATION_NAME = 'Accompany Interview'.freeze
    CLIENT_SECRETS_PATH = 'client_secret.json'.freeze
    CREDENTIALS_PATH = 'google.yml'.freeze
    BASE_URL = 'http://accompany.axyjo.com:4567/'.freeze

    SCOPE = Google::Apis::CalendarV3::AUTH_CALENDAR

    def list_calendars
      format_calendars(service.list_calendar_lists)
    end

    def list_events(id, params)
      options = event_options(params)
      begin
        response = service.list_events(id, options)
        format_events(response)
      rescue Google::Apis::ClientError => e
        puts e.body
        raise NoCalendarFound if e.status_code == 404
        raise GenericCalendarError
      end
    end

    def auth(code = nil)
      if code.nil?
        authorizer.get_authorization_url(base_url: BASE_URL)
      else
        authorizer.get_and_store_credentials_from_code(
          user_id: user_id, code: code, base_url: BASE_URL
        )
      end
    end

    def authed?
      !credentials.nil?
    end

    implements CalendarProviders::Interface

    private

    def authorizer
      client_id = Google::Auth::ClientId.from_file(CLIENT_SECRETS_PATH)
      token_store = Google::Auth::Stores::FileTokenStore.new(
        file: CREDENTIALS_PATH
      )
      Google::Auth::UserAuthorizer.new(client_id, SCOPE, token_store)
    end

    def credentials
      user_id = 'default'
      authorizer.get_credentials(user_id)
    end

    def service
      service = Google::Apis::CalendarV3::CalendarService.new
      service.client_options.application_name = APPLICATION_NAME
      service.authorization = credentials
      service
    end

    def event_options(params)
      options = {
        max_results: 2500, single_events: true, order_by: 'startTime'
      }

      unless params[:start].nil?
        options[:time_min] = DateTime.parse(params[:start]).iso8601
      end

      unless params[:end].nil?
        options[:time_max] = DateTime.parse(params[:end]).iso8601
      end

      options
    end

    def format_calendars(response)
      response.items.map do |cal|
        {
          id: cal.id,
          title: cal.summary,
          visible: (cal.primary || cal.selected),
          color: cal.background_color,
          textColor: cal.foreground_color,
          description: cal.description
        }
      end
    end

    def format_events(response)
      response.items.map do |event|
        {
          id: event.id,
          title: event.summary,
          start: event.start.date_time || event.start.date,
          end: event.end.date_time || event.end.date
        }
      end
    end
  end
end
