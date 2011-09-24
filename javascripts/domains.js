with (Hasher.Controller('Dashboard','Application')) {
  route({
    '#domains/:domain': 'show'
  });
  
  create_action('show', function(domain) {
    console.log('show domain:' + domain);
    render('show', domain);
  });

  layout('dashboard');
}

with (Hasher.View('Dashboard', 'Application')) { (function() {

  create_view('show', function(domain) {
    return div(
      h1(domain)
    );
  });

})(); }
