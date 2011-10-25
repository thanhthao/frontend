with (Hasher.Controller('Domains','Application')) {
  route({
    '#': 'index',
    '#domains/:domain': 'show',
    '#domains/:domain/whois': 'whois'
  });
  
  create_action('show', function(domain) {
    console.log('show domain:' + domain);
    render('show', domain);
  });

  create_action('index', function() {
    BadgerCache.getDomains(function(domains) {
      render('index', domains);
    });
  });

  layout('dashboard');
}

with (Hasher.View('Domains', 'Application')) { (function() {

  create_view('index', function(domains) {
    return div(
      h1('My Domains'),

      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Transfer.show') }, 'Transfer in a Domain')
      ),
      
      (typeof domains == 'undefined') ? [
        div('Loading domains...')
      ]:((domains.length == 0) ? [
        div("It looks like you don't have any domains registered with us yet. You should probably:"),
        ul(
          li(a({ href: function() { $('#form-search-input').focus(); } }, "Search for a new domain")),
          li(a({ href: '#domain-transfers' }, "Transfer a domain from another registrar"))
        ),
        div("Then this page will be a lot more fun.")
      ]:[
        table({ 'class': 'fancy-table' },
          tbody(
            tr({ 'class': 'table-header' },
              th('Name'),
              th('Status'),
              th('Expires'),
              th('Links')
            ),

            (domains || []).map(function(domain) {
              return tr(
                td(a({ href: '#domains/' + domain.name }, domain.name)),
                td(domain.status),
                td(new Date(domain.expires).toDateString()),
                td(
                  a({ href: '#domains/' + domain.name + '/dns' }, 'DNS')
                )
              );
            })
          )
        )
      ])
    );
  });

  create_view('show', function(domain) {
    return div(
      h1(domain)
    );
  });

  create_view('whois', function(domain) {
    return div(
      h1(domain + ' WHOIS')
    );
  });

})(); }
