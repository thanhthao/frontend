Given /^I am on the home page$/ do
  visit('/index.html')
  #page.execute_script("Badger.api_host = 'http://www.badger.dev/'; alert(Badger.api_host)")
end

Given /^I am on the register page$/ do
  visit('/index.html#register/code1')
end

Given /^I am on the invites page$/ do
  visit('/index.html#invites')
end

Given /^I visit the confirm email path$/ do
  visit("/index.html#confirm_email/confirm_code")
end

When /^I visit grid view "([^"]*)" of domains$/ do |filter|
  visit("/index.html#filter_domains/#{filter}/grid")
end

