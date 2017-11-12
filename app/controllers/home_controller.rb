class HomeController < ApplicationController
  def index
    puts 'HELLO!!! sdfdsfdsfdsfdssdffds'
    puts params
    render 'home/index'
  end
end
