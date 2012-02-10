with (Hasher('Account','Application')) {
  route('#account', function() {
    var account_setings = div();

    render(
      div(
        h1('My Account'),
        table({ style: 'width: 100%; border-collapse: collapse' }, tbody(
          tr(
            td({ style: 'width: 50%; vertical-align: top; padding-right: 10px'},
              h2("SHORTCUTS"),
              ul(
                li(a({ href: "#tickets" }, 'Support Tickets')),
                li(a({ href: "#account/profiles" }, 'Whois Profiles')),
                li(a({ href: "#account/billing" }, 'Credits & Billing')),
          			li(a({ href: "#linked_accounts" }, 'Linked Accounts'))
          		)
            ),
            td({ style: 'width: 50%; vertical-align: top; padding-left: 10px'},
              h2("ACCOUNT SETTINGS"),
              account_setings
            )
          )
        ))
      )
    );

    BadgerCache.getAccountInfo(function(response) {
      render({ into: account_setings },
        ul(
          li( a({ href: curry(show_modal, Account.change_password_modal()) }, "Change Password") ),
          li( a({ href: curry(show_modal, Account.change_name_modal(response.data)) }, "Change First/Last Name") ),
          li( a({ href: curry(show_modal, Account.change_email_modal(response.data)) }, "Change Email Address") )
        )
      )
    });


  });
  
	define('change_password', function(data) {
		if(data.new_password != data.confirm_password)
			return $('#change-password-messages').empty().append( error_message({ data: { message: "Passwords do not match" } }) );
		
		Badger.changePassword(data, function(response) {
			if (response.meta.status == 'ok') {
				Badger.logout();
				$('#change-password-messages').empty().append( success_message(response) );
				$('#change-password-form').empty();
			} else {
				$('#change-password-messages').empty().append( error_message(response) );	
			}
		});
	});

	define('change_name', function(form_data) {
		if(form_data.first_name == '' || form_data.last_name == '')
			return $('#change-name-messages').empty().append( error_message({ data: { message: "First name and last name cannot be blank" } }) );

		Badger.changeName(form_data, function(response) {
			if (response.meta.status == 'ok') {
        Application.update_account_name();
        set_route(get_route());
				$('#change-name-messages').empty().append( success_message(response) );
        $('#change-name-form').empty();
			} else {
				$('#change-name-messages').empty().append( error_message(response) );
			}
		});
	});

	define('change_email', function(form_data) {
		if(form_data.email == '')
			return $('#change-email-messages').empty().append( error_message({ data: { message: "Email cannot be blank" } }) );

		Badger.changeEmail(form_data, function(response) {
			if (response.meta.status == 'ok') {
        Badger.logout();
				$('#change-email-messages').empty().append( success_message(response) );
				$('#change-email-form').empty();
			} else {
				$('#change-email-messages').empty().append( error_message(response) );
			}
		});
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

	define('change_name_modal', function(data) {
    data = (data || {});
    var first_name = (data.name || '').split(' ')[0];
    var last_name = (data.name || '').replace(first_name,"");
    return form({ action: change_name },
      h1("CHANGE FIRST/LAST NAME"),
      div({ id: 'change-name-messages' }),
      div({ id: 'change-name-form', style: 'text-align: center; margin: 20px 0' },
        input({ name: 'first_name', 'class': 'fancy', placeholder: 'First Name', value: first_name || '' }),
        input({ name: 'last_name', 'class': 'fancy', placeholder: 'Last Name', value: last_name  || '' }),
        input({ 'class': 'myButton', type: 'submit', value: 'Update' })
      )
    );

	});

	define('change_email_modal', function(data) {
    data = (data || {});
    return form({ action: change_email },
      h1("CHANGE EMAIL ADDRESS"),
      div({ id: 'change-email-messages' }),
      div({ id: 'change-email-form', style: 'text-align: center; margin: 20px 0' },
        input({ name: 'email', 'class': 'fancy', placeholder: 'New Email Address', value: data.email || '' }),
        input({ 'class': 'myButton', type: 'submit', value: 'Update' })
      )
    );
	});

}
