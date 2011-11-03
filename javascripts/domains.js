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
    form_data['privacy'] = form_data['privacy'] ? 'true' : 'false';
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
      dl({ 'class': 'fancy-dl' },
        dt('Expires:'), dd(new Date(data.expires_on).toDateString()),
        dt('Status: '), dd(data.status),
        dt('Registered:'), dd(new Date(data.registered_on).toDateString(), (data.created_registrar ? ' via '+data.created_registrar : '')),
        dt('Previous Registrar: '), dd(data.losing_registrar),
        dt('Created At: '), dd(new Date(data.created_at).toDateString()),
        dt('Updated At: '), dd(new Date(data.updated_at).toDateString()),
        dt('Updated On: '), dd(new Date(data.updated_on).toDateString())
      )
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
            div({ style: 'border: 1px solid #ccc; width: 409px; overflow: hidden; overflow: auto; white-space: pre; padding: 5px; background: #f0f0f0' }, domain.whois)
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
