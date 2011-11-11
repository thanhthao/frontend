with (Hasher.Controller('Transfer','Application')) {

  create_action('show', function() {
		call_action('Modal.show', 'Transfer.get_domain_form');
  });

	create_action('check_auth_code', function(name, info, form_data) {
		call_action('Modal.show', 'Transfer.processing_request');

		Badger.getDomainInfo(form_data, function(response) {
			if (response.data.code == 2202 || response.meta.status != 'ok') {
				call_action('Modal.show', 'Transfer.get_auth_code', name, info, helper('Application.error_message', response));
			} else {			
				BadgerCache.getAccountInfo(function(account_info) {
		      // ensure they have at least one domain_credit
		      if (account_info.data.domain_credits <= 0) {
						call_action('Modal.show', 'Billing.purchase_modal', action('Transfer.check_auth_code', name, info, form_data));
		      } else {
						call_action('Modal.show', 'Transfer.processing_request');
		        
						BadgerCache.getContacts(function(contacts) {
							if (contacts.data.length == 0) {
								call_action('Modal.show', 'Whois.edit_whois_modal', null, action('Transfer.check_auth_code', name, info, form_data));
							} else {
								call_action('Modal.show', 'Transfer.select_whois_and_dns_settings', name, form_data);
							}
						});			
		      }
		    });
			}
		});		
	});

	create_action('get_domain_info', function(form_data) {
		$('#get-domain-form-errors').empty();
		call_action('Modal.show', 'Transfer.processing_request');
		
		// make sure it's a valid domain name before making api call
		if ( /^([a-z0-9\-]+\.)+(com|net)$/.test(form_data.name) ) {
			Badger.getDomainInfo(form_data, function(response) {
				if (response.data.code == 2303)//the domain object does not exist, render the proper error message
					call_action('Modal.show', 'Transfer.get_domain_form', form_data, helper('Application.error_message', { data: { message: "Domain not found" } }));
				else if(response.data.code != 1000)
					call_action('Modal.show', 'Transfer.get_domain_form', form_data, helper('Application.error_message', { data: { message: "Internal server error" } }));
				else if(response.data.pending_transfer)
					call_action('Modal.show', 'Transfer.get_domain_form', form_data, helper('Application.error_message', { data: { message: "Domain already pending transfer" } }));
				else {
					if(response.data.locked) {
						call_action('Modal.show', 'Transfer.domain_locked_help', form_data.name, response.data);
					} else {
						call_action('Modal.show', 'Transfer.transfer_domain_prompt', form_data.name, response.data);
					}
				}
			});
		} else {
			call_action('Modal.show', 'Transfer.get_domain_form', form_data, helper('Application.error_message', { data: { message: "Domain name invalid" } }));
		}
	});
	
	create_action('transfer_domain', function(name, info, form_data) {
		call_action('Modal.show', 'Transfer.processing_request');

		Badger.registerDomain(form_data, function(response) {
			if (response.meta.status == 'ok') {
				helper('Application.update_credits', true);
				
				BadgerCache.flush('domains');
        BadgerCache.getDomains(function() {
          call_action('Modal.hide');
          redirect_to('#');
        })
			} else {
				call_action('Modal.show', 'Transfer.transfer_domain_prompt', name, info, helper('Application.error_message', response));
			}
		});
		
	});
	
	layout('dashboard');
};

with (Hasher.View('Transfer','Application')) {
		
	create_helper('transfer_domain_prompt', function(name, info, error) {
		return div(
			h1('TRANSFER IN ' + name),
			div({ id: 'transfer-domain-prompt-errors' }, error),
			table(
				tr(
					td( strong("Current Registrar:") ),
					td(info.registrar.name)
				),
				tr(
					td( strong("Created:") ),
					td(new Date(info.created_at).toDateString())
				),
				tr(
					td( strong("Expiration:") ),
					td(new Date(info.expires_on).toDateString())
				),
				tr(
					td( strong("Locked:") ),
					td('No')
				)
			),
			a({ 'class': 'myButton myButton-small', style: 'float: right', href: action('Modal.show', 'Transfer.get_auth_code', name, info) }, "Next"),
			br()
		);
	});
	
	create_helper('domain_locked_help', function(name, info) {
		return div(
			h1('TRANSFER IN ' + name),
			table(
				tr(
					td( strong("Current Registrar:") ),
					td(info.registrar.name)
				),
				tr(
					td( strong("Created:") ),
					td(new Date(info.created_at).toDateString())
				),
				tr(
					td( strong("Expiration:") ),
					td(new Date(info.expires_on).toDateString())
				),
				tr(
					td( strong("Locked:") ),
					td('Yes')
				)
			),
			div({ 'class': 'error-message' }, div("You need to unlock this domain through " + (info.registrar.name.indexOf('Unknown') == 0 ? 'the current registrar' : info.registrar.name) + '.') ),
			//helper('unlock_instructions_for_registrar', , info.registrar.name),
			a({ 'class': 'myButton myButton-small', style: 'float: right', href: action('get_domain_info', { name: name }) }, "Retry"),
			br()
		);
	});
	
	create_helper('get_auth_code', function(name, info, error) {
		return form({ action: action('check_auth_code', name, info) },
			h1('ENTER AUTH CODE FOR ' + info.registrar.name),
			div("Please obtain the current auth code from " + info.registrar.name + " and enter it below."),
			//helper('get_auth_code_instructions_for_registrar', info.registrar.name),
			br(),
			div({ id: "get-auth-code-errors" }, error),
			div(
				input({ name: 'auth_code', placeholder: 'Auth Code' }),
				input({ name: 'name', type: 'hidden', value: name }),
				button({ 'class': 'myButton myButton-small', value: 'submit' }, "Next")
			)
		);
	});
	
	create_helper('select_whois_and_dns_settings', function(name, info) {
		return form({ action: action('transfer_domain', name, info) },
			h1("WHOIS/DNS SETTINGS FOR " + name),
			
			input({ type: 'hidden', name: 'name', value: name }),
			input({ type: 'hidden', name: 'auth_code', value: info.auth_code }),
			
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
            ))
          ),
          td({ style: "width: 50%; vertical-align: top" },
            h3({ style: 'margin-bottom: 6px'}, 'Advanced'),
            table(tbody(
              tr(
                td('DNS:'),
                td(
                  select({ name: 'name_servers' }, helper('DNS.dns_provider_options'))
                )
              )
            )),
						h3({ style: 'margin-botton: 6px' }, "Options"),
						table(tbody(
							tr(
								td( input({ name: 'auto_renew', type: 'checkbox', checked: 'checked' }), 'Auto-renew' )
							),
							tr(
								td( input({ name: 'privacy', type: 'checkbox', checked: 'checked' }), 'Keep contact information private' )
							)
            ))
          )
        )
      )),

			div({ style: "text-align: right; margin-top: 10px" }, button({ 'class': 'myButton', value: 'submit' }, 'Transfer Domain'))
		);
	})
	
	create_helper('get_domain_form', function(data, error) {
		return div(
			h1("TRANSFER IN A DOMAIN"),
			form({ id: "get-domain-info-form", action: action('get_domain_info') },
				div("Use this form if you've registered a domain at another registrar and would like to transfer the domain to Badger."),
				div({ id: "get-domain-form-errors" }, error ? error : null),
				div({ style: 'text-align: center; margin: 30px 0'}, 
  				input({ name: "name", placeholder: "example.com", value: data && data.name || '' }),
  				button({ 'class': 'myButton myButton-small', value: "submit" }, "Next")
				)
			)
		);
	});
	
	// implement different instructions for certain registrars at some point
  // create_helper('unlock_instructions_for_registrar', function(registrar) {
  //  return div("You need to unlock this domain through " + (registrar.indexOf('Unknown') == 0 ? 'the current registrar' : registrar) + '.');
  // });
	
	//todo add more help
  // create_helper('get_auth_code_instructions_for_registrar', function(registrar) {
  //  return div("Please refer to the currently owning registrar for instructions on how to find the authorization code.");
  // });
	
	create_helper('processing_request', function() {
		return div({ align: 'center' },
			strong('Processing request...')
		);
	});
	
};
