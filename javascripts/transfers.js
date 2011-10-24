with (Hasher.Controller('Transfers','Application')) {
  route({
    '#domain-transfers': 'index'
  });
  
  create_action('index', function() {
    Badger.getPendingTransfers(function(results) {
      render('index', results.data);
    });
  });

  create_action('initiate_transfer', function() {
//    Badger.getPendingTransfers(function(results) {
    
  });

  layout('dashboard');
}

with (Hasher.View('Transfers', 'Application')) { (function() {

  create_view('index', function(transfers) {
    return div(
      h1('Domain Transfers'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Transfers.initiate_new_transfer') }, 'Initiate New Transfer')
      ),
      
      (typeof transfers == 'undefined') ? [
        div('Loading transfers...')
      ]:((transfers.length == 0) ? [
        div("There are no pending domain transfers.  If you'd like to transfer a domain that you already own from another registrar, click the \"Initiate New Transfer\" above.")
      ]:[
        table({ 'class': 'fancy-table' },
          tbody(
            transfers.map(function(transfer) {
              return tr(
  							td(transfer.domain),
  							td(transfer.status)
              );
            })
          )
        )
      ])
    );
  });

  create_helper('whois_contact_option', function(profile) {
    console.log(arguments)
    return option({ value: profile.id }, profile.first_name + ' ' + profile.last_name + (profile.organization ? ", " + profile.organization : '') + " (" + profile.address + (profile.address2 ? ', ' + profile.address2 : '') + ")");
  });

  create_helper('initiate_new_transfer', function(data) {
    data = data || {};
    return form({ action: action('Search.buy_domain') },
      h1('Initiate New Transfer'),
      div({ id: 'errors' }),

      table({ style: 'width:100%' }, tbody(
        tr(
          td({ style: "width: 50%; vertical-align: top" },

            h3({ style: 'margin-bottom: 6px'}, 'Domain Authorization'),
            div('Domain: ', input({ name: 'name', placeholder: 'example.com' })),
            div('Auth Code: ', input({ name: 'auth_code', placeholder: 'abc123' })),

            h3({ style: 'margin-bottom: 6px'}, 'Billing'),
            div('Payment Method: ', 
              select({ name: 'payment_method_id' }, 
    						((BadgerCache.cached_payment_methods && BadgerCache.cached_payment_methods.data) || []).map(function(payment_method) { return option({value: payment_method.id}, payment_method.name); })
              )
            ),

            h3({ style: 'margin-bottom: 6px'}, 'Advanced'),
            div('DNS: ', 
              select({ name: 'name_servers' },
                option({ value: 'ns1.badger.com,ns2.badger.com' }, 'Badger DNS (recommended)')
                // option({ value: 'todo' }, 'easyDNS'),
                // option({ value: 'todo' }, 'EveryDNS'),
                // option({ value: 'todo' }, 'DNSMadeEasy'),
                // option({ value: 'todo' }, 'DynDNS'),
                // option({ value: 'todo' }, 'NO-IP'),
                // option({ value: 'todo' }, 'PowerDNS'),
                // option({ value: 'todo' }, 'UltraDNS'),
                // option({ value: 'todo' }, 'Zerigo'),
                // option({ value: 'todo' }, 'ZoneEdit')
              )
            )
          ),
          td({ style: "width: 50%; vertical-align: top" },
            h3({ style: 'margin-bottom: 6px'}, 'Contact Information'),
            div('Registrant: ', 
              select({ name: 'registrant_contact_id', style: 'width: 150px' },
                ((BadgerCache.cached_contacts && BadgerCache.cached_contacts.data) || []).map(function(profile) { return helper('whois_contact_option', profile); })
              )
              // ' ',
              // input({ type: 'checkbox', checked: 'checked' }), 'Whois Privacy'
            ),
            div('Technical: ', 
              select({ name: 'technical_contact_id', style: 'width: 150px' },
                option({ value: '' }, 'Same as Registrant'),
                ((BadgerCache.cached_contacts && BadgerCache.cached_contacts.data) || []).map(function(profile) { return helper('whois_contact_option', profile); })
              )
            ),
            div('Administrator: ', 
              select({ name: 'administrator_contact_id', style: 'width: 150px' },
                option({ value: '' }, 'Same as Registrant'),
                ((BadgerCache.cached_contacts && BadgerCache.cached_contacts.data) || []).map(function(profile) { return helper('whois_contact_option', profile); })
              )
            ),
            div('Billing: ', 
              select({ name: 'billing_contact_id', style: 'width: 150px' },
                option({ value: '' }, 'Same as Registrant'),
                ((BadgerCache.cached_contacts && BadgerCache.cached_contacts.data) || []).map(function(profile) { return helper('whois_contact_option', profile); })
              )
            )
          )
        )
      )),

      div({ style: 'text-align: right; margin-top: 10px' }, button({ 'class': 'myButton' }, 'Initiate Transfer'))
    );
  });

})(); }

