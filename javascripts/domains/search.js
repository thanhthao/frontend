with (Hasher('Search','Application')) {
  route('#search', function() {
    render(
      div(
        h1('Search Results'),
        div({ style: 'float: right; margin-top: -44px' },
          a({ 'class': 'myButton small', href: Transfer.show }, 'Transfer in a Domain')
        ),
        table({ id: 'search-results', 'class': 'fancy-table' }, tbody()),
        div({ id: 'search-instructions' },
          p('Start typing to search for available domains.'),
          p('If you would like to register many domains at once, try our ', a({ href: curry(Transfer.show, 'register') }, 'Bulk Register Tool'), '.')
        )
      )
    );
  });

  define('set_search_route', function() {
    if (get_route() != '#search') {
      set_route('#search');
      this.last_search_value = null;
    }
  })

  define('search_box_changed', function() {
    set_search_route();

    var current_value = $('#form-search-input').val().toLowerCase().replace(/[^a-zA-Z0-9\-\.]/g,'').split('.')[0];

		var search_callback = function() {
      Badger.domainSearch(current_value, true, function(resp) {
        $('#search-instructions').remove();
        var most_recent_result = $('#search-results tbody tr:first td:first').text();
        if (resp.data.domains[0][0].indexOf(most_recent_result) == 0) {
          $('#search-results tbody tr:first').remove();
        }
        $('#search-results tbody').prepend(search_result_row(resp.data.domains));
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

  define('search_result_row', function(results) {
    var available_extensions = $.grep(results, function(ext) {
      return ext[1];
    });
    return tr(
      td(results[0][0].split('.')[0]),
      results.map(function(domain) {
        var tld = domain[0].split('.')[1];
        return domain[1] ? td({ 'class': 'tld' }, a({ href: curry(Register.show, domain[0], $.grep(available_extensions, function(ext) { return ext != domain })) }, tld))
                         : td({ 'class': 'tld' }, span({ style: 'text-decoration: line-through' }, tld));
      })
    );
  });


}
