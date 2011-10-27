with (Hasher.Controller('Domains','Application')) {
  route({
    '#': 'index',
    '#domains/:domain': 'show',
    '#domains/:domain/whois': 'whois'
  });
  
  create_action('show', function(domain) {
    render('show', domain);
    
    Badger.getDomain(domain, function(response) {
      console.log(response)
      render('show_with_data', domain, response.data);
    });
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
          li(a({ href: action('Transfer.show') }, "Transfer a domain from another registrar"))
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
      h1(domain),
      p('Loading data for ' + domain + '...')
    );
  });

  create_view('show_with_data', function(domain, data) {
    return div(
      h1(domain),
      table({ style: 'width: 100%' }, tbody(
        tr(
            td({ style: 'width: 50%; vertical-align: top; padding-right: 20px; border-right: 1px solid #ddd' },

            h2('Common Actions'),
            ul(
              li(a({ href: '#domains/' + data.name + '/dns' }, 'View Public Whois Record')),
              li(a({ href: '#domains/' + data.name + '/dns' }, 'Lock/Unlock Domain')),
              ((data.name_servers).join(',') == 'ns1.badger.com,ns2.badger.com') && li(a({ href: '#domains/' + data.name + '/dns' }, 'Manage Badger DNS'))
            ),

            h2('Dates'),
            dl(
              dt('Created At: '), dd(data.created_at),
              dt('Updated At: '), dd(data.updated_at),
              dt('Expires On: '), dd(data.expires_on),
              dt('Registered On: '), dd(data.registered_on),
              dt('Updated On: '), dd(data.updated_on)
            ),

            h2('Name Servers'),
            ul(
              data.name_servers.map(function(server) {
                return li(server);
              })
            ),

            h2('Misc'),
            dl(
              dt('ID: '), dd(data.id),
              dt('Status: '), dd(data.status),
              dt('Created registrar: '), dd(data.created_registrar),
              dt('Losing registrar: '), dd(data.losing_registrar)
            )
          ),

          td({ style: 'width: 50%; vertical-align: top; padding-left: 20px;' },
            h2('Registrant'),
            helper('whois_contact', data.registrant_contact),

            h2('Administrative Contact'),
            helper('whois_contact', data.administrator_contact),

            h2('Technical Contact'),
            helper('whois_contact', data.technical_contact),

            h2('Billing Contact'),
            helper('whois_contact', data.billing_contact)
          )
        )
      ))
    );
  });
  
  create_helper('whois_contact', function(whois) {
    return div(
      div(whois.first_name, ' ', whois.last_name),
      (whois.organization && div(whois.organization)),
      (whois.address && div(whois.address)),
      (whois.address2 && div(whois.address2)),
      div(whois.city, ', ', whois.state, ', ', whois.zip, ', ', whois.country),
      div('Email: ', whois.email),
      div('Phone: ', whois.phone),
      (whois.phone && div('Fax: ', whois.phone))
    );
  });

  create_view('whois', function(domain) {
    return div(
      h1(domain + ' WHOIS')
    );
  });

})(); }
