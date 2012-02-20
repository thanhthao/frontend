with (Hasher('Transfer','Application')) {
  Transfer.current_action = 'transfer';

  define('show', function(registry_transfer_action, domains) {
    Transfer.current_action = (registry_transfer_action ? registry_transfer_action : 'transfer');
    if (!Badger.getAccessToken()) {
      Signup.require_user_modal(curry(Transfer.show, Transfer.current_action));
      return;
    }

    BadgerCache.getContacts(function(contacts) {
      if (contacts.data.length == 0) {
        Whois.edit_whois_modal(null, curry(Transfer.show, Transfer.current_action), "You must have at least one contact profile to " + Transfer.current_action + " domain.");
      } else if (domains) {
        show_domain_status_table({ domains: domains });
      } else {
        transfer_domains_form();
      }
    });
  });

	define('transfer_domains_form', function() {
    show_modal(
      div(
        Transfer.current_action == 'transfer' ? h1('TRANSFER DOMAINS INTO BADGER.COM')
                             : h1('REGISTER DOMAINS WITH BADGER.COM'),
        div({ 'class': 'error-message hidden', id: 'transfer-form-error' }),
        form({ action: show_domain_status_table },
          p("Enter the domain(s) that you'd like to " + Transfer.current_action + ", one per line:"),

          textarea({ name: 'domains', placeholder: 'badger.com', style: 'width: 80%; height: 75px; float: left' }),
          div({ style: 'margin-top: 60px; text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Next' })),
          div({ style: 'clear: both' })
        )
      )
		);
	});

  define('row_id_for_domain', function(domain) {
    return domain.replace(/\./g,'-') + '-domain';
  });

  define('show_domain_status_table', function(form_data) {
    var domains = [];
    (typeof(form_data.domains) == "string" ? form_data.domains.split('\n') : form_data.domains).map(function(domain) {
      if (domain.trim() != '') domains.push(domain.trim().toLowerCase());
    });
    $.unique(domains).sort();

    if (domains.length == 0) {
      $('#transfer-form-error').html('Invalid Domains Input');
      $('#transfer-form-error').removeClass('hidden');
      return;
    }

    show_modal(
      form({ action: confirm_transfers },
        h1(Transfer.current_action == 'transfer' ? 'TRANSFER IN DOMAINS' : 'REGISTER DOMAINS'),
        div({ 'class': 'y-scrollbar-div' },
          table({ 'class': 'fancy-table', id: 'transfer-domains-table' },
            tbody(
              tr({ 'class': 'table-header' },
                th('Name'),
                th('Registrar'),
                th('Expires'),
                th()
              ),
              domains.map(generate_row_for_domain),
              tr({ id: 'add-domain-to-table-row' },
                td(
                  form({ action: add_domain_to_table },
                    text({ name: 'name', id: 'add_domain_to_table_text', placeholder: 'Add another domain...', style: 'width: 150px; border: 1px solid #bbb; padding: 3px; margin: 3px 5px 3px 0' }),
                    submit({ style: 'background: url(images/add.gif); width: 16px; height:16px; border: 0; border: 0; margin: 0; padding: 0; text-indent: -1000px' })
                  )
                ),
                td({ colSpan: '3' })
              )
            )
          )
        ),

        div({ style: "margin-top: 20px; text-align: right "},
          input({ type: 'hidden', name: 'hidden_tag_anchor', id: 'hidden_tag_anchor', value: '' }),
          submit({ 'id': 'continue-transfer-btn', 'class': 'myButton', value: "Cancel" })
        )
      )
    );
  });

  define('generate_row_for_domain', function(domain) {
    update_domain_info(domain);
    return tr({ id: row_id_for_domain(domain), 'class': 'domain-row' },
      td(domain),
      td({ 'class': 'registrar_domain' }, img({ 'class': 'ajax_loader', style: "padding-left: 20px", src: 'images/ajax-loader.gif'})),
      td({ 'class': 'expires_domain' }),
      td({ style: 'width: 16px' }, img({ 'class': 'domain_row_trash_icon', src: 'images/trash.gif', onClick: curry(remove_domain_from_table,domain) }))
    );
  });

  // valid: true - green, false - red, null - white
  define('set_background_color_if_valid', function(domain, valid) {
    var item_id = '#' + row_id_for_domain(domain);
    $(item_id).removeClass("error-row").removeClass("success-row");
    if (valid == true) $(item_id).addClass("success-row");
    if (valid == false) $(item_id).addClass("error-row");
  });

  define('show_error_for_domain', function(domain, message) {
    set_background_color_if_valid(domain, false);
    $('#' + row_id_for_domain(domain) + ' .expires_domain').remove();
    $('#' + row_id_for_domain(domain) + ' .registrar_domain').attr('colSpan', '2').html(span({ 'class': 'error' }, message));
  });


  define('add_domain_to_table', function(form_data) {
    if ($('#' +row_id_for_domain(form_data.name)).length == 0) {
      $('#add-domain-to-table-row').before(generate_row_for_domain(form_data.name));
      $('#add_domain_to_table_text').val('');
      update_continue_button_count();
    }
  });

  define('remove_domain_from_table', function(domain) {
    $('#' + row_id_for_domain(domain)).remove();
    remove_hidden_field_for_domain(domain);
    update_continue_button_count();
  });

  define('update_continue_button_count', function() {
    var num = $('#transfer-domains-table .success-row').length;
    $('#continue-transfer-btn').val(num == 0 ? 'Cancel' : ('Continue with ' + num + ' domain' + (num == 1 ? '' : 's')));
  });

  define('update_domain_info', function(domain) {
    var item_id = '#' + row_id_for_domain(domain);

    Badger.getDomain(domain, function(response) {
      var domain_info = response.data;

      if (response.meta.status == 'not_found') {
       show_error_for_domain(domain, 'Invalid domain format');
      } else if (response.meta.status != 'ok') {
       show_error_for_domain(domain, response.data.message || 'Error: Internal server error');
      } else if (domain_info.available) {
        //show_error_for_domain(domain, 'Domain not currently registered.');
        set_background_color_if_valid(domain, true);
        add_hidden_field_for_domain(domain, false);
        $(item_id + ' .registrar_domain').html('<i>Register at Badger.com</i>');
        $(item_id + ' .expires_domain').html('<i>Available!</i>');
      } else if (!domain_info.supported_tld) {
        show_error_for_domain(domain, "Extension ." + domain.split('.').pop() + " is not currently supported.");
      } else if (domain_info.current_registrar == 'Unknown') {
        // not done loading, try again in a few seconds if the dialog is still open
        if ($('#transfer-domains-table')) setTimeout(curry(update_domain_info, domain), 2000);
      } else {
        set_background_color_if_valid(domain, true);
        add_hidden_field_for_domain(domain, true);
        $(item_id + ' .registrar_domain').html(domain_info.current_registrar);
        $(item_id + ' .expires_domain').html(domain_info.expires_at.slice(0,10));
      }
      update_continue_button_count();
    });
  });

  define('add_hidden_field_for_domain', function(domain, is_a_transfer) {
    $('#hidden_tag_anchor').after(input({ type: "hidden", name: is_a_transfer ? "transfer_domains[]" : "new_domains[]", value: domain, id: row_id_for_domain(domain + '-hidden') }));
  });

  define('remove_hidden_field_for_domain', function(domain) {
    $('#' + row_id_for_domain(domain + '-hidden')).remove();
  });

  define('confirm_transfers', function(form_data) {
    var transfer_domains = form_data.transfer_domains||[];
    var new_domains = form_data.new_domains||[];
    var domain_count = transfer_domains.length + new_domains.length;
    
    // close if they clicked "Cancel" button before domains finished loading
    if (domain_count == 0) return close_transfer_modal();
    
    show_modal(
      h1('CONFIRMATION: ' + domain_count + ' DOMAINS'),

      form({ action: register_or_transfer_all_domains },
        transfer_domains.map(function(domain) { return input({ type: "hidden", name: "transfer_domains[]", value: domain }); }),
        new_domains.map(function(domain) { return input({ type: "hidden", name: "new_domains[]", value: domain }); }),

        table({ style: 'width: 100%' },
          tr(
            td({ style: 'width: 50%; vertical-align: top'},
              h3({ style: 'margin-bottom: 3px' }, 'Free Options:'),
              div(
                div(
                  checkbox({ name: 'privacy', value: 'yes', checked: 'checked' }), 'Enable whois privacy'
                ),

                div(
                  checkbox({ name: 'import_dns', value: 'yes', checked: 'checked' }), 'Automatically import DNS'
                ),

                div(
                  checkbox({ name: 'auto_renew', value: 'yes', checked: 'checked' }), 'Auto-renew on expiration date'
                )
              )
            ),
            td({ style: 'width: 50%; vertical-align: top'},
              h3({ style: 'margin-bottom: 3px' }, 'Registrant:'),
              div(
                select({ id: 'registrant_contact_id', name: 'registrant_contact_id', style: 'width: 150px' }, Registration.profile_options_for_select())
              )
            )
          )
        ),

        div({ style: "margin-top: 20px; text-align: right "},
          input({ type: 'hidden', name: 'hidden_tag_anchor', id: 'hidden_tag_anchor', value: '' }),
          submit({ type: 'submit', 'class': 'myButton', value: 'Register for ' + domain_count + ' Credits' })
        )
      )
    );
  });

  define('possibly_show_close_button_on_register_screen', function(domain_count) {
    if ($('#transfer-domains-table .success-row, #transfer-domains-table .error-row').length == domain_count) {
      $('#transfer-domains-table').after(
        div({ style: 'margin-top: 10px; text-align: right' },
          a({ href: close_transfer_modal, 'class': 'myButton' }, 'Close')
        )
      );
    }
  });

  define('register_or_transfer_all_domains', function(form_data) {
    start_modal_spin('Processing...');

    var transfer_domains = form_data.transfer_domains||[];
    var new_domains = form_data.new_domains||[];
    var domains = transfer_domains.concat(new_domains).sort();
    var domain_count = domains.length;

    BadgerCache.getAccountInfo(function(account_info) {
      if (account_info.data.domain_credits < domain_count) {
        Billing.purchase_modal(curry(register_or_transfer_all_domains, form_data), domain_count - account_info.data.domain_credits);
      } else {
        show_modal(
          h1('REGISTRATION STATUS'),
          div({ 'class': 'y-scrollbar-div' },
            table({ 'class': 'fancy-table', id: 'transfer-domains-table' },
              tbody(
                tr({ 'class': 'table-header' },
                  th('Name'),
                  th('Status')
                ),
                domains.map(function(domain) {
                  return tr({ id: row_id_for_domain(domain), 'class': 'domain-row' },
                    td(domain),
                    td({ 'class': 'status-cell' }, img({ 'class': 'ajax_loader', style: "padding-left: 20px", src: 'images/ajax-loader.gif'}))
                  );
                })
              )
            )
          )
        );

        transfer_domains.map(function(domain) {
          var domain_info = {
            name: domain,
            registrant_contact_id: form_data.registrant_contact_id,
            auto_renew: form_data.auto_renew,
            privacy: form_data.privacy,
            import_dns: form_data.import_dns
          };
          Badger.transferDomain(domain_info, function(response) {
            if (response.meta.status != 'created') {
              set_background_color_if_valid(domain, false);
              $('#' + row_id_for_domain(domain) + ' .status-cell').html(response.data.message);
            } else {
              set_background_color_if_valid(domain, true);
              $('#' + row_id_for_domain(domain) + ' .status-cell').html('Success!');
            }
            possibly_show_close_button_on_register_screen(domain_count);
          });
        });

        new_domains.map(function(domain) {
          var domain_info = {
            name: domain,
            registrant_contact_id: form_data.registrant_contact_id,
            auto_renew: form_data.auto_renew,
            privacy: form_data.privacy,
            years: (form_data.years ? form_data.years : 1)
          };
          Badger.registerDomain(domain_info, function(response) {
            if (response.meta.status != 'created') {
              set_background_color_if_valid(domain, false);
              $('#' + row_id_for_domain(domain) + ' .status-cell').html(response.data.message);
            } else {
              set_background_color_if_valid(domain, true);
              $('#' + row_id_for_domain(domain) + ' .status-cell').html('Success!');
            }

            possibly_show_close_button_on_register_screen(domain_count);
          });
        });
      }
    });
  });

  define('close_transfer_modal', function() {
    BadgerCache.flush('domains');
    BadgerCache.getDomains(function() { update_my_domains_count(); });
    update_credits(true);
    hide_modal();
    set_route('#');
  });


  // define('confirm_transfer', function() {
  //   if ($("#transfer-domains-table .success-row").length > 0 ) {
  //     var contact_id = $('#registrant_contact_id').val();
  //     var use_badger_dns = ($("#use_badger_dns").attr('checked') ? $("#use_badger_dns").val() : '');
  //     var domains_list = $.grep(Transfer.domains, function(domain) {
  //       return domain.auth_code_verified && domain.not_locked && domain.no_privacy;
  //     })
  //
  //     show_modal(
  //       div(
  //         h1('CONFIRM TRANSFER'),
  //         p('You are about to transfer ' + domains_list.length + (domains_list.length > 1 ? ' domains.' : ' domain.')),
  //         a({ href: curry(proceed_transfer, domains_list, use_badger_dns, contact_id), 'class': 'myButton'}, 'Complete Transfer')
  //       )
  //     )
  //   } else {
  //     alert("No domains available for transfering")
  //   }
  // });




  // if ($("input[name$=account_id]:checked").length > 0) {
  //  showSharePreview("\"I just transfered " + $("tr[id$=domain]").length + " " + ($("tr[id$=domain]").length > 1 ? "domains" : "domain") + "  " + ($(".registrar_domain").html() ? "from " + $(".registrar_domain").html() : "") + " to Badger.com!\"");
  // }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  // define('verify_transfer', function(use_badger_dns, contacts_id) {
  //   start_modal_spin('Processing...');
  //
  //   BadgerCache.getAccountInfo(function(account_info) {
  //     // ensure they have at least one domain_credit
  //     if (account_info.data.domain_credits < Transfer.domains.length) {
  //       Billing.purchase_modal(curry(Transfer.verify_transfer, Transfer.domains, use_badger_dns));
  //     } else {
  //       confirm_transfer(Transfer.domains, use_badger_dns, contacts_id);
  //     }
  //   });
  // });
  //
  // define('proceed_transfer', function(domain_list, use_badger_dns, contacts_id) {
  //   transfer_result(domain_list);
  //
  //   var count = -1;
  //   domain_list.map(function(domain) {
  //     var domain_info = {
  //       name: domain.name.toString(),
  //       auth_code: domain.auth_code,
  //       auto_renew: 'true',
  //       privacy: 'true',
  //       name_servers: (use_badger_dns == "" ? (domain.name_servers || []).join(',') : use_badger_dns),
  //       registrant_contact_id: contacts_id
  //     };
  //     Badger.registerDomain(domain_info, function(response) {
  //       if (response.meta.status != 'created') {
  //         $('#' + domain.name.replace(/\./g,'-') + '-transfer-status').html(div({ 'class': "transfer-failed" }, 'Failed'));
  //       } else {
  //         $('#' + domain.name.replace(/\./g,'-') + '-transfer-status').html(div({ 'class': "transfer-success" }, 'Success!'));
  //       }
  //     });
  //   });
  // });
  //
  // define('transfer_domains_list', function() {
  //   var count = -1;
  //
  // });
  //
  //
  // define('update_all_domains_info', function(domain) {
  //   Transfer.domains.map(update_domain_info);
  // });
  //
  //
  //
  //
  // define('help_question_mark', function() {
  //   return a({ href: '#knowledge_center', target: '_blank' }, '?');
  // });
  //
  // define('ajax_loader', function() {
  //   return ;
  // });
  //
  // define('show_ajax_spinner', function(domain) {
  //   $('#' + row_id_for_domain(domain) + ' .ajax_loader').removeClass("hidden");
  // });
  //
  // define('hide_ajax_spinner', function(domain) {
  //   if(domain.auth_code_verified != null && domain.not_locked != null && domain.no_privacy != null) {
  //     $('#' + row_id_for_domain(domain) + ' .ajax_loader').addClass("hidden");
  //   }
  // });
  //
  //
  // define('auth_code_input', function(domain) {
  //   return text({ 'class': 'auth-code-input', events: {
  //     keyup: function(event){
  //       if(event.keyCode == 13){
  //         domain.auth_code = $(this).val();
  //         verify_auth_code(domain)
  //       }
  //     }
  //   }})
  // });
  //
  // define('checked_valid_row', function(domain) {
  //   if(domain.auth_code_verified && domain.not_locked && domain.no_privacy) {
  //     set_background_color_if_valid(domain, true);
  //     $('#continue-transfer-btn').html('Continue with ' + $("#transfer-domains-table .success-row").length +  ' Domain' + ($("#transfer-domains-table .success-row").length > 1 ? 's' : ''));
  //   }
  // });
  //
  // define('verify_auth_code', function(domain) {
  //   var item_id = '#' + row_id_for_domain(domain);
  //
  //   if ($(item_id + ' .auth-code-input').val()) domain.auth_code = $(item_id + ' .auth-code-input').val();
  //
  //   show_ajax_spinner(domain);
  //   if (domain.auth_code != null && domain.auth_code != "") {
  //     Badger.getDomain(domain.name, { auth_code: domain.auth_code }, function(response) {
  //       if (response.data.code == 2202 || response.meta.status != 'ok') {
  //         // failed
  //         domain.auth_code_verified = false;
  //         $(item_id + ' .auth_code_domain').html(auth_code_input(domain));
  //       } else {
  //         // ok
  //         domain.auth_code_verified = true;
  //         checked_valid_row(domain);
  //         $(item_id + ' .auth_code_domain').html("Ok")
  //       }
  //       hide_ajax_spinner(domain);
  //     });
  //   } else {
  //     hide_ajax_spinner(domain);
  //     domain.auth_code_verified = false;
  //     $(item_id + ' .auth_code_domain').html(auth_code_input(domain));
  //   }
  // });
  //
  // define('transfer_result', function(domains_list) {
  //   var count = -1;
  //   var list = domains_list.map(function(domain) {
  //     return tr(
  //       td(domain.name),
  //       td(domain.auth_code),
  //       td({ id: domain.name.replace(/\./g,'-') + '-transfer-status' }, div({ 'class': "transfer-processing" }, 'Processing'))
  //     )
  //   });
  //
  //   var modal = show_modal(
  //     h1('TRANSFER RESULT'),
  //     div({ 'class': 'y-scrollbar-div' },
  //       table({ 'class': 'fancy-table', id: 'transfer-result-table' },
  //         tbody(
  //           tr(
  //             th('Domain Name'),
  //             th('Authentication Code'),
  //             th('Transfer Status')
  //           ),
  //           list
  //         )
  //       )
  //     ),
  //     div({ style: 'text-align: right; margin-top: 10px;', id: "close-transfer-button" }, ajax_loader())
  //   );
  //
  //   // If all processing elements are gone, show the button. If all succeeded, make button go to share dialog, otherwise hide modal.
  //   var timer = setInterval(function() {
  //     if ($("div.transfer-processing").length == 0) {
  //       clearTimeout(timer);
  //
  //       if ($("div.transfer-failed").length > 0) {
  //         $("#close-transfer-button").html(
  //           a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
  //         );
  //       } else {
  //         $("#close-transfer-button").html(
  //           a({ href: curry(LinkedAccounts.show_share_transfer_modal, domains_list.length), 'class': 'myButton', value: "submit" }, "Continue")
  //         );
  //       }
  //     }
  //   }, 200);
  //
  //   return modal;
  // });

}