with (Hasher('Transfer','Application')) {

  define('show', function() {
		call_action('Modal.show', 'Transfer.get_domain_form');
  });

	define('check_auth_code', function(name, info, form_data) {
		call_action('Modal.show', 'Transfer.processing_request');

		Badger.getDomainInfo(form_data, function(response) {
			if (response.data.code == 2202 || response.meta.status != 'ok') {
				call_action('Modal.show', 'Transfer.get_auth_code', name, info, helper('Application.error_message', response));
			} else {
				BadgerCache.getAccountInfo(function(account_info) {
		      // ensure they have at least one domain_credit
		      if (account_info.data.domain_credits <= 0) {
						Billing.purchase_modal(action('Transfer.check_auth_code', name, info, form_data));
		      } else {
            call_action('Modal.show', 'Transfer.processing_request');

            BadgerCache.getContacts(function(contacts) {
              if (contacts.data.length == 0) {
                call_action('Modal.show', 'Whois.edit_whois_modal', null, action('Transfer.check_auth_code', name, info, form_data));
              } else {
                call_action('import_dns_settings', name, info, form_data);
              }
            });
		      }
		    });
			}
		});		
	});

  define('import_dns_settings', function(name, info, form_data) {
    call_action('Modal.show', 'Transfer.loading_dns_settings');

    Badger.remoteDNS(name, function(response) {
      call_action('Modal.show', 'Transfer.dns_settings', name, info, form_data, response.data);
    });
  });

  define('select_whois_and_dns_settings', function(name, info, first_form_data, records, import_setting_form) {
    call_action('Modal.show', 'Transfer.select_whois_and_dns_settings', name, info, first_form_data, records, import_setting_form);
  });

	define('get_domain_info', function(form_data) {
	  console.log("get_domain_info");
	  console.log(arguments)
		$('#get-domain-form-errors').empty();
		call_action('Modal.show', 'Transfer.processing_request');
		
		// make sure it's a valid domain name before making api call
		form_data.name = form_data.name.toLowerCase();
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
          if (response.data.registrar.name.toLowerCase().indexOf('godaddy') != -1)
            Badger.remoteWhois(form_data.name, function(whois_response) {
              if (whois_response.data.privacy) {
                call_action('Modal.show', 'Transfer.domain_locked_help', form_data.name, response.data);
              } else
                call_action('Modal.show', 'Transfer.get_auth_code', form_data.name, response.data);
            });
          else
            call_action('Modal.show', 'Transfer.get_auth_code', form_data.name, response.data);
				}
			}
		});
	});
	
	define('transfer_domain', function(name, info, first_form_data, records, import_setting_form, form_data) {
		call_action('Modal.show', 'Transfer.processing_request');

		Badger.registerDomain(form_data, function(response) {
			if (response.meta.status == 'created') {
				helper('Application.update_credits', true);
				BadgerCache.flush('domains');

        if (info.registrar.name.toLowerCase().indexOf('godaddy') != -1) {
          call_action('Modal.show', 'Transfer.godaddy_transfer_confirm', info.registrar.name);
        } else {
          call_action('Modal.show', 'Transfer.transfer_confirm', info.registrar.name);
        }

        if (import_setting_form.import_dns_settings_checkbox) {
          $.each(records, function() {
            var record = { 'record_type': this.record_type, 'content': this.value, 'ttl': 1800, 'priority': this.priority, 'subdomain': this.subdomain };
            Badger.addRecord(name, record);
          });
        }
        
			} else {
				call_action('Modal.show', 'Transfer.get_auth_code', name, info, helper('Application.error_message', response));
			}
		});
		
	});

	define('transfer_complete', function() {
    call_action('Modal.hide');
    set_route('#filter_domains/transfers/list');
  });


	layout('dashboard');
};

with (Hasher('Transfer','Application')) {
		
	define('domain_locked_help', function(name, info) {
		return div(
			h1({ 'class': 'long-domain-name'}, 'TRANSFER IN ' + name),
			div({ 'class': 'error-message' },
      div("You need to " + ( info.locked ? "unlock" : "disable privacy of") + " this domain through " + (info.registrar.name.indexOf('Unknown') == 0 ? 'the current registrar' : info.registrar.name)) ),
			table(
        tbody(
          tr(
            td( strong("Current Registrar:") ),
            td(info.registrar.name)
          ),
          tr(
            td( strong("Created:") ),
            td(new Date(Date.parse(info.created_at)).toDateString())
          ),
          tr(
            td( strong("Expiration:") ),
            td(new Date(Date.parse(info.expires_on)).toDateString())
          ),
          info.locked ?
          tr(
            td( strong("Locked:") ),
            td('Yes')
          )
          :
          tr(
            td( strong("Privacy:") ),
            td('Enabled')
          )
        )
			),
			//helper('unlock_instructions_for_registrar', , info.registrar.name),
			a({ 'class': 'myButton myButton-small', style: 'float: right', href: action('get_domain_info', { name: name }) }, "Retry"),
			br()
		);
	});
	
	define('get_auth_code', function(name, info, error) {
		return form({ action: action('check_auth_code', name, info) },
			h1('Auth Code'),

			div({ id: "get-auth-code-errors" }, error),
			div("Please obtain the auth code from ", strong(info.registrar ? info.registrar.name : 'Unknown'), " and enter it below."),
			div({ style: 'text-align: center; margin: 30px 0'}, 
				input({ name: 'auth_code', 'class': 'fancy', placeholder: 'Auth Code' }),
				input({ name: 'name', type: 'hidden', value: name }),
				input({ 'class': 'myButton', type: 'submit', value: 'Next' })
			)

			//helper('get_auth_code_instructions_for_registrar', info.registrar.name),
			
		);
	});
	
	define('select_whois_and_dns_settings', function(name, info, first_form_data, records, import_setting_form) {
		return form({ action: action('transfer_domain', name, info, first_form_data, records, import_setting_form) },
			h1({ 'class': 'long-domain-name'}, 'TRANSFER IN ' + name),
			
			input({ type: 'hidden', name: 'name', value: name }),
			input({ type: 'hidden', name: 'auth_code', value: first_form_data.auth_code }),
      input({ type: 'hidden', name: 'auto_renew', value: 'true'}),
      input({ type: 'hidden', name: 'privacy', value: 'true'}),
      input({ type: 'hidden', name: 'name_servers', value: (import_setting_form.import_dns_settings_checkbox ? 'ns1.badger.com,ns2.badger.com' : (info.name_servers || []).join(',')) }),

			table({ style: 'width:100%' }, tbody(
        tr(
          td({ style: "width: 50%; vertical-align: top" },

            h3({ style: 'margin-bottom: 3px'}, 'Registrant:'),
            select({ name: 'registrant_contact_id', style: 'width: 150px' },
              WhoisApp.profile_options_for_select()
            )
          ),
          td({ style: "width: 50%; vertical-align: top" },
						h3({ style: 'margin-bottom: 3px' }, "Length"),
						'1 additional year @ 1 credit per year'
          )
        )
      )),

			div({ style: "text-align: center; margin-top: 10px" }, input({ 'class': 'myButton', type: 'submit', value: 'Transfer ' + Domains.truncate_domain_name(name) + ' for 1 Credit' }))
		);
	})
	
	define('get_domain_form', function(data, error) {
		return div(
			h1("TRANSFER IN A DOMAIN"),
      form({ id: "get-domain-info-form", action: curry(Signup.require_user_modal, action('get_domain_info')) },
			  div({ id: "get-domain-form-errors" }, error ? error : null),
				div("Use this form if you've registered a domain at another registrar and would like to transfer the domain to Badger.  If you have lots of domains to transfer, you can use our ", a({ href: action('BulkTransfer.show') }, 'Bulk Transfer Tool'), '.'),
				div({ style: 'text-align: center; margin: 30px 0'},
  				input({ name: "name", 'class': 'fancy', placeholder: "example.com", value: data && data.name || '' }),
  				input({ 'class': 'myButton', type: "submit", value: "Next"})
        )
			)
		);
	});
	
	// implement different instructions for certain registrars at some point
  // define('unlock_instructions_for_registrar', function(registrar) {
  //  return div("You need to unlock this domain through " + (registrar.indexOf('Unknown') == 0 ? 'the current registrar' : registrar) + '.');
  // });
	
	//todo add more help
  // define('get_auth_code_instructions_for_registrar', function(registrar) {
  //  return div("Please refer to the currently owning registrar for instructions on how to find the authorization code.");
  // });
	
	define('processing_request', function() {
		return div({ style: 'text-align: center; padding: 100px 0' },
			strong('Processing, please wait...')
    );
	});

  define('transfer_confirm', function(registrar_name) {
    return [
      h1('Transfer Request Submitted'),
      div("We have submitted your transfer request and will email you when it is complete."),
      ul(
        li("If you do nothing, this request will be ", strong("automatically appoved in 5 days.")),
        li("You may be able to manually approve the domain transfer through ", registrar_name),
        li(registrar_name, " may email you with instructions on how to approve the domain transfer sooner.")
      ),
      
			div({ style: 'text-align: right; margin-top: 10px'}, 
			  a({ href: action('transfer_complete'), 'class': 'myButton', value: "submit" }, "Close")
			)
    ];
  });

  define('godaddy_transfer_confirm', function() {
    return[
      h1('Transfer Request Submitted'),
      div("This request will be ", strong("automatically approved in 5 days"), ".  If you'd like to manually approve this domain transfer, visit ", a({ href: "https://dcc.godaddy.com/default.aspx?activeview=transfer&filtertype=3&sa=#", target: "_blank" }, "GoDaddy's Pending Transfers"), ' page.'),
      
			div({ style: 'text-align: right; margin-top: 10px'}, 
			  a({ href: action('transfer_complete'), 'class': 'myButton', value: "submit" }, "Close")
			)
    ];
  });

  define('loading_dns_settings', function() {
    return [
      div({ style: 'text-align: center; padding: 100px 0' },
			  strong('Reading your current DNS settings, please wait...')
      )
    ];
  });

  define('dns_settings', function( name, info, first_form_data, records) {
    var results = records.map(function(record) {
      return tr(
        td(record.subdomain),
        td(record.record_type),
        td(record.priority ? record.priority + ' ' : '',  record.value)
      )
    });
    return div(
      h1('Import DNS into Badger?'),
      div({ 'class': 'y-scrollbar-div' },
        table({ 'class': 'fancy-table', id: 'dns-settings' },
          tbody(
            tr(
              th('Host'),
              th('Type'),
              th('Destination')
            ),
            results
          )
        )
      ),
      form({ action: action('select_whois_and_dns_settings', name, info, first_form_data, records) },
        div({ style: 'padding: 15px 0' }, 
          input({ type: 'checkbox', name: 'import_dns_settings_checkbox', value: 'ns1.badger.com,ns2.badger.com', checked: 'checked', id: 'import_dns_settings_checkbox' }),
          label({ 'for': 'import_dns_settings_checkbox' }, 'Import these records into Badger DNS')),
          div(input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Next' })
        )
      )
    );
  });
};
