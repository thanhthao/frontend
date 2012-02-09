with (Hasher('Registrar','Application')) {

  define('show_link', function(site, linked_account_id) {
		var name, login_text;
		if (!linked_account_id) {
			linked_account_id = '';
		}
		switch (site) {
			case 'godaddy':
				name = 'Go Daddy';
				login_text = 'Customer # or Login';
				break;
				case 'networksolutions':
					name = 'Network Solutions';
					login_text = 'User ID';
					break;
			default:
				alert('Unknown Site');
				return false;
		}
		show_modal(
			div(
				h1('Link your ' + name + ' Account'),
				div({ 'class': 'hidden', id: 'link-form-error' }),
				p("Lorem ipsum dolor sit amet ", strong('consectetur adipisicing elit'), " tempor incididunt ut labore et dolore magna."),
				form({ action: Registrar.start_link },
					input({ type: 'hidden', name: 'registrar_name', id: 'registrar-name', value: name}),
					input({ type: 'hidden', name: 'site', id: 'site', value: site}),
					input({ type: 'hidden', name: 'linked_account_id', id: 'linked-account-id', value: linked_account_id}),
					div(input({ type: 'text', name: 'login', placeholder: login_text })),
          div(input({ type: 'password', name: 'password', placeholder: 'Password' })),
					div(
						input({ type: 'checkbox', name: 'agent_accept', id: 'agent_accept' }),
						label({ for: 'agent_accept' }, 'I allow Badger.com to act as my agent....')
					),
					div({ style: 'text-align: right' }, input({ 'class': 'myButton', id: 'next', type: 'submit', value: 'Link Accounts' })),
					div({ style: 'clear: both' })
				)
			)	
		)
  });

  define('start_link', function(form_data) {
		start_modal_spin();
		$('#modal-dialog a.close-button').hide();
    $('#errors').empty();

		var callback = function (response) {
			if (response.data.linked_account_id) {
				$('#linked-account-id').val(response.data.linked_account_id);
			}
			if (response.meta.status == 'ok') {
      	start_modal_spin('Logging in to ' + $('#registrar-name').val() + '...');
				setTimeout(curry(Registrar.poll_link, 50000), 10000);
      } else {
        $('#link-form-error').html(error_message(response)).show();
				$('#modal-dialog a.close-button').show();
        stop_modal_spin();
      }
		};
		
		if (form_data.linked_account_id) {
			// update existing account
			Badger.updateLinkedAccount(form_data.linked_account_id, form_data, callback);
		}
		else {
			// create account
			Badger.createLinkedAccount(form_data, callback);
		}
	});
		
	define('poll_link', function(ttl) {
		console.log(ttl);
		Badger.getLinkedAccount($('#linked-account-id').val(), function (response) {
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
						$('#link-form-error').html(error_message('Failed to Login to ' + $('#registrar-name').val() + ' - Please check your login and password and try again...')).show();
						$('#modal-dialog a.close-button').show();
						stop_modal_spin();	
						break;
					default:
						// check if time out
						if (ttl <= 0) {
							$('#link-form-error').html(error_message('Failed to link to ' + $('#registrar-name').val() + ' Process timed out.  Please try again later...')).show();
							$('#modal-dialog a.close-button').show();
							stop_modal_spin();
							break;
						}
						// update title
						start_modal_spin('Reading domain list on ' + $('#registrar-name').val() + '...');
						
						// delay and poll again again
						var time = 2000;
						setTimeout(curry(Registrar.poll_link, ttl - time), time);
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