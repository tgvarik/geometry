#!/usr/bin/env ruby

require 'sinatra'

get '/:path' do
  p params
  send_file params[:path]
end
