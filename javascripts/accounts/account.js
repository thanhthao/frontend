with (Hasher.Controller('Account','Application')) {
  route({
    '#account': 'account',
    '#account/settings': 'settings'
  });

	create_action('change_password', function(data) {
		if(data.new_password != data.confirm_password)
			return $('#change-password-messages').empty().append( helper('Application.error_message', { data: { message: "Passwords do not match" } }) );
		
		Badger.changePassword(data, function(response) {
			if (response.meta.status == 'ok') {
				Badger.logout();
				$('#change-password-messages').empty().append( helper('Application.success_message', response) );
				$('#change-password-form').empty();
			} else {
				$('#change-password-messages').empty().append( helper('Application.error_message', response) );	
			}
		});
	});
  
  layout('dashboard');
}

with (Hasher.View('Account', 'Application')) { (function() {

  create_view('account', function() {
    return div(
      h1('My Account'),
      "There's not much to do here yet... maybe give these links a try:",
      ul(
        li(a({ href: '#account/profiles'}, 'Whois Profiles')),
        li(a({ href: '#account/billing'}, 'Credits & Billing'))
      )
    );
  });

  create_view('settings', function() {
		return div(
			h1("ACCOUNT SETTINGS"),
			ul(
				li( a({ href: action('Modal.show', 'Account.change_password_modal') }, "Change Password") )
			)
		);
  });

  create_view('billing', function() {
    return div(
      h1('Billing'),
      'Welcome!'
    );
  });

	create_helper('change_password_modal', function(data) {
		data = data || {};
		return form({ action: action('change_password') },
			h1("CHANGE PASSWORD"),
			div({ id: 'change-password-messages' }),
			div({ id: 'change-password-form', style: 'text-align: center; margin: 20px 0' },
				input({ name: 'new_password', type: 'password', 'class': 'fancy', placeholder: 'New Password', value: data.new_password || '' }),
				input({ name: 'confirm_password', type: 'password', 'class': 'fancy', placeholder: 'Confirm Password', value: data.confirm_password || '' }),
				input({ 'class': 'myButton', type: 'submit', value: 'Update' })
			)
		);
	});

})(); }
