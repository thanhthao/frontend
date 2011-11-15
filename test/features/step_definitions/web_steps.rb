Then /^I should see "([^"]*)"$/ do |text|
  page.should have_content(text)
end

Then /^show me the page$/ do
  save_and_open_page
end

When /^(?:|I )press "([^"]*)"$/ do |button|
  click_button(button)
end

When /^(?:|I )follow "([^"]*)"$/ do |link|
  click_link(link)
end

When /^(?:|I )fill in "([^"]*)" with "([^"]*)"$/ do |field, value|
  fill_in(field, :with => value)
end

When /^I wait until "([^"]*)" is visible$/ do |selector|
  page.has_css?("#{selector}", :visible => true)
end

When /^I wait until xpath "([^"]*)" is visible$/ do |selector|
  page.has_xpath?("#{selector}", :visible => true)
end

When /^I wait ([^"]*) seconds$/ do |second|
  sleep(second.to_i)
end

