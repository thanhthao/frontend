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

  create_action('whois', function(domain_name) {
    Badger.getContacts(function() {
      Badger.getDomain(domain_name, function(response) {
        render('whois', response.data);
      });
    });
    render('whois_loading', domain_name);
  });

  create_action('update_whois', function(domain, form_data) {
    // force sends a "privacy=false"... exclusion isn't enough
    form_data['privacy'] = !!form_data['privacy'];
    Badger.updateDomain(domain.name, form_data, function(response) {
      console.log(response);
      call_action('whois', domain.name);
    });
  });
  

  layout('dashboard');
}

with (Hasher.View('Domains', 'Application')) { (function() {

  create_view('index', function(domains) {
    return div(
      h1('My Domains'),

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
                  a({ href: '#domains/' + domain.name + '/dns' }, 'dns'),
                  ' ', 
                  a({ href: '#domains/' + domain.name + '/whois' }, 'whois')
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
            dl(
              dt('ID: '), dd(data.id),
              dt('Status: '), dd(data.status),
              dt('Created registrar: '), dd(data.created_registrar),
              dt('Losing registrar: '), dd(data.losing_registrar)
            )
          ),

          td({ style: 'width: 50%; vertical-align: top; padding-left: 20px;' },
            dl(
              dt('Created At: '), dd(data.created_at),
              dt('Updated At: '), dd(data.updated_at),
              dt('Expires On: '), dd(data.expires_on),
              dt('Registered On: '), dd(data.registered_on),
              dt('Updated On: '), dd(data.updated_on)
            )
          )
        )
      ))
    );
  });
  
  create_view('whois_loading', function(domain_name) {
    return div(
      h1(domain_name + ' WHOIS'),
      'Loading... please wait.'
    );
  });  

  create_view('whois', function(domain) {
    return div(
      h1(domain.name + ' WHOIS'),
      
      table({ style: 'width: 100% '}, tbody(
        tr(
          td({ style: 'vertical-align: top; padding-right: 20px'},
            h2('Public Listing'),
            div({ style: 'border: 1px solid #ccc; width: 400px; overflow: hidden; overflow: auto; white-space: pre; padding: 5px; background: #f0f0f0' }, domain.whois)
          ), 
          td({ style: 'vertical-align: top'},
            h2('Make Changes'),

            form({ action: action('update_whois', domain) },
              table(tbody(
                tr(
                  td('Registrant:'),
                  td(select({ name: 'registrant_contact_id', style: 'width: 150px' },
                    helper('Whois.profile_options_for_select', domain.registrant_contact.id)
                  ))
                ),
                tr(
                  td('Administrator:'), 
                  td(select({ name: 'administrator_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    helper('Whois.profile_options_for_select', domain.administrator_contact && domain.administrator_contact.id)
                  ))
                ),
                tr(
                  td('Billing:'), 
                  td(select({ name: 'billing_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    helper('Whois.profile_options_for_select', domain.billing_contact && domain.billing_contact.id)
                  ))
                ),
                tr(
                  td('Technical:'), 
                  td(select({ name: 'technical_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    helper('Whois.profile_options_for_select', domain.technical_contact && domain.technical_contact.id)
                  ))
                )
              )),
              div(
                (domain.privacy ? input({ name: 'privacy', type: 'checkbox', checked: 'checked' }) : input({ name: 'privacy', type: 'checkbox' })),
                'Keep contact information private'
              ),

              div({ style: "text-align: right" },
                input({ type: 'submit', 'class': 'myButton myButton-small', value: 'Save' })
              )
            )

          )
        )
      ))
    );
  });

})(); }
