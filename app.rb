require 'sinatra/base'
require 'sinatra/json'
require 'tilt/erb'

class AccompanyInterview < Sinatra::Application
  get '/' do
    erb :index
  end

  get '/sources' do
    return json []
  end

  get '/events/:provider/:id' do
    return json []
  end
end
