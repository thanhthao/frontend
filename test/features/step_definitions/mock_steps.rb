Given /^I mock domain search result for key "([^"]*)"$/ do |domain|
  page.execute_script("Badger.domainSearch = function(query, callback) {
    callback({ data: { domains : [['#{domain}.com', true],['#{domain}.net', true]] } });
  };")
end

Given /^I mock registerDomain api$/ do
  page.execute_script("Badger.registerDomain = function(data, callback) {
     callback.call(null,{ meta: {status: 'created'}, data: 'ok', domainmessage: 'true' });
  };")
end

Given /^I mock getDomainInfo api for domain with registrar name "([^"]*)"$/ do |registrar_name|
  page.execute_script("Badger.getDomainInfo = function(data, callback) {
     callback({data : {code: 1000, locked: false, pending_transfer: false, registrar: {name: '#{registrar_name}' }}, meta : {status: 'ok'}});
  };")
end
