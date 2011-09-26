with (Hasher.Controller('Search','Application')) {
  route({
    '#search': 'search'
  });

  create_action('search_box_changed', function() {
    if (Hasher.Routes.getHash() != '#search') {
      Hasher.Routes.setHash('#search');
      this.last_search_value = null;
    }
    
    var current_value = $('#form-search-input').val();

    if (current_value && (this.last_search_value != current_value)) {
      this.last_search_value = current_value;

      if (this.search_timeout) {
        console.log('clear timeout')
        clearTimeout(this.search_timeout);
      }
      this.search_timeout = setTimeout(function() {
        Badger.domainSearch(current_value, function(resp) {
          render('search', resp.data);
        });
      }, 150);
    }
  });
  
  create_action('search', function() {
  });
  
  layout('dashboard');
}

with (Hasher.View('Search', 'Application')) { (function() {

  create_view('search', function(domains) {
    return div(
      h1('Search Results'),
      div(
        (domains||[]).map(function(domain) {
          return div(domain[0], ' -- ', domain[1]);
        })
      )
    );
  });

})(); }
