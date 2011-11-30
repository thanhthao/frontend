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

Given /^I mock accountInfo with ([^"]*) domain credits and ([^"]*) invites available$/ do |domain_credits, invites_available|
  page.execute_script("Badger.accountInfo = function(callback) {
    callback({data : {domain_credits: #{domain_credits}, name: 'East Agile Company', invites_available: #{invites_available}}, meta : {status: 'ok'}});
  };
 ")
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

Given /^I mock sendEmail$/ do
  page.execute_script("Badger.sendEmail = function(subject, body, callback) {
    //return nothing
  };")
end

Given /^I mock getDomain$/ do
  page.execute_script("Badger.getDomain = function(name, callback){
    callback({ data: {expires_on: '2011-11-30T04:21:43Z', status: 'active', registered_on: '2011-10-30T04:21:43Z',
                created_at: '2011-10-30T04:21:43Z', updated_at: '2011-10-30T04:21:43Z', updated_on: '2011-10-30T04:21:43Z',
                name_servers: ['ns1.badger.com', 'ns2.badger.com'], created_registrar: 'rhino',
                whois: 'The data contained in this whois database is provided \"as is\" with no guarantee or warranties regarding its accuracy.',
                registrant_contact: { address: 'My address', address2: '', city: 'HCM', country: 'VN', created_at: '2011-11-12T14:29:26Z',
                      email: 'tester@eastagile.com', fax: '', first_name: 'East', id: 4, last_name: 'Agile Company', organization: '',
                      phone: '123456789', state: '1', zip: '084' } }});
  };")
end

Given /^I mock getRecords with empty records$/ do
  page.execute_script("Badger.getRecords = function(name, callback){
    callback([]);
  };")
end

Given /^I mock sendInvite with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.sendInvite = function(data, callback){
    callback({ meta : {status: '#{status}'}, data : { message: 'Notification message' } });
  };")
end

Given /^I mock confirmEmail with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.confirmEmail = function(code, callback){
    setTimeout(function() { callback({ meta : {status: '#{status}'}, data : { message: 'Confirmation Email Notification message' } }); }, 250);
  };")
end

Given /^I mock requestInvite with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.requestInvite = function(email, callback){
    setTimeout(function() {callback({ meta : {status: '#{status}'}, data : { #{status == "ok" ? "message: 'Ok', invite_request_id: '1'" : "message: 'Invalid email address'" } } }); }, 250);
  };")
end

Given /^I mock requestInviteExtraInfo with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.requestInviteExtraInfo = function(data, callback){
    setTimeout(function() {callback({ meta : {status: '#{status}'}, data : { message: 'Ok' } }); }, 250);
  };")
end
