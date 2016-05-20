require 'sinatra'

set :bind, '0.0.0.0'

get '/jay' do
  erb :foo
end
