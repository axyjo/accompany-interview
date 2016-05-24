require 'sinatra/base'
require 'tilt/erb'

class AccompanyInterview < Sinatra::Application
  get '/jay' do
    erb :foo
  end
end
