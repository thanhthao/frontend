Given /^I am not logged in$/ do
  page.execute_script("Badger.logout();")
end

Given /^I am on the home page$/ do
  visit('/index.html')
end

Given /^I am on the register page$/ do
  visit('/index.html#register/code1')
end

Given /^The home page is fully loaded$/ do
  When 'I wait until xpath "//table/tr[@class=\'table-header\']" is visible'
  When 'I wait until xpath "//table/td" is visible'
end

Given /^I logged in with mock data for domains and user info$/ do
  Given 'I am on the home page'
  And 'I am not logged in'
  Then 'I follow "Login"'
  Given 'I mock neccessary data to mock login'
  And 'I fill in "email" with "tester@example.com"'
  And 'I fill in "password" with "12345678"'
  And 'I press "Login"'
  Then 'I wait 5 seconds'
  Given 'The home page is fully loaded'
end

Given /^I mock neccessary data to mock login$/ do
  Given 'I mock getDomains with 1 normal domains, 1 in transfer domain and 1 expiring soon domains'
  And 'I mock getAccountInfo'
  And 'I mock getContacts'
  And 'I mock getPaymentMethods'
  And 'I mock login'
end