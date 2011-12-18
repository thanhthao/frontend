with (Hasher.Controller('BulkRegister','Application')) {

  create_action('show', function() {
    BadgerCache.getContacts(function(contacts) {
      if (contacts.data.length == 0) {
        var custom_message = "You must have at least one contact profile to bulk-register domain.";
        call_action('Modal.show', 'Whois.edit_whois_modal', null, action('BulkRegister.show'), custom_message);
      } else {
        call_action('Modal.show', 'BulkRegister.get_bulk_domain_form');
      }
    });
  });

  create_action('get_register_domain_lists', function(form_data) {
    var results = [];
    var domains_list = form_data.register_domains_list.split('\n');
    $.each(domains_list, function() {
      var value = this.trim();
      if (value != '')
        results.push(value);
    });
    if (results.length > 0)
      call_action('BulkRegister.verify_bulk_register', results, form_data.contacts_id);
    else {
      $('#bulk-register-form-error').html('Invalid Domains Input');
      $('#bulk-register-form-error').removeClass('hidden');
    }
  });

  create_action('verify_bulk_register', function(domains_list, contacts_id) {
//    call_action('Modal.show', 'Register.processing_request');
    BadgerCache.getAccountInfo(function(account_info) {
      // ensure they have at least one domain_credit
      if (account_info.data.domain_credits < domains_list.length) {
        call_action('Modal.show', 'Billing.purchase_modal', action('BulkRegister.verify_bulk_register', domains_list));
      } else {
        call_action('Modal.show', 'BulkRegister.confirm_register', domains_list, contacts_id);
      }
    });
  });

  create_action('proceed_bulk_register', function(domains_list, contacts_id) {
    call_action('Modal.show', 'BulkRegister.bulk_register_result', domains_list);
    var count = 0;
    $.each(domains_list, function() {
      var local_count = ++count;
      var domain = this;
      var domain_info = { name: domain.toString(), auto_renew: 'true', privacy: 'true',
                          name_servers: 'ns1.badger.com,ns2.badger.com',
                          registrant_contact_id: contacts_id, years: 1 };
      Badger.registerDomain(domain_info, function(response) {
        if (response.meta.status != 'created') {
          $('#bulk-register-result-table td#' + domain.replace(/\./g,'-') + '-' + local_count + '-register-status').html('Failed');
        } else {
          $('#bulk-register-result-table td#' + domain.replace(/\./g,'-') + '-' + local_count + '-register-status').html('Succeed');
        }
      });
    });
  });
  
  create_action('close_bulk_modal', function() {
    BadgerCache.flush('domains');
    BadgerCache.getDomains(function() { update_my_domains_count(); });
    helper('Application.update_credits', true);
    call_action('Modal.hide');
    redirect_to('#');
  });

}

with (Hasher.View('BulkRegister','Application')) {

	create_helper('get_bulk_domain_form', function() {
    return div(
      h1('BULK REGISTER'),
      div({ 'class': 'error-message hidden', id: 'bulk-register-form-error' }),
      form({ action: action('get_register_domain_lists') },
        p('Type in domains you want to register, one per line:'),
        textarea({ name: 'register_domains_list', style: 'width: 80%; height: 180px;' }),
        div(span('Registrant:'),
          span(select({ name: 'contacts_id', style: 'width: 150px; margin: 10px 10px; text-align: center' },
            WhoisApp.profile_options_for_select()
        ))),
        div({ style: 'text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Next' }))
      )
		);
	});

  create_helper('confirm_register', function(domains_list, contacts_id) {
    return div(
      h1('CONFIRM REGISTER'),
      p('You are about to register ' + domains_list.length + (domains_list.length > 1 ? ' domains.' : ' domain.')),
      a({ href: action('BulkRegister.proceed_bulk_register', domains_list, contacts_id), 'class': 'myButton'}, 'Register All Domains for ' + domains_list.length + (domains_list.length > 1 ? ' Credits' : ' Credit'))
    )
  });

  create_helper('bulk_register_result', function(domains_list) {
    var count = 0;
    var list = domains_list.map(function(domain) {
      count++;
      return tr(
        td(domain),
        td({ id: domain.replace(/\./g,'-')  + '-' + count + '-register-status' }, 'Processing')
      )
    });

    return [
      h1('BULK REGISTER RESULT'),
      p('In processing, please wait...'),
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
      div({ style: 'text-align: right; margin-top: 10px;' }, a({ href: action('close_bulk_modal'), 'class': 'myButton', value: "submit" }, "Close"))
    ];
  });
}
