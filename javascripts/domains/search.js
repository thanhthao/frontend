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

		var search_callback = function() {
      Badger.domainSearch(current_value, true, function(resp) {
        $('#bulk-transfer-link').removeClass('hidden');
        $('#search-instructions').remove();
        var most_recent_result = $('#search-results tbody tr:first td:first').text();
        if (resp.data.domains[0][0].indexOf(most_recent_result) == 0) {
          $('#search-results tbody tr:first').remove();
        }
        $('#search-results tbody').prepend(helper('search_result_row', resp.data.domains));
      });
    };

    if (this.search_timeout) clearTimeout(this.search_timeout);
    if (this.backspace_search_timeout) clearTimeout(this.backspace_search_timeout);

    if (current_value && this.last_search_value && (this.last_search_value.indexOf(current_value) == 0)) {
      this.backspace_search_timeout = setTimeout(search_callback, 750);
    } else if (current_value && (this.last_search_value != current_value)) {
      this.search_timeout = setTimeout(search_callback, 100);
    }

    this.last_search_value = current_value;
  });
  
  create_action('search', function() {
  });
  
  layout('dashboard');
}

with (Hasher.View('Search', 'Application')) {

  create_helper('search_result_row', function(results) {
    console.log(results)
    return tr(
      td(results[0][0].split('.')[0]),
      results.map(function(domain) {
        var tld = domain[0].split('.')[1];
        return domain[1] ? td({ 'class': 'tld' }, a({ href: action('Register.show', domain[0]) }, tld))
                         : td({ 'class': 'tld' }, span({ style: 'text-decoration: line-through' }, tld));
      })
    );
  });


  create_view('search', function(domains) {
    return div(
      h1('Search Results'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Transfer.show') }, 'Transfer in a Domain')
      ),
      p({ id: 'bulk-transfer-link', 'class': 'hidden' },
        span('If you would like to register many domains at once, try our '),
        a({ href: action('BulkRegister.show') }, 'Bulk Register'),
        span(' tool.')
      ),

      table({ id: 'search-results', 'class': 'fancy-table' }, tbody()),
      div({ id: 'search-instructions' }, 'Start typing to search for available domains.')
    );
  });


}
