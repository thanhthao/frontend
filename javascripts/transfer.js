with (Hasher.Controller('Transfer','Application')) {
  // route({
  //   '#domain-transfers': 'index'
  // });
  // 
  // create_action('index', function() {
  //   Badger.getPendingTransfers(function(results) {
  //     render('index', results.data);
  //   });
  // });

  create_action('show', function(domain) {
    BadgerCache.getContacts(function(results) {
      // ensure they have at least one whois contact
      if (results.data.length == 0) {
        call_action('Modal.show', 'Whois.edit_whois_modal', null, action('Transfer.show', domain));
      } else {
        BadgerCache.getAccountInfo(function(results) {
          // ensure they have at least one domain_credit
          if (results.data.domain_credits > 0) {
            call_action('Modal.show', 'Transfer.initiate_new_transfer', domain);
          } else {
            call_action('Modal.show', 'Billing.purchase_modal', action('Transfer.show', domain))
          }
        });
      }
    });
  });

  create_action('transfer_domain', function(form) {
    // prevent double submits            
    if ($('#register-button').attr('disabled')) return;
    else $('#register-button').attr('disabled', true);

    $('#errors').empty();

    Badger.registerDomain(form, function(response) {
      $('#register-button').attr('disabled', false);
      if (response.meta.status == 'ok') {
        helper('Application.update_credits', true);

        BadgerCache.flush('domains');
        BadgerCache.getDomains(function() {
          call_action('Modal.hide');
          redirect_to('#');
        })
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    })
  });

  layout('dashboard');
}

with (Hasher.View('Transfer', 'Application')) { (function() {

  // create_view('index', function(transfers) {
  //   return div(
  //     h1('Domain Transfers'),
  //     div({ style: 'float: right; margin-top: -44px' }, 
  //       a({ 'class': 'myButton myButton-small', href: action('show') }, 'Initiate New Transfer')
  //     ),
  //     
  //     (typeof transfers == 'undefined') ? [
  //       div('Loading transfers...')
  //     ]:((transfers.length == 0) ? [
  //       div("There are no pending domain transfers.  If you'd like to transfer a domain that you already own from another registrar, click the \"Initiate New Transfer\" above.")
  //     ]:[
  //       table({ 'class': 'fancy-table' },
  //         tbody(
  //           transfers.map(function(transfer) {
  //             return tr(
  //              td(transfer.domain),
  //              td(transfer.status)
  //             );
  //           })
  //         )
  //       )
  //     ])
  //   );
  // });

  create_helper('whois_contact_option', function(profile) {
    return option({ value: profile.id }, profile.first_name + ' ' + profile.last_name + (profile.organization ? ", " + profile.organization : '') + " (" + profile.address + (profile.address2 ? ', ' + profile.address2 : '') + ")");
  });

  create_helper('initiate_new_transfer', function() {
    return form({ action: action('Transfer.transfer_domain') },
      h1('Transfer in a Domain'),
      div({ id: 'errors' }),

      table({ style: 'width:100%' }, tbody(
        tr(
          td({ style: "width: 50%; vertical-align: top" },

            h3({ style: 'margin-bottom: 6px'}, 'Domain Authorization'),
            div('Domain: ', input({ name: 'name', placeholder: 'example.com' })),
            div('Auth Code: ', input({ name: 'auth_code', placeholder: 'abc123' })),

            h3({ style: 'margin-bottom: 6px'}, 'Advanced'),
            div('DNS: ', 
              select({ name: 'name_servers' }, helper('DNS.dns_provider_options'))
            ),
            input({ name: 'auto_renew', type: 'checkbox', checked: 'checked' }), 'Auto-renew'
          ),
          td({ style: "width: 50%; vertical-align: top" },
            h3({ style: 'margin-bottom: 6px'}, 'Contact Information'),
            div('Registrant: ', 
              select({ name: 'registrant_contact_id', style: 'width: 150px' },
                helper('Whois.profile_options_for_select')
              )
              // ' ',
              // input({ type: 'checkbox', checked: 'checked' }), 'Whois Privacy'
            ),
            div('Administrator: ', 
              select({ name: 'administrator_contact_id', style: 'width: 150px' },
                option({ value: '' }, 'Same as Registrant'),
                helper('Whois.profile_options_for_select')
              )
            ),
            div('Billing: ', 
              select({ name: 'billing_contact_id', style: 'width: 150px' },
                option({ value: '' }, 'Same as Registrant'),
                helper('Whois.profile_options_for_select')
              )
            ),
            div('Technical: ', 
              select({ name: 'technical_contact_id', style: 'width: 150px' },
                option({ value: '' }, 'Same as Registrant'),
                helper('Whois.profile_options_for_select')
              )
            ),
            div(
              input({ name: 'privacy', type: 'checkbox', checked: 'checked' }), 
              'Keep contact information private'
            )
          )
        )
      )),

      div({ style: 'text-align: right; margin-top: 10px' }, button({ 'class': 'myButton', id: 'register-button' }, 'Initiate Transfer'))
    );
  });

})(); }

