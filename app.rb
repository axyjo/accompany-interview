require 'sinatra/base'
require 'tilt/erb'

class AccompanyInterview < Sinatra::Application
  get '/' do
    erb :index
  end
end
