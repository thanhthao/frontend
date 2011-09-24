with (Hasher.Controller('Dashboard','Application')) {
  route({
    '#': 'my_domains',
    '#search': 'search',
    '#account': 'my_account',
    '#account/settings': 'account_settings',
    '#account/profiles': 'account_profiles',
    '#account/billing': 'account_billing',
    '#help-and-support': 'help_and_support',
    '#knowledge-base': 'knowledge_base',
    '#tickets': 'tickets'
  });
  
  create_action('my_domains', function() {
    Badger.getDomains(function(domains) {
      render('my_domains', domains);
    });
  });

  create_action('search', function() {
  });
  
  layout('dashboard');
}

with (Hasher.View('Dashboard', 'Application')) { (function() {

  create_view('my_domains', function(domains) {
    return div(
      h1('My Domains'),
      div({ id: 'my-domains' },
        ul(
          (domains || []).map(function(domain) {
            return li(a({ href: '#domains/' + domain }, domain));
          })
        )
      )
    );
  });

  create_view('my_account', function() {
    return div(
      h1('My Account'),
      'Welcome!'
    );
  });

  create_view('account_settings', function() {
    return div(
      h1('My Account: Settings'),
      'Welcome!'
    );
  });

  create_view('account_profiles', function() {
    return div(
      h1('My Account: Profiles'),
      'Welcome!'
    );
  });

  create_view('account_billing', function() {
    return div(
      h1('My Account: Billing'),
      'Welcome!'
    );
  });

  create_view('help_and_support', function() {
    return div(
      h1('Help and Support'),
      'Welcome!'
    );
  });

  create_view('knowledge_base', function() {
    return div(
      h1('Knowledge Base'),
      'Welcome!'
    );
  });

  create_view('tickets', function() {
    return div(
      h1('Support Tickets'),
      'Welcome!'
    );
  });

  create_view('search', function() {
    return div(
      h1('Search Results'),
      div({ id: 'search-results' })
    );
  });

})(); }
