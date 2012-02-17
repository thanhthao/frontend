Given /^I am not logged in$/ do
  page.execute_script("Badger.logout();")
end

Given /^The home page is fully loaded$/ do
  step 'I wait until xpath "//table/tr[@class=\'table-header\']" is visible'
  step 'I wait until xpath "//table/td" is visible'
  step 'I should not see "Loading domains..."'
end

Given /^A dialog has popped up$/ do
  step 'I wait until "#modal-dialog" is visible'
  step 'I wait until "#modal-content" is visible'
end

Given /^I logged in with mock data for domains and user info with ([^"]*) domain credits and ([^"]*) invites available$/ do |domain_credits, invites_available|
  step 'I am on the home page'
  step 'I am not logged in'
  step 'I follow "Login"'
  step "I mock neccessary data to mock login with #{domain_credits} domain credits and #{invites_available} invites available"
  step 'I fill in "email" with "tester@example.com"'
  step 'I fill in "password" with "12345678"'
  step 'I press "Login"'
  step 'I view my domains list'
  step 'The home page is fully loaded'
end

Given /^I mock neccessary data to mock login with ([^"]*) domain credits and ([^"]*) invites available$/ do |domain_credits, invites_available|
  step 'I mock getDomains with 1 normal domains, 1 in transfer domain and 1 expiring soon domains'
  step 'I mock accountInfo with name "East Agile Company" and ' + "#{domain_credits} domain credits and #{invites_available} invites available"
  step 'I mock getContacts returns 1 contacts'
  step 'I mock getPaymentMethods'
  step 'I mock getInviteStatus with 0 accepted and 0 pending and 0 revoked'
  step 'I mock login'
end
