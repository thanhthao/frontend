with (Hasher('Registrar','Application')) {

  define('remove_link', function(data) {
    show_modal(
      div(
        h1('Confirm Account Unlinking?'),
        div({ 'class': 'hidden', id: 'link-form-error' }),
        p('* This cannot be undone, linked domains will be removed from your account.'),
        div({ style: 'text-align: right' }, a({ 'class': 'myButton red', href: curry(Registrar.do_remove_link, data) }, 'Unlink Account')),
        div({ style: 'clear: both' })
      )
    )
  });
  
  define('do_remove_link', function(data) {
    start_modal_spin('Removing Linked Account...');
    Badger.deleteLinkedAccount(data.id, function (response) {
			if (response.meta.status == 'ok') {
			  hide_modal();
				set_route('#linked_accounts');
      } else {
        $('#link-form-error').html(error_message(response)).show();
        stop_modal_spin();
      }
		});
  });
    
  define('show_link', function(data) {
		var login_text;
		if (!data.id) {
			data.id = '';
		}
		switch (data.site) {
			case 'godaddy':
				data.registrar_name = 'Go Daddy';
				login_text = 'Customer # or Login';
				break;
				case 'networksolutions':
					data.registrar_name = 'Network Solutions';
					login_text = 'User ID';
					break;
			default:
				alert('Unknown Site');
				return false;
		}
		show_modal(
			div(
				h1('Link your ' + data.registrar_name + ' Account'),
				div({ 'class': 'hidden', id: 'link-form-error' }),
				p("Lorem ipsum dolor sit amet ", strong('consectetur adipisicing elit'), " tempor incididunt ut labore et dolore magna."),
				form({ id: 'registrar-link-form', action: curry(Registrar.start_link, data, 'Starting Linking...'), style: "width:320px; margin: 10px auto;" },
				  input({ type: 'hidden', name: 'linked_account_id', id: 'linked-account-id', value: data.id}),
					div(input({ type: 'text', name: 'login', placeholder: login_text, value: data.login ? data.login : '' })),
          div(input({ type: 'password', name: 'password', placeholder: 'Password' })),
					div(
						input({ type: 'checkbox', name: 'agree_to_terms', id: 'agree_to_terms', value: true }),
						label({ 'for': 'agree_to_terms' }, 'I allow Badger.com to act as my agent')
					),
					div({ style: 'text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Link Accounts' })),
					div({ style: 'clear: both' })
				)
			)	
		)
		return data;
  });
  
  define('sync_now', function(data) {
    // draw form for error handling but skip past it
    data = Registrar.show_link(data);
    data.sync = true;
    Registrar.start_link(data, 'Starting Sync...', {});
  });

  define('start_link', function(data, message, form_data) {
		start_modal_spin(message);
		$('#modal-dialog a.close-button').hide();
    $('#errors').empty();
    data = $.extend(form_data, data);

		var callback = function (response) {
			if (response.data.linked_account_id) {
			  data.id = response.data.linked_account_id
				$('#linked-account-id').val(data.id);
			}
			if (response.meta.status == 'ok') {
        // start_modal_spin('Logging in to ' + data.registrar_name + '...');
				setTimeout(curry(Registrar.poll_link, 70000, data), 1500);
      } else {
        $('#link-form-error').html(error_message(response)).show();
				$('#modal-dialog a.close-button').show();
        stop_modal_spin();
      }
		};
		
		if (data.sync) {
		  Badger.syncLinkedAccount(data.id, callback);
		}
		else if (data.linked_account_id) {
			// update existing account
			Badger.updateLinkedAccount(data.id, data, callback);
		}
		else {
			// create account
			Badger.createLinkedAccount(data, callback);
		}
	});
		
	define('poll_link', function(ttl, data) {
		Badger.getLinkedAccount(data.id, function (response) {
			if (response.meta.status == 'ok') {
				switch (response.data.status) {
					case 'synced':
						// success
						hide_modal();
						BadgerCache.reload('domains')
						set_route('#filter_domains/all/list');
						break;
					
					case 'error_auth':
						// login failed
						$('#link-form-error').html(error_message('Failed to Login to ' + data.registrar_name +
						  ' - Please check your login and password and try again...')).show();
						$('#modal-dialog a.close-button').show();
						stop_modal_spin();	
						break;
					default:
					  switch (response.data.status) {
					    case 'start_sync':
					      start_modal_spin('Logging into your account at ' + data.registrar_name + '...');
					      break;
              case 'syncing':
                start_modal_spin('Reading your domain list at ' + data.registrar_name + '...');
                break;
              default:
                // update title after 20 secs left
    						if (ttl >= 25000 && ttl <= 30000) {
    						  start_modal_spin('We\'re experiencing a delay linking at ' + data.registrar_name + '...');
                }
            }
            
						// check if time out
						if (ttl <= 0) {
							$('#link-form-error').html(error_message('Failed to link to ' + data.registrar_name +
							  ' Process timed out.  Please try again later...')).show();
							$('#modal-dialog a.close-button').show();
							stop_modal_spin();
							break;
						}
						
						// delay and poll again again
						var time = 1500;
						setTimeout(curry(Registrar.poll_link, ttl - time, data), time);
						break;
				}
			} else {
				$('#link-form-error').html(error_message(response)).show();
				$('#modal-dialog a.close-button').show();
				stop_modal_spin();
			}
		});
	});
}