with (Hasher('Transfer','Application')) {

  define('show', function(default_domains, skip) {
    if (!Badger.getAccessToken()) {
      Signup.require_user_modal(Transfer.show);
      return;
    }
    
    BadgerCache.getContacts(function(contacts) {
      if (contacts.data.length == 0) {
        var custom_message = "You must have at least one contact profile to transfer domain.";
        Whois.edit_whois_modal(null, Transfer.show, custom_message);
      } else if (skip) {
        get_transfer_domain_lists({transfer_domains_list: default_domains});
      }
      else {
        transfer_domains_form(default_domains);
      }
    });
  });

  define('get_transfer_domain_lists', function(form_data) {
    var domains_list = form_data.transfer_domains_list.split('\n').map(function(item) { return item.trim(); });
    domains_list = $.grep(domains_list, function(i) {return i!= ""})
    var domains = domains_list.map(function(domain_info) {
      info = domain_info.split(/[ ,]+/);
      info = $.grep(info, function(i) {return i!= ""});
      return { name: info[0], auth_code: info[1] };
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
    domain_list.map(function(domain) {
      var domain_info = { name: domain.name.toString(), auth_code: domain.auth_code, auto_renew: 'true', privacy: 'true',
                          name_servers: (use_badger_dns == "" ? (domain.name_servers || []).join(',') : use_badger_dns) ,
                          registrant_contact_id: contacts_id};
      Badger.registerDomain(domain_info, function(response) {
        if (response.meta.status != 'created') {
          $('#' + domain.name.replace(/\./g,'-') + '-transfer-status').html('Failed');
        } else {
          $('#' + domain.name.replace(/\./g,'-') + '-transfer-status').html('Succeed');
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

	define('transfer_domains_form', function(default_domains) {
    show_modal(
      div(
        h1('TRANSFER DOMAINS INTO BADGER.COM'),
        div({ 'class': 'error-message hidden', id: 'transfer-form-error' }),
        form({ action: Transfer.get_transfer_domain_lists },
          p('Enter the domain(s) you\'d like to transfer in below, one per line. If you already have auth codes, include them next to each domain (e.g. "badger.com abc123def")'),
          
          textarea({ name: 'transfer_domains_list', placeholder: 'badger.com', style: 'width: 80%; height: 75px; float: left' }, default_domains),
          div({ style: 'margin-top: 60px; text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Next' })),
          div({ style: 'clear: both' })
        )
      )
		);
	});

  define('transfer_domains_list', function() {
    var count = -1;
    show_modal({ style: 'width: 800px' },
      h1('TRANSFER IN DOMAINS'),
      div({ style: 'float: right; margin-top: -44px' },
        a({ 'class': 'myButton myButton-small', href: curry(update_all_domains_info) }, 'Retry All')
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
              th({ style: 'text-align: center' }, 'Status')
            ),
            Transfer.domains.map(function(domain) {
              return tr({ id: row_id_for_domain(domain) },
                td(domain.name),
                td({ 'class': 'registrar_domain' }),
                td({ 'class': 'expires_domain' }),
                td({ 'class': 'auth_code_domain' }),
                td({ style: 'text-align: center', 'class': 'locked_domain' }),
                td({ style: 'text-align: center', 'class': 'privacy_domain' }),
                td({ style: 'text-align: center' }, 
                  a({ 'class': 'retry-link', href: curry(update_domain_info, domain) }, 'Retry'),
                  ajax_loader())
              )
            })
          )
        )
      ),
      div({ style: 'float: left; margin-top: 24px'},
        'Registrant: ',
        select({ id: 'registrant_contact_id', name: 'registrant_contact_id', style: 'width: 150px' }, Registration.profile_options_for_select()),
        ' ',
        input({ type: 'checkbox', name: 'use_badger_dns', value: 'ns1.badger.com,ns2.badger.com', checked: 'checked', id: 'use_badger_dns', style: "margin: 5px 5px 5px 20px" }),
        label({ 'for': 'use_badger_dns' }, ' Import existing DNS into Badger DNS')
      ),
      div({ style: "margin-top: 20px; text-align: right "},
        a({ 'id': 'continue-transfer-btn', 'class': 'myButton', href: curry(confirm_transfer) }, "Transfer in Domains")
      )
    );

    update_all_domains_info();
  });

  define('row_id_for_domain', function(domain) {
    return domain.name.replace(/\./g,'-') + '-domain';
  });

  define('update_all_domains_info', function(domain) {
    Transfer.domains.map(update_domain_info);
  });
  
  define('update_domain_info', function(domain) {

    set_background_color_if_valid(domain, null);
    show_ajax_spinner(domain);

    domain.auth_code_verified = null;
    domain.not_locked = null;
    domain.no_privacy = null;

    Badger.getDomainInfo({ name: domain.name }, function(response) {
      domain.not_locked = false;
      var item_id = '#' + row_id_for_domain(domain);
      set_background_color_if_valid(domain, false);
      if (response.data.code == 2303 || response.meta.status == "not_found") {
        // domain not found
        $(item_id).html([td(domain.name), td({ colSpan: '6' }, span({ 'class': 'error'}, 'Error: Domain not found'))]);
        domain.auth_code_verified = false;
        domain.no_privacy = false;
      }
			else if (response.data.code == 5000) {
				$(item_id).html([td(domain.name), td({ colSpan: '6' }, span({ 'class': 'error'}, 'Error: Unsupported top level domain (' + domain.name.split(".").reverse()[0] + ')'))]);
        domain.auth_code_verified = false;
        domain.no_privacy = false;
			}
      else if(response.data.code != 1000) {
        // interal server error
        $(item_id).html([td(domain.name), td({ colSpan: '6' }, span({ 'class': 'error'}, response.data.message || 'Error: Internal server error'))]);
        domain.auth_code_verified = false;
        domain.no_privacy = false;
      }
      else if(response.data.pending_transfer) {
        // pending transfer
        $(item_id).html([td(domain.name), td({ colSpan: '6' }, span({ 'class': 'error'}, 'Error: Pending transfer'))]);
        domain.auth_code_verified = false;
        domain.no_privacy = false;
      }
      else {
        verify_auth_code(domain);

        domain_info = response.data;
        domain.name_servers = domain_info.name_servers;
        $(item_id + ' .registrar_domain').html(domain_info.registrar.name)
        $(item_id + ' .expires_domain').html(domain_info.expires_on.slice(0, 10))
        $(item_id + ' .locked_domain').html(domain_info.locked ? span({ 'class': 'error'}, 'Yes') : "No");

        if (!domain_info.locked) {
          domain.not_locked = true;
          checked_valid_row(domain);
        }
        if (response.data.registrar.name.toLowerCase().indexOf('godaddy') != -1) {
          Badger.remoteWhois(domain.name, function(whois_response) {
            domain.no_privacy = false;
            $(item_id + ' .privacy_domain').html(whois_response.data.privacy ? span({ 'class': 'error'}, 'Yes') : "No");
            if (!whois_response.data.privacy) {
              domain.no_privacy = true;
              checked_valid_row(domain);
            }
            hide_ajax_spinner(domain);
          });
        }
        else {
          domain.no_privacy = true;
          checked_valid_row(domain);
          $(item_id + ' .privacy_domain').html("No");
        }
      }
      hide_ajax_spinner(domain);
    });
  });
  

  define('help_question_mark', function() {
    return a({ href: '#knowledge_center', target: '_blank' }, '?');
  });

  define('ajax_loader', function() {
    return img({ 'class': 'ajax_loader', src: 'images/ajax-loader.gif'});
  });

  define('show_ajax_spinner', function(domain) {
    $('#' + row_id_for_domain(domain) + ' .ajax_loader').removeClass("hidden");
  });

  define('hide_ajax_spinner', function(domain) {
    if(domain.auth_code_verified != null && domain.not_locked != null && domain.no_privacy != null) {
      $('#' + row_id_for_domain(domain) + ' .ajax_loader').addClass("hidden");
    }
  });
  
  // valid: true - green, false - red, null - white
  define('set_background_color_if_valid', function(domain, valid) {
    var item_id = '#' + row_id_for_domain(domain);
    $(item_id).removeClass("error-row").removeClass("success-row");
    if (valid == true) $(item_id).addClass("success-row");
    if (valid == false) $(item_id).addClass("error-row");
  });

  define('auth_code_input', function(domain) {
    return text({ 'class': 'auth-code-input', events: {
      keyup: function(event){
        if(event.keyCode == 13){
          domain.auth_code = $(this).val();
          verify_auth_code(domain)
        }
      }
    }})
  });

  define('checked_valid_row', function(domain) {
    if(domain.auth_code_verified && domain.not_locked && domain.no_privacy) {
      set_background_color_if_valid(domain, true);
      $('#continue-transfer-btn').html('Continue with ' + $("#transfer-domains-table .success-row").length +  ' Domain' + ($("#transfer-domains-table .success-row").length > 1 ? 's' : ''));
    }
  });

  define('verify_auth_code', function(domain) {
    var item_id = '#' + row_id_for_domain(domain);
    
    if ($(item_id + ' .auth-code-input').val()) domain.auth_code = $(item_id + ' .auth-code-input').val();
    
    show_ajax_spinner(domain);
    if (domain.auth_code != null && domain.auth_code != "") {
      Badger.getDomainInfo({ name: domain.name, auth_code: domain.auth_code }, function(response) {
        if (response.data.code == 2202 || response.meta.status != 'ok') {
          // failed
          domain.auth_code_verified = false;
          $(item_id + ' .auth_code_domain').html(auth_code_input(domain));
        } else {
          // ok
          domain.auth_code_verified = true;
          checked_valid_row(domain);
          $(item_id + ' .auth_code_domain').html("Ok")
        }
        hide_ajax_spinner(domain);
      });
    } else {
      hide_ajax_spinner(domain);
      domain.auth_code_verified = false;
      $(item_id + ' .auth_code_domain').html(auth_code_input(domain));
    }
  });

  define('confirm_transfer', function() {
    if ($("#transfer-domains-table .success-row").length > 0 ) {
      var contact_id = $('#registrant_contact_id').val();
      var use_badger_dns = ($("#use_badger_dns").attr('checked') ? $("#use_badger_dns").val() : '');
      var domains_list = $.grep(Transfer.domains, function(domain) {
        return domain.auth_code_verified && domain.not_locked && domain.no_privacy;
      })

      show_modal(
        div(
          h1('CONFIRM TRANSFER'),
          p('You are about to transfer ' + domains_list.length + (domains_list.length > 1 ? ' domains.' : ' domain.')),
          a({ href: curry(Transfer.proceed_transfer, domains_list, use_badger_dns, contact_id), 'class': 'myButton'}, 'Complete Transfer')
        )
      )
    } else {
      alert("No domains available for transfering")
    }
  });

  define('transfer_result', function(domains_list) {
    var count = -1;
    var list = domains_list.map(function(domain) {
      return tr(
        td(domain.name),
        td(domain.auth_code),
        td({ id: domain.name.replace(/\./g,'-') + '-transfer-status' }, 'Processing')
      )
    });

    show_modal(
      h1('TRANSFER RESULT'),
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