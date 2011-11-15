Given /^I am on the home page$/ do
  visit('/index.html')
  Given 'The api host is api-qa.badger.com'
end

Given /^The home page is fully loaded/ do
  When 'I wait until xpath "//table/tr[@class=\'table-header\']" is visible'
  When 'I wait until xpath "//table/td" is visible'
end

Given /^The api host is api-qa.badger.com/ do
  page.execute_script("Badger.api_host = 'https://api-qa.badger.com/';")
end

Given /^I logged in/ do
  Given 'I am on the home page'
  Then 'I follow "Login"'
  And 'I fill in "email" with "thao.tran@eastagile.com"'
  And 'I fill in "password" with "12345678"'
  And 'I press "Login"'
  Given 'The home page is fully loaded'
end