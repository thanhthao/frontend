with (Hasher('Registration','DomainApps')) {

  register_domain_app({
    id: 'badger_registration',
    icon: function(domain_obj) {
      return logo_for_registrar(domain_obj.current_registrar);
    },
    name: function(domain_obj) {
      return "Registration (" + domain_obj.current_registrar + ")"
      // var s = domain_obj.current_registrar;
      // if (s.match(/badger/i)) return "Registration (Badger.com)";
      // else if (s.match(/godaddy/i)) return "Registration (GoDaddy)";
      // else if (s.match(/enom/)) return "Registration (eNom)";
      // else if (s.match(/1and1/)) return "Registration (1&1)";
      // else return "Registration";
    },
    menu_item: { text: 'REGISTRATION', href: '#domains/:domain/registration' },
    requires: {}
  });

  route('#domains/:domain/registration', function(domain) {
    var whois_div = div('Loading...');
    var button_div = div();
    
    render(
      h1({ 'class': 'long-domain-name' }, Domains.truncate_domain_name(domain, 20), ' Registration'),
      button_div,
      domain_data_block(domain),
      whois_div
    );

    Badger.getContacts(function() {
      Badger.getDomain(domain, function(response) {
        var domain_obj = response.data;
        
        render({ target: whois_div }, whois_view(domain_obj));

        render({ target: button_div }, 
          div({ style: "float: right; margin-top: -44px" }, 
            domain_obj.badger_registration ? [
              a({ 'class': "myButton myButton-small", href: curry(Register.renew_domain_modal, domain) }, "Extend Registration (Renew)")
            ] : [
              a({ 'class': "myButton myButton-small", href: null }, "Transfer To Badger.com")
            ]
          )
        );

      });
    });
  });
  
  define('logo_for_registrar', function(name) {
    if (name.match(/badger/i)) return "images/apps/badger.png";
    else if (name.match(/godaddy/i)) return "images/apps/godaddy.png";
    else if (name.match(/enom/i)) return "images/apps/enom.png";
    else if (name.match(/1and1/)) return "images/apps/1and1.png";
  });

  define('domain_data_block', function(domain) {
    var elem = div();

    Badger.getDomain(domain, function(response) {
      var domain_obj = response.data;
      render({ target: elem },
        
        table({ style: "width: 100%; border-collapse: collapse" }, tbody(
          tr(
            td({ style: 'width: 50%; vertical-align: top; padding-right: 5px' },

              div({ 'class': 'info-message' },
        			  div({ style: "float: left; padding-right: 10px" }, img({ src: logo_for_registrar(domain_obj.current_registrar) })),

        			  h3({ style: 'margin: 0 0 12px' }, 'Current Registration'),
        			  div(domain_obj.current_registrar, " until ", new Date(Date.parse(domain_obj.expires_on)).toDateString().split(' ').slice(1).join(' ')),

      			    domain_obj.current_registrar.match(/badger/i) && div({ style: 'text-align: left; margin-top: 12px' }, a({ 'class': "myButton myButton-small", href: curry(Register.renew_domain_modal, domain) }, "Extend Registration")),

        			  div({ style: 'clear: left' })
        			)
              
            ),
            td({ style: 'width: 50%; vertical-align: top; padding-left: 5px' },
              div({ 'class': 'info-message', style: 'border-color: #aaa; background: #eee' },
                dl({ 'class': 'fancy-dl', style: 'margin: 0' },
                  dt({ style: 'width: 80px' }, 'Created:'), dd(new Date(Date.parse(domain_obj.registered_on)).toDateString()), br(),
                  dt({ style: 'width: 80px' }, 'Through:'), dd((domain_obj.created_registrar ? domain_obj.created_registrar : '')), br(),
                  dt({ style: 'width: 80px' }, 'Status: '), dd(domain_obj.status), br(),
                  dt({ style: 'width: 80px' }, 'Previously: '), dd(domain_obj.losing_registrar), br()
                  // dt('Expires:'), dd(), br(),
                  // dt('Created: '), dd(new Date(Date.parse(domain_obj.created_at)).toDateString()), br(),
                  // dt('Updated At: '), dd(new Date(Date.parse(domain_obj.updated_at)).toDateString()), br(),
                  // dt('Updated On: '), dd(new Date(Date.parse(domain_obj.updated_on)).toDateString())
                )
              )
            )
          )
        ))
        
          //         div({ 'class': 'info-message' },
          // div({ style: "float: left; padding-right: 10px" }, img({ src: logo_for_registrar(domain_obj.current_registrar) })),
          // 
          // h3({ style: 'margin: 0 0 6px' }, 'Current Registration'),
          // div(domain_obj.current_registrar),
          // div("Expires ", new Date(Date.parse(domain_obj.expires_on)).toDateString().split(' ').slice(1).join(' ')),
          // 
          //          !domain_obj.badger_dns && div({ style: 'text-align: right' }, a({ 'class': "myButton myButton-small", href: curry(Register.renew_domain_modal, domain) }, "Extend")),
          // 
          // div({ style: 'clear: left' })
          // 
          //           //          
          //           // dl({ 'class': 'fancy-dl', style: 'padding-left: 40px' },
          //           //   dt('Registrar: '), dd(), br(),
          //           //   dt('Status: '), dd(domain_obj.status), br(),
          //           //   dt('Created: '), dd(new Date(Date.parse(domain_obj.created_at)).toDateString()), br(),
          //           //   dt('Expires:'), dd(), br()
          //           //   // dt('Registered:'), dd(new Date(Date.parse(data.registered_on)).toDateString(), (data.created_registrar ? ' via '+data.created_registrar : '')), br(),
          //           //   // dt('Previous Registrar: '), dd(data.losing_registrar), br(),
          //           //   // dt('Updated At: '), dd(new Date(Date.parse(data.updated_at)).toDateString()), br(),
          //           //   // dt('Updated On: '), dd(new Date(Date.parse(data.updated_on)).toDateString())
          //           // )
          //         )
      );
    });

    return elem;
  });
  
  



  define('update_whois', function(domain, form_data) {
    // force sends a "privacy=false"... exclusion isn't enough
    form_data['privacy'] = form_data['privacy'] ? 'true' : 'false';
    Badger.updateDomain(domain.name, form_data, function(response) {
      console.log(response);
      set_route(get_route());
    });
  });
  
  define('profile_options_for_select', function(selected_id) {
    if (BadgerCache.cached_contacts) {
      return BadgerCache.cached_contacts.data.map(function(profile) { 
        var opts = { value: profile.id };
        if (''+profile.id == ''+selected_id) opts['selected'] = 'selected';
        return option(opts, profile.first_name + ' ' + profile.last_name + (profile.organization ? ", " + profile.organization : '') + " (" + profile.address + (profile.address2 ? ', ' + profile.address2 : '') + ")");
      });
    } else {
      var dummy_opt = option({ disabled: 'disabled' }, 'Loading...');
  
      BadgerCache.getContacts(function(contacts) { 
        contacts.data.map(function(profile) { 
          var opts = { value: profile.id };
          if (''+profile.id == ''+selected_id) opts['selected'] = 'selected';
          var node = option(opts, profile.first_name + ' ' + profile.last_name + (profile.organization ? ", " + profile.organization : '') + " (" + profile.address + (profile.address2 ? ', ' + profile.address2 : '') + ")");
          dummy_opt.parentNode.insertBefore(node,null);
        });
        dummy_opt.parentNode.removeChild(dummy_opt);
      });
  
      return dummy_opt;
    }
  });
  
  define('whois_view', function(domain) {
    return div(
      table({ style: 'width: 100% '}, tbody(
        tr(
          td({ style: 'vertical-align: top; padding-right: 20px'},
            h2('Public Whois Listing'),
            div({ 'class': 'long-domain-name', style: 'border: 1px solid #ccc; width: 409px; overflow: hidden; overflow: auto; white-space: pre; padding: 5px; background: #f0f0f0' }, domain.whois.raw)
          ),
          td({ style: 'vertical-align: top'},
            h2('Make Changes'),
  
            form({ action: curry(update_whois, domain) },
              table(tbody(
                tr(
                  td('Registrant:'),
                  td(select({ name: 'registrant_contact_id', style: 'width: 150px' },
                    profile_options_for_select(domain.registrant_contact.id)
                  ))
                ),
                tr(
                  td('Administrator:'),
                  td(select({ name: 'administrator_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    profile_options_for_select(domain.administrator_contact && domain.administrator_contact.id)
                  ))
                ),
                tr(
                  td('Billing:'),
                  td(select({ name: 'billing_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    profile_options_for_select(domain.billing_contact && domain.billing_contact.id)
                  ))
                ),
                tr(
                  td('Technical:'),
                  td(select({ name: 'technical_contact_id', style: 'width: 150px' },
                    option({ value: '' }, 'Same as Registrant'),
                    profile_options_for_select(domain.technical_contact && domain.technical_contact.id)
                  ))
                )
              )),
              div(
                (domain.whois.privacy ? input({ name: 'privacy', type: 'checkbox', checked: 'checked' }) : input({ name: 'privacy', type: 'checkbox' })),
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
}
