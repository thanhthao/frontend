Given /^I have search result for "([^"]*)"$/ do |domain|
  page.execute_script("Badger.domainSearch = function(query, callback) {
    callback({ data: { domains : [['#{domain}.com', true],['#{domain}.net', true]] } });
  };")
end

Given /^I successfully register a domain$/ do
  page.execute_script("Badger.registerDomain = function(data, callback) {
     callback.call(null,{ meta: {status: 'created'}, data: 'ok', domainmessage: 'true' });
  };")
end
