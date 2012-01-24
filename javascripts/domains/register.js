with (Hasher('Register','Application')) {


  define('show', function(domain, available_extensions) {
    if (!Badger.getAccessToken()) {
      Signup.require_user_modal(curry(Register.show, domain, available_extensions));
      return;
    }

    BadgerCache.getContacts(function(results) {
      // ensure they have at least one whois contact
      if (results.data.length == 0) {
        Whois.edit_whois_modal(null, curry(Register.show, domain, available_extensions));
      } else {
        buy_domain_modal(domain, available_extensions);
      }
    });
  });

  define('buy_domain', function(domain, available_extensions, form_data) {
    var checked_extensions = $.grep(available_extensions, function(ext) {
      return form_data["extension_" + ext[0].split('.')[1]] != null;
    })
    checked_extensions = [domain].concat(checked_extensions.map(function(ext) { return ext[0]; }));

    BadgerCache.getAccountInfo(function(results) {
      var needed_credits = checked_extensions.length * form_data.years;
      var current_credits = results.data.domain_credits;
      
      if (current_credits >= needed_credits) {
        if (checked_extensions.length > 1) {
          BulkRegister.proceed_bulk_register(checked_extensions, form_data.registrant_contact_id, form_data.years);
        }
        else {
          register_domain(domain, form_data);
        }
      } else {
        Billing.purchase_modal(curry(buy_domain, domain, available_extensions, form_data), needed_credits-current_credits);
      }
    });
  });

  define('open_link', function(url) {
    hide_modal();
    set_route(url);
  });

  define('register_domain', function(domain, form_data) {
    $('#errors').empty();
    Badger.registerDomain(form_data, spin_modal_until(function(response) {
      if (response.meta.status == 'created') {
        load_domain(response.data.name, function(domain_object) {
          DomainApps.install_app_on_domain(Hasher.domain_apps["badger_web_forward"], domain_object);
          update_credits(true);
          set_route('#domains/' + domain);
          hide_modal();

          BadgerCache.flush('domains');
          BadgerCache.getDomains(function() { update_my_domains_count(); });
        })
      } else {
        $('#errors').empty().append(error_message(response));
      }
    }))
  });
}


with (Hasher('Register', 'Application')) {

  define('buy_domain_modal', function(domain, available_extensions) {
    show_modal(
      h1({ 'class': 'long-domain-name'}, 'Register ', domain),
      div({ id: 'errors' }),
      p({ style: "margin-bottom: 0" }, "You'll be able to configure ", strong(Domains.truncate_domain_name(domain, 50)), " on the next screen."),
      form({ action: curry(buy_domain, domain, available_extensions) },
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
                select({ name: 'years', id: 'years', onchange: function(e) {
                                          var years = parseInt($(e.target).val());
                                          var num_domains = 1 + $('.extensions:checked').length;
                                          var credits = num_domains * years;
                                          $('#register-button').val('Register ' + (num_domains > 1 ? (num_domains + ' domains') : domain) + ' for ' + credits + (credits == 1 ? ' credit' : ' credits'))
                                        } },
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
          ),
          available_extensions.length > 0 ?
            tr(
              td({ style: "width: 50%" },
                h3({ style: 'margin-bottom: 3px' }, 'Also Register:'),
                available_extensions.map(function(ext) {
                  return div(checkbox({ name: "extension_" + ext[0].split('.')[1], value: ext[0], id: ext[0].split('.')[1], 'class': 'extensions',
                                        onchange: function(e) {
                                          var years = parseInt($('#years').val());
                                          var num_domains = 1 + $('.extensions:checked').length;
                                          var credits = num_domains * years;
                                          $('#register-button').val('Register ' + (num_domains > 1 ? (num_domains + ' domains') : domain) + ' for ' + credits + (credits == 1 ? ' credit' : ' credits'))
                                        } }),
                             label({ 'for': ext[0].split('.')[1] }, ' ' + ext[0]))
                })
              )
            )
            : ''
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
