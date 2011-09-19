with (Hasher.Controller('Dashboard','Application')) {
  route({
    '#': 'my_domains',
    '#search': 'search',
    '#search/': 'search',
    '#search/:term': 'search'
  });
  
  create_action('my_domains', function() {
    // hack... need to check sooner
    if (!Badger.getAccessToken()) {
      redirect_to('#request_invite');
    }
  });

  create_action('search', function(term) {
    render('search', term);
    console.log('SEARCH: ' + term);
  });
  
  layout('dashboard');
}

with (Hasher.View('Dashboard', 'Application')) { (function() {

  create_view('my_domains', function() {
    return div('Welcome!');
  });

  create_view('search', function(term) {
    return div('GOT SEARCH TERM: ' + term);
  });

})(); }
