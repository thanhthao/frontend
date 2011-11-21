Given /^I mock domain search result for keys:$/ do |table|
  search_results = []
  table.hashes.each do |attributes|
    search_results << "case '#{attributes['key']}':
      callback({ data: { domains : [['#{attributes['key']}.com', #{attributes['com']}],['#{attributes['key']}.net', #{attributes['net']}]] } });
      break;"
  end
  domain = "acb"
  page.execute_script("Badger.domainSearch = function(query, use_serial, callback) {
    query = query.toString();
    switch (query) {
      //callback({ data: { domains : [['#{domain}.com', true],['#{domain}.net', true]] } });
      #{search_results.join("\n")}
    }
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

Given /^I mock getAccessToken return with "([^"]*)"$/ do |token|
  page.execute_script("Badger.getAccessToken = function() {
    return '#{token}';
  };")
end

Given /^I mock login$/ do
  page.execute_script("Badger.login = function(email, password, callback) {
    Badger.setAccessToken('2.1321519972.2e2cf079401b1c46cf748b80637610719a8ab693a');
    if (callback) callback({meta : {status : 'ok'}});
    for (var i=0; i < Badger.login_callbacks.length; i++) Badger.login_callbacks[i].call(null);
  };")
end

Given /^I mock getDomains with ([^"]*) normal domains, ([^"]*) in transfer domain and ([^"]*) expiring soon domains$/ do |normal, transfer, expire|
  domains = []
  normal.to_i.times do |i|
    domains << "{ name: 'mydomain#{i}.com', status: 'active', expires: '2012-11-16T04:21:43Z' }"
  end
  transfer.to_i.times do |i|
    domains << "{ name: 'transfer#{i}.com', status: 'pending_transfer_in', expires: '2012-11-16T04:21:43Z' }"
  end
  expire.to_i.times do |i|
    domains << "{ name: 'expiresoon#{i}.com', status: 'active', expires: '2011-11-30T04:21:43Z' }"
  end
  page.execute_script("Badger.getDomains = function(callback) {
    callback([#{domains.join(',')}]);
  };")

  page.execute_script(" BadgerCache.cached_domains = null;");
end

Given /^I mock getAccountInfo$/ do
  page.execute_script("Badger.accountInfo = function(callback) {
    callback({data : {domain_credits: 35, name: 'East Agile Company'}, meta : {status: 'ok'}});
  };")
end

Given /^I mock getContacts$/ do
  page.execute_script("Badger.getContacts = function(callback) {
    callback({data : [{ address: 'My address', address2: '', city: 'HCM', country: 'VN', created_at: '2011-11-12T14:29:26Z',
                      email: 'tester@eastagile.com', fax: '', first_name: 'East', id: 4, last_name: 'Agile Company', organization: '',
                      phone: '123456789', state: '1', zip: '084'}]})
  };")
end

Given /^I mock getPaymentMethods$/ do
  page.execute_script("Badger.getPaymentMethods = function(callback) {
    callback({data: {id : 5, name: 'Visa (411111******1111 01/2012)'}});
  };")
end

Given /^I mock createAccount$/ do
  page.execute_script("Badger.createAccount = function(data, callback){
    Badger.setAccessToken('2.1321519972.2e2cf079401b1c46cf748b80637610719a8ab693a');
    callback({meta : {status : 'ok'}});
  };")
end
