with (Hasher.Controller('Search','Application')) {
  route({
    '#search': 'search'
  });
  
  create_action('search', function() {
  });
  
  layout('dashboard');
}

with (Hasher.View('Search', 'Application')) { (function() {

  create_view('search', function() {
    return div(
      h1('Search Results'),
      div({ id: 'search-results' })
    );
  });

})(); }
