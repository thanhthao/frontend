Then /^(?:|I )should see "([^"]*)"$/ do |text|
  if page.respond_to? :should
    page.should have_content(text)
  else
    assert page.has_content?(text)
  end
end

Then /^(?:|I )should not see "([^"]*)"$/ do |text|
  if page.respond_to? :should
    page.should have_no_content(text)
  else
    assert page.has_no_content?(text)
  end
end

Then /^(?:|I )should see "([^"]*)" within "([^"]*)"$/ do |text, context|
  within(context) do
    if page.respond_to? :should
      page.should have_content(text)
    else
      assert page.has_content?(text)
    end
  end
end

Then /^(?:|I )should see \/([^\/]*)\/$/ do |regexp|
  regexp = Regexp.new(regexp)
  if page.respond_to? :should
    page.should have_xpath('//*', :text => regexp)
  else
    assert page.has_xpath?('//*', :text => regexp)
  end
end

Then /^(?:|I )should not see "([^"]*)" within "([^"]*)"$/ do |text, context|
  within(context) do
    if page.respond_to? :should
      page.should_not have_content(text)
    else
      assert !page.has_content?(text)
    end
  end
end

Then /^(?:|I )should see a link with href "([^"]*)"( with new window|)$/ do |href, new_window|
  page.should have_xpath("//a[@href='#{href}'#{" and @target='_blank'" unless new_window.empty?}]")
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

When /^(?:|I )follow "([^"]*)" within "([^"]*)"$/ do |link, context|
  within(context) do
    click_link(link)
  end
end

When /^(?:|I )fill in "([^"]*)" with "([^"]*)"$/ do |field, value|
  fill_in(field, :with => value)
end

When /^(?:|I )fill in item "([^"]*)" with "([^"]*)"$/ do |xpath, value|
  page.execute_script("$('#{xpath}').val('#{value}')")
end

When /^I fill multiple lines in "([^"]*)" with:$/ do |field, value|
  fill_in(field, :with => value)
end

When /^I wait until "([^"]*)" is visible$/ do |selector|
  page.has_css?("#{selector}", :visible => true)
end

When /^I wait until xpath "([^"]*)" is visible$/ do |selector|
  page.has_xpath?("#{selector}", :visible => true)
end

When /^(?:|I )choose "([^"]*)"$/ do |field|
  choose(field)
end

When /^I wait ([^"]*) seconds$/ do |second|
  sleep(second.to_i)
end

When /^(?:|I )select "([^"]*)" from "([^"]*)"$/ do |value, field|
  select(value, :from => field)
end

When /^(?:|I )check "([^"]*)"$/ do |field|
  check(field)
end

When /^(?:|I )uncheck "([^"]*)"$/ do |field|
  uncheck(field)
end

Then /^(?:|I )should not see item with xpath "([^"]*)"$/ do |xpath|
  page.should have_no_selector(:xpath, xpath)
end

Then /^(?:|I )should see item with xpath "([^"]*)"$/ do |xpath|
  page.should have_selector(:xpath, xpath)
end

Then /^the "([^"]*)" drop-down should contain the option "([^"]*)"$/ do |id, value|
  page.should have_xpath "//select[@name = '#{id}']/option[text() = '#{value}']"
end

Then /^the "([^"]*)" drop-down should not contain the option "([^"]*)"$/ do |id, value|
  page.should_not have_xpath "//select[@name = '#{id}']/option[text() = '#{value}']"
end

Then /^I click "([^"]*)" on the confirmation$/ do |action|
  if action == "Ok"
    page.driver.browser.switch_to.alert.accept
  elsif action == "Cancel"
    page.driver.browser.switch_to.alert.dismiss
  end
end

Then /^I click Ok on the next confirmation$/ do
  page.evaluate_script('window.confirm = function() { return true; }')
end

Given /^I click on item with xpath "([^"]*)"$/ do |path|
  find(:xpath, path).click
end

When /^I hover mouse over item with id "([^"]*)"$/ do |id|
  page.evaluate_script("$('##{id}').click();")
end

When /^I switch to new window$/ do
  page.driver.browser.switch_to.window(page.driver.browser.window_handles.last)
end

And /^I press key "(.*)" on "([^"]*)"$/ do |key, element|
  find("#{element}").native.send_keys(key.to_sym)
end
