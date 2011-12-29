Given /^I am on the home page$/ do
  visit('/index.html')
  Given 'I am not logged in'
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

When /^I visit Badger DNS for domain "([^"]*)"$/ do |domain|
  visit("/index.html#domains/#{domain}/dns")
end

When /^I visit Email Forwarding for domain "([^"]*)"$/ do |domain|
  visit("/index.html#domains/#{domain}/email_forwards")
end

Given /^I view terms of service when registering$/ do
  visit('/index.html#register_terms_of_service')
end

Given /^I am on the view blog page with blog_id "([^"]*)"$/ do |blog_id|
  visit("/index.html#blogs/#{blog_id}")
end