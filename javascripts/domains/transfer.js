with (Hasher('Transfer','Application')) {

  define('show', function() {
    BadgerCache.getContacts(function(contacts) {
      if (contacts.data.length == 0) {
        var custom_message = "You must have at least one contact profile to transfer domain.";
        Whois.edit_whois_modal(null, Transfer.show, custom_message);
      } else {
        transfer_domains_form();
      }
    });
  });

  define('get_transfer_domain_lists', function(form_data) {
    var domains_list = form_data.transfer_domains_list.split('\n').map(function(item) { return item.trim(); });
    domains_list = $.grep(domains_list, function(i) {return i!= ""})
    var domains = domains_list.map(function(domain_info) {
      info = domain_info.split(' ')
      info = $.grep(info, function(i) {return i!= ""})
      return { name: info[0], auth_code: info[1] }
    })

    if (domains.length > 0) {
      Transfer.domains = domains;
      Transfer.transfer_domains_list();
    }
    else {
      $('#transfer-form-error').html('Invalid Domains Input');
      $('#transfer-form-error').removeClass('hidden');
    }
  });

  define('verify_transfer', function(use_badger_dns, contacts_id) {
    start_modal_spin('Processing...');

    BadgerCache.getAccountInfo(function(account_info) {
      // ensure they have at least one domain_credit
      if (account_info.data.domain_credits < Transfer.domains.length) {
        Billing.purchase_modal(curry(Transfer.verify_transfer, Transfer.domains, use_badger_dns));
      } else {
        confirm_transfer(Transfer.domains, use_badger_dns, contacts_id);
      }
    });
  });

  define('proceed_transfer', function(domain_list, use_badger_dns, contacts_id) {
    transfer_result(domain_list);

    var count = -1;
    $.each(domain_list, function() {
      var domain_index = ++count;
      var domain = this;
      var domain_info = { name: domain.name.toString(), auth_code: domain.auth_code, auto_renew: 'true', privacy: 'true',
                          name_servers: (use_badger_dns == "" ? (domain.name_servers || []).join(',') : use_badger_dns) ,
                          registrant_contact_id: contacts_id};
      Badger.registerDomain(domain_info, function(response) {
        if (response.meta.status != 'created') {
          $('#transfer-result-table td#' + domain.name.replace(/\./g,'-') + '-' + domain_index + '-transfer-status').html('Failed');
        } else {
          $('#transfer-result-table td#' + domain.name.replace(/\./g,'-') + '-' + domain_index + '-transfer-status').html('Succeed');
        }
      });
    });

  });

  define('close_transfer_modal', function() {
    BadgerCache.flush('domains');
    BadgerCache.getDomains(function() { update_my_domains_count(); });
    update_credits(true);
    hide_modal();
    set_route('#');
  });

	define('transfer_domains_form', function() {
    show_modal(
      div(
        h1('TRANSFER DOMAINS INTO BADGER.COM'),
        div({ 'class': 'error-message hidden', id: 'transfer-form-error' }),
        form({ action: Transfer.get_transfer_domain_lists },
          p('Enter the domains(s) you\'d like to transfer in bellow, one per line. If you already have auth codes, include them next to each domain (i.e. "badger.com abc123def")'),
          textarea({ name: 'transfer_domains_list', style: 'width: 80%; height: 180px;' }),
          div({ style: 'text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Next' }))
        )
      )
		);
	});

  define('transfer_domains_list', function() {
    var count = -1;
    show_modal(
      h1('TRANSFER IN DOMAINS'),
      div({ style: 'float: right; margin-top: -44px' },
        a({ 'class': 'myButton myButton-small', href: curry(update_domains_info) }, 'Refresh')
      ),
      div({ 'class': 'y-scrollbar-div' },
        table({ 'class': 'fancy-table', id: 'transfer-domains-table' },
          tbody(
            tr({ 'class': 'table-header' },
              th('Name'),
              th('Registrar'),
              th('Expires'),
              th('Auth Code'),
              th({ style: 'text-align: center' }, 'Locked'),
              th({ style: 'text-align: center' }, 'Privacy'),
              th()
            ),
            Transfer.domains.map(function(domain) {
              return tr({ id: domain.name.replace(/\./g,'-') + '-' + ++count + '-domain' },
                td(domain.name),
                td({ 'class': 'registrar_domain' }),
                td({ 'class': 'expires_domain' }),
                td({ 'class': 'auth_code_domain' }),
                td({ style: 'text-align: center', 'class': 'locked_domain' }),
                td({ style: 'text-align: center', 'class': 'privacy_domain' }),
                td(ajax_loader())
              )
            })
          )
        )
      ),
      div({ style: 'float: left; margin-top: 24px'},
        'Registrant:',
        select({ id: 'registrant_contact_id', name: 'registrant_contact_id', style: 'width: 150px' },
          WhoisApp.profile_options_for_select()
        ),br(),
        div(input({ type: 'checkbox', name: 'use_badger_dns', value: 'ns1.badger.com,ns2.badger.com', checked: 'checked', id: 'use_badger_dns', style: "margin: 5px 5px 5px 0" }),
        label({ 'for': 'use_badger_dns' }, ' Import into Badger DNS'))
      ),
      div({ style: "margin-top: 20px; text-align: right "},
        a({ 'id': 'continue-transfer-btn', 'class': 'myButton', href: curry(confirm_transfer) }, "Transfer in Domains")
      )
    )

    update_domains_info();
  });

  define('update_domains_info', function() {
    $('.ajax_loader').removeClass('hidden');
    var count = -1;
    $.each(Transfer.domains, function() {
      var domain_index = ++count;
      Transfer.domains[domain_index].verify_auth_code = null;
      Transfer.domains[domain_index].not_locked = null;
      Transfer.domains[domain_index].no_privacy = null;

      Badger.getDomainInfo({ name: this.name }, function(response) {
        domain = Transfer.domains[domain_index];
        Transfer.domains[domain_index].not_locked = false;
        var item_id = '#' + domain.name.replace(/\./g,'-') + '-' + domain_index + '-domain';
        $(item_id).addClass("error-row");
        if (response.data.code == 2303) {
          // domain not found
          $(item_id).html([td(domain.name), td({ colSpan: '5' }, span({ 'class': 'error'}, 'Error: Domain not found'))]);
          Transfer.domains[domain_index].verify_auth_code = false;
          Transfer.domains[domain_index].no_privacy = false;
        }
        else if(response.data.code != 1000) {
          // interal server error
          $(item_id).html([td(domain.name), td({ colSpan: '5' }, span({ 'class': 'error'}, 'Error: Internal server error'))]);
          Transfer.domains[domain_index].verify_auth_code = false;
          Transfer.domains[domain_index].no_privacy = false;
        }
        else if(response.data.pending_transfer) {
          // pending transfer
          $(item_id).html([td(domain.name), td({ colSpan: '5' }, span({ 'class': 'error'}, 'Error: Pending transfer'))]);
          Transfer.domains[domain_index].verify_auth_code = false;
          Transfer.domains[domain_index].no_privacy = false;
        }
        else {
          verify_auth_code(domain_index, item_id);

          domain_info = response.data;
          Transfer.domains[domain_index].name_servers = domain_info.name_servers;
          $(item_id + ' .registrar_domain').html(domain_info.registrar.name)
          $(item_id + ' .expires_domain').html(domain_info.expires_on.slice(0, 10))
          $(item_id + ' .locked_domain').html(domain_info.locked ? [span({ 'class': 'error'}, 'Yes'), span(' '), help_question_mark()] : "No");

          if (!domain_info.locked) {
            Transfer.domains[domain_index].not_locked = true;
            checked_valid_row(domain_index, item_id);
          }
          if (response.data.registrar.name.toLowerCase().indexOf('godaddy') != -1) {
            Badger.remoteWhois(Transfer.domains[domain_index].name, function(whois_response) {
              Transfer.domains[domain_index].no_privacy = false;
              $(item_id + ' .privacy_domain').html(whois_response.data.privacy ? [span({ 'class': 'error'}, 'Yes'), span(' '), help_question_mark()] : "No");
              if (!whois_response.data.privacy) {
                Transfer.domains[domain_index].no_privacy = true;
                checked_valid_row(domain_index, item_id);
              }
              update_ajax_loader_spin(domain_index, item_id);
            });
          }
          else {
            Transfer.domains[domain_index].no_privacy = true;
            checked_valid_row(domain_index, item_id);
            $(item_id + ' .privacy_domain').html("No");
          }
        }
        update_ajax_loader_spin(domain_index, item_id);
      });
    });
  });

  define('help_question_mark', function() {
    return a({ href: '#knowledge_center', target: '_blank' }, '?');
  });

  define('ajax_loader', function() {
    return img({ 'class': 'ajax_loader', src: 'images/ajax-loader.gif'});
  });

  define('update_ajax_loader_spin', function(domain_index, row_id) {
    if(Transfer.domains[domain_index].verify_auth_code != null && Transfer.domains[domain_index].not_locked != null && Transfer.domains[domain_index].no_privacy != null) {
      $(row_id + ' .ajax_loader').addClass("hidden");
    }
  });

  define('auth_code_input', function(domain_index, item_id) {
    return text({ 'class': 'auth-code-input', events: {
      keyup: function(event){
        if(event.keyCode == 13){
          Transfer.domains[domain_index].auth_code = $(this).val();
          verify_auth_code(domain_index, item_id)
        }
      }
    }})
  });

  define('checked_valid_row', function(domain_index, row_id) {
    if(Transfer.domains[domain_index].verify_auth_code && Transfer.domains[domain_index].not_locked && Transfer.domains[domain_index].no_privacy) {
      $(row_id).removeClass("error-row").addClass("success-row");
      $('#continue-transfer-btn').html('Continue with ' + $("#transfer-domains-table .success-row").length +  ' Domain' + ($("#transfer-domains-table .success-row").length > 1 ? 's' : ''));
    }
  });

  define('verify_auth_code', function(domain_index, item_id) {
    $(item_id + ' .ajax_loader').removeClass('hidden');
    var domain = Transfer.domains[domain_index];
    if(domain.auth_code != null && domain.auth_code != "") {
      Badger.getDomainInfo({ name: domain.name, auth_code: domain.auth_code }, function(response) {
        if (response.data.code == 2202 || response.meta.status != 'ok') {
          // failed
          Transfer.domains[domain_index].verify_auth_code = false;
          $(item_id + ' .auth_code_domain').html([auth_code_input(domain_index, item_id), span(' '), help_question_mark()]);
        } else {
          // ok
          Transfer.domains[domain_index].verify_auth_code = true;
          checked_valid_row(domain_index, item_id);
          $(item_id + ' .auth_code_domain').html("Ok")
        }
        update_ajax_loader_spin(domain_index, item_id);
      });
    }
    else {
      update_ajax_loader_spin(domain_index, item_id);
      Transfer.domains[domain_index].verify_auth_code = false;
      $(item_id + ' .auth_code_domain').html([auth_code_input(domain_index, item_id), span(' '), help_question_mark()]);
    }
  });

  define('confirm_transfer', function() {
    if($("#transfer-domains-table .success-row").length > 0 ) {
      var contact_id = $('#registrant_contact_id').val();
      var use_badger_dns = ($("#use_badger_dns").attr('checked') ? $("#use_badger_dns").val() : '');
      var domains_list = $.grep(Transfer.domains, function(domain) {
        return domain.verify_auth_code && domain.not_locked && domain.no_privacy;
      })

      show_modal(
        div(
          h1('CONFIRM TRANSFER'),
          p('You are about to transfer ' + domains_list.length + (domains_list.length > 1 ? ' domains.' : ' domain.')),
          a({ href: curry(Transfer.proceed_transfer, domains_list, use_badger_dns, contact_id), 'class': 'myButton'}, 'Complete Transfer')
        )
      )
    }
    else {
      alert("No domains available for transfering")
    }
  });

  define('transfer_result', function(domains_list) {
    var count = -1;
    var list = domains_list.map(function(domain) {
      return tr(
        td(domain.name),
        td(domain.auth_code),
        td({ id: domain.name.replace(/\./g,'-') + '-' + ++count + '-transfer-status' }, 'Processing')
      )
    });

    show_modal(
      h1('TRANSFER RESULT'),
      p('In processing, please wait...'),
      div({ 'class': 'y-scrollbar-div' },
        table({ 'class': 'fancy-table', id: 'transfer-result-table' },
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
      div({ style: 'text-align: right; margin-top: 10px;' }, a({ href: close_transfer_modal, 'class': 'myButton', value: "submit" }, "Close"))
    );
  });
}