with (Hasher.Controller('Dashboard','Application')) {
  route({
    '#': 'my_domains',
    '#search': 'search',
    '#my-account': 'my_account',
    '#help-and-support': 'help_and_support'
  });
  
  create_action('my_domains', function() {
    Badger.getDomains(function(domains) {
      $('#my-domains').html(domains.join('<br/>'));
    });
  });

  create_action('search', function() {
  });
  
  layout('dashboard');
}

with (Hasher.View('Dashboard', 'Application')) { (function() {

  create_view('my_domains', function() {
    return div(
      h1('My Domains'),
      div({ id: 'my-domains' })
    );
  });

  create_view('my_account', function() {
    return div(
      h1('My Account'),
      'Welcome!'
    );
  });

  create_view('help_and_support', function() {
    return div(
      h1('Help and Support'),
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
