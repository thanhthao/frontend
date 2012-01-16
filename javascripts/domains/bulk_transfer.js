with (Hasher('BulkTransfer','Application')) {

  define('show', function() {
    BadgerCache.getContacts(function(contacts) {
      if (contacts.data.length == 0) {
        var custom_message = "You must have at least one contact profile to bulk-transfer domain.";
        Whois.edit_whois_modal(null, BulkTransfer.show, custom_message);
      } else {
        get_bulk_domain_form();
      }
    });
  });

  define('get_transfer_domain_lists', function(form_data) {
    var domains_list = form_data.transfer_domains_list.split('\n').map(function(item) { return item.trim(); });
    var results = [];
    for(i = 0; i < domains_list.length; i++) {
      var split_arr = domains_list[i].split(' ');
      if (split_arr.length == 2) {
        results.push({ name: split_arr[0], auth_code: split_arr[1] });
      } else {
        split_arr = domains_list[i].split(',');
        if (split_arr.length >= 2) {
          results.push({ name: split_arr[0], auth_code: split_arr.slice(1).join(',') });
        }
      }
    }
    if (results.length > 0)
      BulkTransfer.verify_bulk_transfer(results, form_data.use_badger_dns, form_data.contacts_id);
    else {
      $('#bulk-transfer-form-error').html('Invalid Domains Input');
      $('#bulk-transfer-form-error').removeClass('hidden');
    }
  });

  define('verify_bulk_transfer', function(domains_list, use_badger_dns, contacts_id) {
    start_modal_spin('Processing...');
    
    BadgerCache.getAccountInfo(function(account_info) {
      // ensure they have at least one domain_credit
      if (account_info.data.domain_credits < domains_list.length) {
        Billing.purchase_modal(curry(BulkTransfer.verify_bulk_transfer, domains_list, use_badger_dns));
      } else {
        confirm_transfer(domains_list, use_badger_dns, contacts_id);
      }
    });
  });

  define('proceed_bulk_transfer', function(domains_list, use_badger_dns, contacts_id) {
    bulk_transfer_result(domains_list);

    var count = 0;
    $.each(domains_list, function() {
      var local_count = ++count;
      var domain = this;
      Badger.getDomainInfo({ name: this.name, auth_code: this.auth_code }, function(response) {
        if (response.data.code == 2202 || response.meta.status != 'ok') {
          $('#bulk-transfer-result-table td#' + domain.name.replace(/\./g,'-') + '-' + local_count + '-transfer-status').html('Failed');
        } else if (response.data.pending_transfer) {
          $('#bulk-transfer-result-table td#' + domain.name.replace(/\./g,'-') + '-' + local_count + '-transfer-status').html('Pending transfer');
        } else {
          var domain_info = { name: domain.name.toString(), auth_code: domain.auth_code, auto_renew: 'true', privacy: 'true',
                              name_servers: (use_badger_dns ? 'ns1.badger.com,ns2.badger.com' : (response.data.name_servers || []).join(',')),
                              registrant_contact_id: contacts_id};
          Badger.registerDomain(domain_info, function(response) {
            if (response.meta.status != 'created') {
              $('#bulk-transfer-result-table td#' + domain.name.replace(/\./g,'-') + '-' + local_count + '-transfer-status').html('Failed');
            } else {
              $('#bulk-transfer-result-table td#' + domain.name.replace(/\./g,'-') + '-' + local_count + '-transfer-status').html('Succeed');
            }
          });
      }});
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
        h1('BULK TRANSFER (EXPERIMENTAL)'),
        div({ 'class': 'error-message hidden', id: 'bulk-transfer-form-error' }),
        form({ action: BulkTransfer.get_transfer_domain_lists },
          p('Domains and their corresponding authentication codes, each pair per line:'),
          textarea({ name: 'transfer_domains_list', style: 'width: 80%; height: 180px;' }),
          div(span('Registrant:'),
            span(select({ name: 'contacts_id', style: 'width: 150px; margin: 10px 10px; text-align: center' },
              WhoisApp.profile_options_for_select()
          ))),
          div(input({ type: 'checkbox', name: 'use_badger_dns', value: 'ns1.badger.com,ns2.badger.com', checked: 'checked', id: 'use_badger_dns', style: "margin: 5px 5px 5px 0" }),
          label({ 'for': 'use_badger_dns' }, 'Use Badger DNS')),
          div({ style: 'text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Next' }))
        )
      )
		);
	});

  define('confirm_transfer', function(domains_list, use_badger_dns, contacts_id) {
    show_modal(
      div(
        h1('CONFIRM TRANSFER'),
        p('You are about to transfer ' + domains_list.length + (domains_list.length > 1 ? ' domains.' : ' domain.')),
        a({ href: curry(BulkTransfer.proceed_bulk_transfer, domains_list, use_badger_dns, contacts_id), 'class': 'myButton'}, 'Complete Transfer')
      )
    )
  });

  define('bulk_transfer_result', function(domains_list) {
    var count = 0;
    var list = domains_list.map(function(domain) {
      return tr(
        td(domain.name),
        td(domain.auth_code),
        td({ id: domain.name.replace(/\./g,'-') + '-' + ++count + '-transfer-status' }, 'Processing')
      )
    });

    show_modal(
      h1('BULK TRANSFER RESULT'),
      p('In processing, please wait...'),
      div({ 'class': 'y-scrollbar-div' },
        table({ 'class': 'fancy-table', id: 'bulk-transfer-result-table' },
          tbody(
            tr(
              th('Domain Name'),
              th('Authentication Code'),
              th('Transfer Status')
            ),
            list
          )
        )
      ),
      div({ style: 'text-align: right; margin-top: 10px;' }, a({ href: close_bulk_modal, 'class': 'myButton', value: "submit" }, "Close"))
    );
  });
}
