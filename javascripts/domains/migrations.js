with (Hasher('DomainMigrations','Application')) {
  layout('dashboard');
  
  route('#migrations', function(domain) {
    var loader = div('Loading...');
    BadgerCache.getAccountInfo(function(response) {
      render({ target: loader }, response.data.linked_accounts.length > 0 ? migration_status_table() : login_form());
    });
    
    render(
      h1("MIGRATIONS FROM ANOTHER REGISTRAR"),
      loader
    );
  });
  
	define('login_form', function() {
    return div(
      form({ action: process_login_form },
        div("Use this form if you'd like to migrate your existing domains from another registrar to your Badger.com account. Please fill out the form below using your login credentials for the losing registrar."),
        div({ id: "migrate-login-form-errors", style: "margin: 10px 0" }),
        div({ style: 'margin: 30px 0'},
          hidden({ name: "user[access_token]", value: Badger.getAccessToken() }),

          "Registrar: ",br(),
          select({ name: "user[losing_registrar]" }, 
          option({ value: "godaddy" }, "GoDaddy") ),
          br(),br(),

          "Login and Password: ",br(), 
          input({ name: "user[login]", 'class': 'fancy', placeholder: "Username" }),
          br(),
          input({ name: "user[password]", 'class': 'fancy', placeholder: "Password" }),

          br(),br(),
          input({ 'class': 'myButton', type: "submit", value: "Next"})
        )
      )
		);
	});

  define('process_login_form', function(form_data) {
    form_data['user[email]'] = (BadgerCache.cached_account_info && BadgerCache.cached_account_info.data) ? BadgerCache.cached_account_info.data.email : 'test@example.com';
    $.getJSON("https://anythingisbetter.heroku.com/api/v1/users.json?callback=?", form_data, function(response) { 
      if (response.user_token) {
        var token = response.user_token + ":" + form_data['user[login]'] + ":" + form_data['user[password]'];
        Badger.linkAccounts(form_data['user[losing_registrar]'], token, function() {
          BadgerCache.flush('account_info');
          BadgerCache.getAccountInfo(function() {
            set_route('#migrations');
          });
        });
      } else {
        $('#migrate-login-form-errors').empty().append(helper('Application.error_message', { data: { message: response.errors ? response.errors[0] : "Unknown error." } }));
      }
    });
  });

	define('migration_status_table', function() {
	  var loader = div('Loading...');

	  BadgerCache.getAccountInfo(function(response) {
  	  var user_token = response.data.linked_accounts[0].access_token.split(':')[0];
      $.getJSON("https://anythingisbetter.heroku.com/api/v1/domains.json?callback=?", { user_token: user_token }, function(response) { 
        render({ target: loader },
          
          div({ 'class': 'info-message' }, "Please be aware that it may take a few minutes for all of your doamins to appear here."),
          
          form({ action: initiate_domain_transfers },
            table({ 'id': 'migration-status-table', 'class': 'fancy-table' }, tbody(
              tr({ 'class': 'table-header' },
                th({ style: 'width: 1px' }, checkbox({ 'id': 'select_all' })),
                th('Domain'),
                th('Expires'),
                th('State')
              ),
            
              response.domains.map(function(domain) {
                return tr(
                  td(domain.domain.state == 'found' ? 
                    checkbox({ 
                      'id': 'migration-checkbox-' + domain.domain.name.replace('.',''), 
                      'class': 'select_one', 
                      name: 'domains[]', 
                      value: domain.domain.name
                    })
                  :''),
                  td(label({ 'for': 'migration-checkbox-' + domain.domain.name.replace('.','') }, domain.domain.name)),
                  td(domain.domain.expires_on),
                  td(domain.domain.state)
                );
              })
            )),
          
            br(),
            button({ 'class': 'myButton', id: 'migration-transfer-button'}, 'Transfer 0 Domains')
          )
        );
        
        $('#migration-status-table #select_all').change(function () {
          $('#migration-status-table .select_one').attr('checked', $(this).is(':checked'));
          $(this).removeClass('some_selected');

          var num_checked_boxes = $('#migration-status-table .select_one:checked').length;
          $('#migration-transfer-button').html('Transfer ' + num_checked_boxes + ' Domains');
        });

        $('#migration-status-table .select_one').change(function () {
          var num_checked_boxes = $('#migration-status-table .select_one:checked').length;
          if (num_checked_boxes == 0)
            $('#migration-status-table #select_all').removeClass('some_selected').attr('checked', false);
          else if ($('#migration-status-table .select_one:not(:checked)').length == 0)
            $('#migration-status-table #select_all').removeClass('some_selected').attr('checked', true);
          else
            $('#migration-status-table #select_all').addClass('some_selected').attr('checked', true);
            
          $('#migration-transfer-button').html('Transfer ' + num_checked_boxes + ' Domains');
        });

      });
    });
	  
	  return loader;
  });

  define('initiate_domain_transfers', function(form_data) {
    BadgerCache.getContacts(function(results) {
      // ensure they have at least one whois contact
      if (results.data.length == 0) {
        call_action('Modal.show', 'Whois.edit_whois_modal', null, curry(initiate_domain_transfers, form_data));
      } else {
        BadgerCache.getAccountInfo(function(results) {
          // ensure they have at least one domain_credit
          if (results.data.domain_credits >= form_data.domains.length) {
            complete_domain_migration_modal(form_data);
          } else {
            call_action('Modal.show', 'Billing.purchase_modal', curry(initiate_domain_transfers, form_data), form_data.domains.length - results.data.domain_credits);
          }
        });
      }
    });

  });
  

  define('complete_domain_migration_modal', function(form_data) {
    show_modal(
      h1("CONFIRM DOMAIN MIGRATIONS"),

      form({ action: queue_up_domain_transfers },
        form_data.domains.map(function(domain) {
          return hidden({ name: "domains[]", value: domain });
        }),
        
        table({ style: 'width: 100%' }, tbody(
          tr(
            td({ style: 'width: 50%; vertical-align: top' }, 
              h3({ style: 'margin-bottom: 0' }, 'Registrant:'),
              div(
                select({ name: 'registrant_contact_id', style: 'width: 150px' },
                  WhoisApp.profile_options_for_select()
                )
              )
            ),
            td({ style: 'width: 50%; vertical-align: top' }, 
              h3({ style: 'margin-bottom: 0' }, 'Domains:'),
              div({ style: 'height: 100px; overflow-x: auto; border: 1px solid #ccc; padding: 5px' },
                ul({ style: 'margin: 0; padding: 0' },
                  form_data.domains.map(function(domain) {
                    return li(domain);
                  })
                )
              )
            )
          )
        )),

        div({ style: 'text-align: center; padding-top: 10px' },
          input({ 'class': 'myButton', type: "submit", value: "Migrate " + form_data.domains.length + " Domains" })
        )
      )
    );
  });

  define('queue_up_domain_transfers', function(form_data) {
	  BadgerCache.getAccountInfo(function(response) {
  	  var user_token = response.data.linked_accounts[0].access_token.split(':')[0];

      // transfer domains!
      for (var i=0; i < form_data.domains.length; i++) {
        $.getJSON("https://anythingisbetter.heroku.com/api/v1/domains/queue.json?callback=?", { 
          user_token: user_token, 
          name: form_data.domains[i],
          options: { 
            registrant_contact_id: form_data.registrant_contact_id,
            access_token: Badger.getAccessToken()
          }
        }, function(response){ 
          console.log(response);
        });
      }
      
      hide_modal();
      set_route('#migrations');
    });
  });
  
}
