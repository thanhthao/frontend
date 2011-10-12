with (Hasher.Controller('Search','Application')) {
  route({
    '#search': 'search'
  });

  create_action('search_box_changed', function() {
    if (Hasher.Routes.getHash() != '#search') {
      Hasher.Routes.setHash('#search');
      this.last_search_value = null;
    }
    
    var current_value = $('#form-search-input').val().toLowerCase().replace(/[^a-zA-Z0-9\-]/g,'');

    if (this.last_search_value && (this.last_search_value.indexOf(current_value) == 0)) {
      this.last_search_value = current_value;
    } else if (current_value && (this.last_search_value != current_value)) {
      this.last_search_value = current_value;


      if (this.search_timeout) {
        console.log('clear timeout')
        clearTimeout(this.search_timeout);
      }
      this.search_timeout = setTimeout(function() {
        Badger.domainSearch(current_value, function(resp) {
          $('#search-instructions').remove();
          $('#search-results tbody').prepend(helper('search_result_row', resp.data.domains));
        });
      }, 250);
    }
  });
  
  create_action('buy_domain', function(domain, form) {
    Badger.registerDomain({
      name: domain
    }, function() {
      call_action('Modal.hide');
    })
  });
  
  create_action('search', function() {
  });
  
  layout('dashboard');
}

with (Hasher.View('Search', 'Application')) { (function() {

  create_helper('search_result_row', function(results) {
    console.log(results)
    return tr(
      td(results[0][0].split('.')[0]),
      results.map(function(domain) {
        var tld = domain[0].split('.')[1];
        return domain[1] ? td({ 'class': 'tld' }, a({ href: action('Modal.show', 'Search.buy_domain_modal', domain[0]) }, tld))
                         : td({ 'class': 'tld' }, span({ style: 'text-decoration: line-through' }, tld));
      })
    );
  });


  create_view('search', function(domains) {
    return div(
      h1('Search Results'),
      table({ id: 'search-results', 'class': 'fancy-table' }, tbody()),
      div({ id: 'search-instructions' }, 'Start typing to search for available domains.')
    );
  });

  
  create_helper('buy_domain_modal', function(domain) {
    return [
      h1(domain),
      form({ action: action('buy_domain', domain) },
        div('Billing: ', 
          select({ name: 'billing' }, 
            option('XXXX-XXXX-XXXX-0000')
          )
        ),
        div('Registrant: ', 
          select({ style: 'width: 150px' },
            BadgerCache.cached_contacts.data.map(function(profile) {
              return option(profile.first_name + ' ' + profile.last_name + " (" + profile.address + ', ' + (profile.address2 ? profile.address2 + ', ' : '') + profile.city + ', ' + profile.state + ', ' + profile.zip + ")");
            })
          ),
          input({ type: 'checkbox', checked: 'checked' }), 'Whois Privacy'
        ),
        h2('Advanced'),
        
        div('Registration Length: ', 
          select(
            option('1 Year'), 
            option('2 Years'), 
            option('3 Years'),
            option('4 Years'),
            option('5 Years'),
            option('10 Years')
          ),
          input({ type: 'checkbox', checked: 'checked' }), 'Auto-renew'
        ),
        
        div('Technical Contact: ', 
          select({ style: 'width: 150px' },
            option('Same as Registrant'),
            BadgerCache.cached_contacts.data.map(function(profile) {
              return option(profile.first_name + ' ' + profile.last_name + " (" + profile.address + ', ' + (profile.address2 ? profile.address2 + ', ' : '') + profile.city + ', ' + profile.state + ', ' + profile.zip + ")");
            })
          )
        ),
        div('Administrative Contact: ', 
          select({ style: 'width: 150px' },
            option('Same as Registrant'),
            BadgerCache.cached_contacts.data.map(function(profile) {
              return option(profile.first_name + ' ' + profile.last_name + " (" + profile.address + ', ' + (profile.address2 ? profile.address2 + ', ' : '') + profile.city + ', ' + profile.state + ', ' + profile.zip + ")");
            })
          )
        ),
        div('Billing Contact: ', 
          select({ style: 'width: 150px' },
            option('Same as Registrant'),
            BadgerCache.cached_contacts.data.map(function(profile) {
              return option(profile.first_name + ' ' + profile.last_name + " (" + profile.address + ', ' + (profile.address2 ? profile.address2 + ', ' : '') + profile.city + ', ' + profile.state + ', ' + profile.zip + ")");
            })
          )
        ),
        div('DNS: ', select(option('Badger DNS'), option('EveryDNS'), option('DNS Simple'))),
        div({ style: "text-align: right; margin-top: 10px" }, button({ 'class': 'myButton' }, 'Purchase ' + domain))
      )
    ];
  });

})(); }
