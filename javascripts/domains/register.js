with (Hasher('Register','Application')) {

  define('show', function(domain) {
    if (!Badger.getAccessToken()) {
      Signup.require_user_modal(curry(curry(Register.show, domain)));
      return;
    }
    
    BadgerCache.getContacts(function(results) {
      // ensure they have at least one whois contact
      if (results.data.length == 0) {
        show_modal('Whois.edit_whois_modal', null, curry(Register.show, domain));
      } else {
        BadgerCache.getAccountInfo(function(results) {
          // ensure they have at least one domain_credit
          if (results.data.domain_credits > 0) {
            buy_domain_modal(domain);
          } else {
            Billing.purchase_modal(curry(Register.show, domain))
          }
        });
      }
    });
  });


  define('buy_domain', function(domain, form) {
    $('#errors').empty();
    Badger.registerDomain(form, spin_modal_until(function(response) {
      if (response.meta.status == 'created') {
        Application.load_domain(response.data.name, function(domain_object) {
          DomainApps.install_app_on_domain(Hasher.domain_apps["badger_web_forward"], domain_object);
          Application.update_credits(true);
          hide_modal();
          set_route('#domains/' + domain);

          BadgerCache.flush('domains');
          BadgerCache.getDomains(function() { update_my_domains_count(); });
        })
      } else {
        $('#errors').empty().append(Application.error_message(response));
      }
    }))
  });

  define('open_link', function(url) {
    hide_modal();
    set_route(url);
  });
}


with (Hasher('Register', 'Application')) {

  define('buy_domain_modal', function(domain) {
    show_modal(
      h1({ 'class': 'long-domain-name'}, 'Register ', domain),
      div({ id: 'errors' }),
      p({ style: "margin-bottom: 0" }, "You'll be able to configure ", strong(Domains.truncate_domain_name(domain, 50)), " on the next screen."),
      form({ action: curry(buy_domain, domain) },
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
        
        div({ style: "text-align: center; margin-top: 30px" }, input({ 'class': 'myButton', id: 'register-button', type: 'submit', value: 'Register ' + Domains.truncate_domain_name(domain) + ' for 1 credit' }))
      )
    );
  });

  // define('successful_register_confirmation', function(domain) {
  //   return [
  //     h1("Congratulations!"),
  //     p("You've just registered ", strong(domain), ". Here are some things you can do:"),
  //     ul(
  //       li(a({ href: curry(Register.open_link, "#domains/" + domain) }, "View domain details")),
  //       li(a({ href: curry(Register.open_link, "#domains/" + domain + "/dns") }, "Modify DNS Settings")),
  //       li(a({ href: curry(Register.open_link, "#domains/" + domain + "/whois") }, "Modify WHOIS Settings")),
  //       li(a({ href: curry(Register.open_link, "#") }, "View all Domains"))
  //     )
  //   ];
  // });
}
