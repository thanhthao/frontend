require 'capybara'
require 'capybara/dsl'
require 'capybara/cucumber'

Capybara.default_driver = :selenium
Capybara.register_driver :selenium do |app|
  Capybara::Driver::Selenium.new(app, :browser => :chrome)
end
Capybara.app_host = 'file://' + File.expand_path(File.dirname(__FILE__) + '/../../..')
World(Capybara)
