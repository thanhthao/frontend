with (Hasher.Controller('Register','Application')) {

  create_action('show', function(domain) {
    BadgerCache.getContacts(function(results) {
      // ensure they have at least one whois contact
      if (results.data.length == 0) {
        call_action('Modal.show', 'Whois.edit_whois_modal', null, action('Register.show', domain));
      } else {
        BadgerCache.getAccountInfo(function(results) {
          // ensure they have at least one domain_credit
          if (results.data.domain_credits > 0) {
            call_action('Modal.show', 'Register.buy_domain_modal', domain);
          } else {
            call_action('Modal.show', 'Billing.purchase_modal', action('Register.show', domain))
          }
        });
      }
    });
  });


  create_action('buy_domain', function(form) {
    // prevent double submits            
    if ($('#register-button').attr('disabled')) return;
    else $('#register-button').attr('disabled', true);

    $('#errors').empty();
    Badger.registerDomain(form, function(response) {
      $('#register-button').attr('disabled', false);

      if (response.meta.status == 'ok') {
        helper('Application.update_credits', true);
        BadgerCache.flush('domains');
        BadgerCache.getDomains(function() {
          call_action('Modal.hide');
          redirect_to('#');
        })
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    })
  });
  
}


with (Hasher.View('Register', 'Application')) {

  create_helper('whois_contact_option', function(profile) {
    console.log(arguments)
    return option({ value: profile.id }, profile.first_name + ' ' + profile.last_name + (profile.organization ? ", " + profile.organization : '') + " (" + profile.address + (profile.address2 ? ', ' + profile.address2 : '') + ")");
  });

  create_helper('buy_domain_modal', function(domain) {
    return [
      h1(domain),
      div({ id: 'errors' }),
      form({ action: action('buy_domain') },
        input({ type: 'hidden', name: 'name', value: domain }),
      
        table({ style: 'width:100%' }, tbody(
          tr(
            td({ style: "width: 50%; vertical-align: top" },

            h3({ style: 'margin-bottom: 6px'}, 'Contact Information'),
              table(tbody(
                tr(
                  td('Registrant:'),
                  td(select({ name: 'registrant_contact_id', style: 'width: 150px' },
                    BadgerCache.cached_contacts.data.map(function(profile) { return helper('whois_contact_option', profile); })
                  ))
                ),
                tr(
                  td('Technical:'), 
                  td(select({ name: 'technical_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    BadgerCache.cached_contacts.data.map(function(profile) { return helper('whois_contact_option', profile); })
                  ))
                ),
                tr(
                  td('Administrator:'), 
                  td(select({ name: 'administrator_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    BadgerCache.cached_contacts.data.map(function(profile) { return helper('whois_contact_option', profile); })
                  ))
                ),
                tr(
                  td('Billing:'), 
                  td(select({ name: 'billing_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    BadgerCache.cached_contacts.data.map(function(profile) { return helper('whois_contact_option', profile); })
                  ))
                )
              )),
              div(
                input({ name: 'privacy', type: 'checkbox', checked: 'checked' }), 
                'Keep contact information private'
              )
            ),
            td({ style: "width: 50%; vertical-align: top" },
              h3({ style: 'margin-bottom: 6px'}, 'Advanced'),
              table(tbody(
                tr(
                  td('Length:'),
                  td(
                    select({ name: 'years', events: { change: function(e) { var years = $(e.target).val(); $('#register-button').html('Register ' + domain + ' for ' + years + (years == 1 ? ' credit' : ' credits')) } } },
                      option({ value: 1 }, '1 Year'), 
                      option({ value: 2 }, '2 Years'), 
                      option({ value: 3 }, '3 Years'),
                      option({ value: 4 }, '4 Years'),
                      option({ value: 5 }, '5 Years'),
                      option({ value: 10 }, '10 Years')
                    ),
                    input({ name: 'auto_renew', type: 'checkbox', checked: 'checked' }), 'Auto-renew'
                  )
                ),
                tr(
                  td('DNS:'),
                  td(
                    select({ name: 'name_servers' }, helper('DNS.dns_provider_options'))
                  )
                )
              ))
            )
          )
        )),
    
        div({ style: "text-align: right; margin-top: 10px" }, button({ 'class': 'myButton', id: 'register-button' }, 'Register ' + domain + ' for 1 credit'))
      )
    ];
  });

}