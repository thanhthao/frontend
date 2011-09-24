with (Hasher.Controller('Domains','Application')) {
  route({
    '#': 'index',
    '#domains/:domain': 'show'
  });
  
  create_action('show', function(domain) {
    console.log('show domain:' + domain);
    render('show', domain);
  });

  create_action('index', function() {
    Badger.getDomains(function(domains) {
      render('index', domains);
    });
  });

  layout('dashboard');
}

with (Hasher.View('Domains', 'Application')) { (function() {

  create_view('index', function(domains) {
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

  create_view('show', function(domain) {
    return div(
      h1(domain)
    );
  });

})(); }
