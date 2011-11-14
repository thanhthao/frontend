require 'capybara'
require 'capybara/dsl'
require 'capybara/cucumber'
Capybara.default_driver = :selenium
Capybara.app_host = 'file://' + File.expand_path(File.dirname(__FILE__) + '/../..') #'file:///Users/eastagile/code/frontend'
World(Capybara)
