with (Hasher('BulkRegister','Application')) {

  define('show', function() {
    BadgerCache.getContacts(function(contacts) {
      if (contacts.data.length == 0) {
        var custom_message = "You must have at least one contact profile to bulk-register domain.";
        Whois.edit_whois_modal(null, BulkRegister.show, custom_message);
      } else {
        get_bulk_domain_form();
      }
    });
  });

  define('get_register_domain_lists', function(form_data) {
    var results = [];
    var domains_list = form_data.register_domains_list.split('\n');
    $.each(domains_list, function() {
      var value = this.trim();
      if (value != '')
        results.push(value);
    });
    if (results.length > 0)
      BulkRegister.verify_bulk_register(results, form_data.contacts_id);
    else {
      $('#bulk-register-form-error').html('Invalid Domains Input');
      $('#bulk-register-form-error').removeClass('hidden');
    }
  });

  define('verify_bulk_register', function(domains_list, contacts_id) {
   // show_modal(Register.processing_request());
    BadgerCache.getAccountInfo(function(account_info) {
      // ensure they have at least one domain_credit
      if (account_info.data.domain_credits < domains_list.length) {
        Billing.purchase_modal(curry(BulkRegister.verify_bulk_register, domains_list), domains_list.length);
      } else {
        confirm_register(domains_list, contacts_id);
      }
    });
  });

  define('proceed_bulk_register', function(domains_list, form_data) {
    bulk_register_result(domains_list);
    var count = 0;
		var contacts_id = form_data.registrant_contact_id;
		var years = form_data.years;

    $.each(domains_list, function() {
      var local_count = ++count;
      var domain = this;

			var domain_info = { name: domain.toString(), auto_renew: 'true', privacy: 'true',
                          name_servers: 'ns1.badger.com,ns2.badger.com',
                          registrant_contact_id: contacts_id, years: years != null ? years : 1 };
      Badger.registerDomain(domain_info, function(response) {
        if (response.meta.status != 'created') {
          $('#bulk-register-result-table td#' + domain.replace(/\./g,'-') + '-' + local_count + '-register-status').html(div({ 'class': "register-failed" }, 'Failed'));
        } else {
          load_domain(response.data.name, function(domain_object) {
            DomainApps.install_app_on_domain(Hasher.domain_apps["badger_web_forward"], domain_object);
          })
          $('#bulk-register-result-table td#' + domain.replace(/\./g,'-') + '-' + local_count + '-register-status').html(div({ 'class': "register-success" }, 'Success'));
        }
      });
    });
  });
  
  define('close_bulk_modal', function() {
    BadgerCache.flush('domains');
    BadgerCache.getDomains(function() { update_my_domains_count(); });
    update_credits(true);
    hide_modal();
    set_route('#');
  });

	define('get_bulk_domain_form', function() {
    show_modal(
      div(
        h1('BULK REGISTER (EXPERIMENTAL)'),
        div({ 'class': 'error-message hidden', id: 'bulk-register-form-error' }),
        form({ action: get_register_domain_lists },
          p('Type in domains you want to register, one per line:'),
          textarea({ name: 'register_domains_list', style: 'width: 80%; height: 180px;' }),
          div(span('Registrant:'),
            span(select({ name: 'contacts_id', style: 'width: 150px; margin: 10px 10px; text-align: center' },
              Registration.profile_options_for_select()
          ))),
          div({ style: 'text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Next' }))
        )
      )
		);
	});

  define('confirm_register', function(domains_list, contacts_id) {
    show_modal(
      div(
        h1('CONFIRM REGISTER'),
        p('You are about to register ' + domains_list.length + (domains_list.length > 1 ? ' domains.' : ' domain.')),
        a({ href: curry(BulkRegister.proceed_bulk_register, domains_list, contacts_id), 'class': 'myButton'}, 'Register All Domains for ' + domains_list.length + (domains_list.length > 1 ? ' Credits' : ' Credit'))
      )
    )
  });

  define('bulk_register_result', function(domains_list) {
    var count = 0;
    var list = domains_list.map(function(domain) {
      count++;
      return tr(
        td(domain),
        td({ id: domain.replace(/\./g,'-')  + '-' + count + '-register-status' }, div({ 'class': "register-processing" }, 'Processing'))
      )
    });

    var modal = show_modal(
      h1('BULK REGISTER RESULT'),
      // p({ id: "registering-message" }, 'Registering domains, please wait...'),
      div({ 'class': 'y-scrollbar-div' },
        table({ 'class': 'fancy-table', id: 'bulk-register-result-table' },
          tbody(
            tr(
              th('Domain Name'),
              th('Register Status')
            ),
            list
          )
        )
      ),
      
      // div({ style: 'text-align: right; margin-top: 10px;' }, a({ href: close_bulk_modal, 'class': 'myButton', value: "submit" }, "Close"))
      div({ style: 'text-align: right; margin-top: 10px;', id: "close-register-button" }, ajax_loader())
    );
    
    // If all processing elements are gone, show the button. If all succeeded, make button go to share dialog, otherwise hide modal.
    var timer = setInterval(function() {
      if ($("div.register-processing").length == 0) {
        clearTimeout(timer);
        
        if ($("div.register-failed").length > 0) {
          $("#close-register-button").html(
            a({ href: close_bulk_modal, 'class': 'myButton' }, "Close")
          );
        } else {
          $("#close-register-button").html(
            a({ href: curry(LinkedAccounts.show_share_bulk_registration_modal, domains_list[0], domains_list.length, close_bulk_modal), 'class': 'myButton' }, "Continue")
          );
        }
      }
    }, 200);
    
    return modal;
  });
  
  define('ajax_loader', function() {
    return img({ 'class': 'ajax_loader', src: 'images/ajax-loader.gif'});
  });

}
