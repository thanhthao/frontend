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
        Application.load_domain(response.data.name, function(domain_object) {
          DomainApps.install_app_on_domain(Hasher.domain_apps["badger_web_forward"], domain_object);
          helper('Application.update_credits', true);
          hide_modal();
          set_route('#domains/' + domain);

          BadgerCache.flush('domains');
          BadgerCache.getDomains(function() { update_my_domains_count(); });
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
      h1('Register ', domain),
      div({ id: 'errors' }),
      p({ style: "margin-bottom: 0" }, "You'll be able to configure ", strong(domain), " on the next screen."),
      form({ action: action('buy_domain', domain) },
        input({ type: 'hidden', name: 'name', value: domain }),
        input({ type: 'hidden', name: 'auto_renew', value: 'true'}),
        input({ type: 'hidden', name: 'privacy', value: 'true'}),
        input({ type: 'hidden', name: 'name_servers', value: 'ns1.badger.com,ns2.badger.com'}),

        table({ style: 'width: 100%' }, tbody(
          tr(
            td({ style: "width: 50%" },
              h3({ style: 'margin-bottom: 0' }, 'Registrant:'),
              div(
                select({ name: 'registrant_contact_id', style: 'width: 150px' },
                  WhoisApp.profile_options_for_select()
                )
              )
            ),
            td({ style: "width: 50%" },
              h3({ style: 'margin-bottom: 0' }, 'Length:'),
              div(
                select({ name: 'years', onchange: function(e) { var years = $(e.target).val(); $('#register-button').val('Register ' + domain + ' for ' + years + (years == 1 ? ' credit' : ' credits')) } },
                  option({ value: 1 }, '1 Year'),
                  option({ value: 2 }, '2 Years'),
                  option({ value: 3 }, '3 Years'),
                  option({ value: 4 }, '4 Years'),
                  option({ value: 5 }, '5 Years'),
                  option({ value: 10 }, '10 Years')
                ),
                ' @ 1 credit per year'
              )
            )
          )
        )),
        
        div({ style: "text-align: center; margin-top: 30px" }, input({ 'class': 'myButton', id: 'register-button', type: 'submit', value: 'Register ' + domain + ' for 1 credit' }))
      )
    ];
  });

  // create_helper('successful_register_confirmation', function(domain) {
  //   return [
  //     h1("Congratulations!"),
  //     p("You've just registered ", strong(domain), ". Here are some things you can do:"),
  //     ul(
  //       li(a({ href: action('Register.open_link', "#domains/" + domain) }, "View domain details")),
  //       li(a({ href: action('Register.open_link', "#domains/" + domain + "/dns") }, "Modify DNS Settings")),
  //       li(a({ href: action('Register.open_link', "#domains/" + domain + "/whois") }, "Modify WHOIS Settings")),
  //       li(a({ href: action('Register.open_link', "#") }, "View all Domains"))
  //     )
  //   ];
  // });
}
