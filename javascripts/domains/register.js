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

    $('#errors').empty();
    start_modal_spin('Checking available credits...');

    BadgerCache.getAccountInfo(function(results) {
      var needed_credits = checked_extensions.length * form_data.years;
      var current_credits = results.data.domain_credits;
      
      if (current_credits >= needed_credits) {
        if (checked_extensions.length > 1) {
          BulkRegister.proceed_bulk_register(checked_extensions, form_data.registrant_contact_id, form_data.years);
        } else {
          register_domain(domain, available_extensions, form_data);
        }
      } else {
        Billing.purchase_modal(curry(buy_domain, domain, available_extensions, form_data), needed_credits - current_credits);
      }
    });
  });

	define('renew_domain', function(form_data) {
		// console.log("renew domain!!!!", arguments);
		
		$('#errors').empty();
    start_modal_spin('Checking available credits...');

    BadgerCache.getAccountInfo(function(results) {
      var needed_credits = form_data.years
      var current_credits = results.data.domain_credits;
      
      if (current_credits >= needed_credits) {
				start_modal_spin('Renewing domain...');
				Badger.renewDomain(form_data.domain, form_data.years, function(response) {
					if (response.meta.status == "ok") {
						hide_modal();
						set_route("#domains/" + form_data.domain + "/registration");
						update_credits(true);
					} else {
						stop_modal_spin();
						$("#errors").append(div({ 'class': "error-message" }, response.data.message));
					}
				});
      } else {
        Billing.purchase_modal(curry(renew_domain, form_data), needed_credits - current_credits);
      }
    });
	});
	
  // NOTE: this function has a few race conditions...
  //  - "install_app_on_domain" isn't chained so the getDomains() could finish first
  //    and redirect you to the domain page before the dns entries are installed.
  define('register_domain', function(domain, available_extensions, form_data) {
    start_modal_spin('Registering ' + domain + '...');
    Badger.registerDomain(form_data, function(response) {
      if (response.meta.status == 'created') {
        start_modal_spin('Configuring ' + domain + '...');
        update_credits(true);

        load_domain(response.data.name, function(domain_object) {
          DomainApps.install_app_on_domain(Hasher.domain_apps["badger_web_forward"], domain_object);
          BadgerCache.flush('domains');
          BadgerCache.getDomains(function() { 
            update_my_domains_count(); 
            
            set_route('#domains/' + domain);
            hide_modal();
          });
        })
      } else {
        // if the registration failed, we actually need to re-render the registration modal because if the user
        // had to buy credits in the previous step, the underlying modal is the purcahse modal and not the
        // registration modal.
        buy_domain_modal(domain, available_extensions);
        $('#errors').empty().append(error_message(response));
      }
    })
  });


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

	define('renew_domain_modal', function(domain) {
		show_modal(
      h1({ 'class': 'long-domain-name'}, 'Extend Registration'),
      div({ id: 'errors' }),
			p("The domain, " + domain +", will automatically renew on its expiration date.  If you'd prefer, you can extend this registration immediately by using the form below."),
			form({ action: curry(renew_domain), style: "margin-bottom: -15px" },
				div({ 'class': "info-message", style: "width: 220px", align: "center" },
					p({ style: "font-weight: bold; font-size: 16px; font-style: italic; margin: 0 auto 10px auto" }, "1 year = 1 domain credit"),
					div({ style: "font-size: 16px" }, "Years:", select({ style: "font-size: 16px; margin-left: 15px", name: "years" },
						option({ value: 1 }, "1"),
						option({ value: 2 }, "2"),
						option({ value: 3 }, "3"),
						option({ value: 4 }, "4"),
						option({ value: 5 }, "5"),
						option({ value: 6 }, "6"),
						option({ value: 7 }, "7"),
						option({ value: 8 }, "8"),
						option({ value: 9 }, "9"),
						option({ value: 10 }, "10")
					))
				),
				input({ type: "hidden", value: domain, name: "domain" }),
				button({ id: "renew-button", 'class': "myButton", style: "float: right; margin-top: -45px"}, "Renew domain")
			)
		);
		
		// update the button according to, then call the trigger the change event to initially update the button 
		$("select[name=years]").change(function(e) {
			$("#renew-button").html("Renew for " + e.target.value + " years (" + e.target.value + " credits)");
		});
		
		$("select[name=years]").change();
	});
	

  // define('open_link', function(url) {
  //   hide_modal();
  //   set_route(url);
  // });
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
