with (Hasher('Account','Application')) {
  route({
    '#account': 'account',
    '#account/settings': 'settings'
  });

	define('change_password', function(data) {
		if(data.new_password != data.confirm_password)
			return $('#change-password-messages').empty().append( Application.error_message({ data: { message: "Passwords do not match" } }) );
		
		Badger.changePassword(data, function(response) {
			if (response.meta.status == 'ok') {
				Badger.logout();
				$('#change-password-messages').empty().append( Application.success_message(response) );
				$('#change-password-form').empty();
			} else {
				$('#change-password-messages').empty().append( Application.error_message(response) );	
			}
		});
	});
  
  layout('dashboard');
}

with (Hasher('Account', 'Application')) { (function() {

  define('account', function() {
    return div(
      h1('My Account'),
      "There's not much to do here yet... maybe give these links a try:",
      ul(
        li(a({ href: '#account/profiles'}, 'Whois Profiles')),
        li(a({ href: '#account/billing'}, 'Credits & Billing'))
      )
    );
  });

  define('settings', function() {
		return div(
			h1("ACCOUNT SETTINGS"),
			ul(
				li( a({ href: curry(show_modal, 'Account.change_password_modal') }, "Change Password") )
			)
		);
  });

  define('billing', function() {
    return div(
      h1('Billing'),
      'Welcome!'
    );
  });

	define('change_password_modal', function(data) {
		data = data || {};
		return form({ action: change_password },
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
