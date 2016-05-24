require 'sinatra/base'

class AccompanyInterview < Sinatra::Application
  get '/jay' do
    erb :foo
  end
end
