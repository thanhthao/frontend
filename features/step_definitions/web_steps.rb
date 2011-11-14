Given /^I am on the home page$/ do
  visit('/index.html')
end

Then /^I should see "([^"]*)"$/ do |text|
  page.should have_content(text)
end

Then /^show me the page$/ do
  save_and_open_page
end
