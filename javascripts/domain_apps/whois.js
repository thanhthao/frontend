with (Hasher('Whois','Application')) {

  register_domain_app({
    id: 'badger_whois',
    name: 'WHOIS',
    menu_item: { text: 'WHOIS', href: '#domains/:domain/whois' },
    requires: {
      registrar: 'badger'
    }
  });


  route({
    '#domains/:domain/whois': 'whois'
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

  create_view('whois_loading', function(domain_name) {
    return div(
      h1(domain_name + ' WHOIS'),
      'Loading... please wait.'
    );
  });

  create_helper('profile_options_for_select', function(selected_id) {
    return BadgerCache.cached_contacts.data.map(function(profile) { 
      var opts = { value: profile.id };
      if (''+profile.id == ''+selected_id) opts['selected'] = 'selected';
      return option(opts, profile.first_name + ' ' + profile.last_name + (profile.organization ? ", " + profile.organization : '') + " (" + profile.address + (profile.address2 ? ', ' + profile.address2 : '') + ")");
    });
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

  layout('dashboard');
}