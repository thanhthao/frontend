Given /^I am not logged in$/ do
  page.execute_script("Badger.logout();")
end

Given /^I am on the home page$/ do
  visit('/index.html')
end

Given /^I am on the register page$/ do
  visit('/index.html#register/code1')
end

Given /^I am on the invites page$/ do
  visit('/index.html#invites')
end

Given /^The home page is fully loaded$/ do
  When 'I wait until xpath "//table/tr[@class=\'table-header\']" is visible'
  When 'I wait until xpath "//table/td" is visible'
end

Given /^I logged in with mock data for domains and user info with ([^"]*) domain credits and ([^"]*) invites available$/ do |domain_credits, invites_available|
  Given 'I am on the home page'
  And 'I am not logged in'
  Then 'I follow "Login"'
  And "I mock neccessary data to mock login with #{domain_credits} domain credits and #{invites_available} invites available"
  And 'I fill in "email" with "tester@example.com"'
  And 'I fill in "password" with "12345678"'
  And 'I press "Login"'
  And 'The home page is fully loaded'
end

Given /^I mock neccessary data to mock login with ([^"]*) domain credits and ([^"]*) invites available$/ do |domain_credits, invites_available|
  Given 'I mock getDomains with 1 normal domains, 1 in transfer domain and 1 expiring soon domains'
  And "I mock accountInfo with #{domain_credits} domain credits and #{invites_available} invites available"
  And 'I mock getContacts'
  And 'I mock getPaymentMethods'
  And 'I mock login'
end