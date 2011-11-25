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


  create_action('buy_domain', function(domain, form) {
    // prevent double submits
    if ($('#register-button').attr('disabled')) return;
    else $('#register-button').attr('disabled', true);

    $('#errors').empty();
    Badger.registerDomain(form, function(response) {
      $('#register-button').attr('disabled', false);

      if (response.meta.status == 'created') {
        helper('Application.update_credits', true);
        BadgerCache.flush('domains');
        BadgerCache.getDomains(function() {
          call_action('Modal.show', 'Register.successful_register_confirmation', domain);
        })
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    })
  });

  create_action('open_link', function(url) {
    call_action('Modal.hide');
    redirect_to(url);
  });
}


with (Hasher.View('Register', 'Application')) {

  create_helper('buy_domain_modal', function(domain) {
    return [
      h1(domain),
      div({ id: 'errors' }),
      form({ action: action('buy_domain', domain) },
        input({ type: 'hidden', name: 'name', value: domain }),

        table({ style: 'width:100%' }, tbody(
          tr(
            td({ style: "width: 50%; vertical-align: top" },

            h3({ style: 'margin-bottom: 6px'}, 'Contact Information'),
              table(tbody(
                tr(
                  td('Registrant:'),
                  td(select({ name: 'registrant_contact_id', style: 'width: 150px' },
                    helper('Whois.profile_options_for_select')
                  ))
                ),
                tr(
                  td('Administrator:'),
                  td(select({ name: 'administrator_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    helper('Whois.profile_options_for_select')
                  ))
                ),
                tr(
                  td('Billing:'),
                  td(select({ name: 'billing_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    helper('Whois.profile_options_for_select')
                  ))
                ),
                tr(
                  td('Technical:'),
                  td(select({ name: 'technical_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    helper('Whois.profile_options_for_select')
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

        div({ style: "text-align: right; margin-top: 10px" }, input({ 'class': 'myButton', id: 'register-button', type: 'submit', value: 'Register ' + domain + ' for 1 credit' }))
      )
    ];
  });

  create_helper('successful_register_confirmation', function(domain) {
    return [
      h1("Congratulations!"),
      p("You've just registered ", strong(domain), ". Here are some things you can do:"),
      ul(
        li(a({ href: action('Register.open_link', "#domains/" + domain) }, "View domain details")),
        li(a({ href: action('Register.open_link', "#domains/" + domain + "/dns") }, "Modify DNS Settings")),
        li(a({ href: action('Register.open_link', "#domains/" + domain + "/whois") }, "Modify WHOIS Settings")),
        li(a({ href: action('Register.open_link', "#") }, "View all Domains"))
      )
    ];
  });
}
