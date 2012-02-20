with (Hasher('Signup','Application')) {
 
  route('#register/:code', function(code) {
    if (Badger.getAccessToken()) {
      set_route('#');
    } else {
      Badger.register_code = code;
      set_route('#');
      show_register_modal();
    }
  });

  route('#reset_password/:email/:code', function(email, code) {
    set_route('#');
    show_reset_password_modal(email, code);
  });

  route('#confirm_email/:code', function(code) {
    set_route('#');
    if (Badger.getAccessToken()) {
      Badger.confirmEmail(code, function(response) {
        show_confirm_email_notification_modal(response.data, response.meta.status);
      });
    } else {
      show_login_modal(function(){
        Badger.confirmEmail(code, function(response) {
        show_confirm_email_notification_modal(response.data, response.meta.status);
      });
    });
    }
  });

  define('require_user_modal', function(callback) {
    var args = Array.prototype.slice.call(arguments, 1);
    var that = this;
    var callback_with_args = function() { callback.apply(that, args); }
    Badger.getAccessToken() ? callback_with_args() : show_register_modal(callback_with_args);
  });

  define('show_login_modal', function(callback) {
    show_modal(
      div({ id: 'signup-box' },
        h1('Login'),
        div({ id: 'signup-errors' }),
        form({ action: curry(process_login, callback) },
          input({ name: 'email', placeholder: 'Email Address' }),

          input({ name: 'password', type: 'password', placeholder: 'Password' }),

          input({ 'class': 'myButton', type: 'submit', value: 'Login' })
        ),
        div({ style: 'margin-top: 20px' },
  				a({ href: curry(show_forgot_password_modal, callback) }, "Forgot your password?"), br(),
          a({ href: curry(show_register_modal, callback) }, "Don't have an account?")
        )
      )
    );
  });

  define('process_login', function(callback, form) {
    $('#signup-errors').empty();
    Badger.login(form.email, form.password, spin_modal_until(function(response) {
      if (response.meta.status == 'ok') {
        if (callback) {
          callback();
        } else if (Badger.back_url != "") {
          set_route(Badger.back_url);
          Badger.back_url = "";
        }
      } else {
        $('#signup-errors').empty().append(error_message(response));
      }
    }));
  });

  define('show_register_modal', function(callback) {
    show_modal(
      div({ id: 'signup-box' },
        h1('Create Your Badger.com Account'),
        div({ id: 'signup-errors' }),
        form({ action: curry(create_person, callback) },
          input({ type: 'hidden', name: 'invite_code' }),

          table({ style: 'width: 100%' }, tbody(
            tr(
              td({ style: 'width: 50%; vertical-align: top' },
                h3({ style: 'margin: 0' }, 'Contact Information'),
                div(
                  input({ style: 'width: 130px', name: 'first_name', placeholder: 'First Name' }),
                  input({ style: 'width: 130px', name: 'last_name', placeholder: 'Last Name' })
                ),
                div(input({ style: 'width: 275px', name: 'organization', placeholder: 'Organization (optional)' })),
                div(input({ name: 'email', style: 'width: 275px', placeholder: 'Email Address' })),
                div(
                  input({ style: 'width: 130px', name: 'phone', placeholder: 'Phone' }),
                  input({ style: 'width: 130px', name: 'fax', placeholder: 'Fax (optional)' })
                )
              ),
              td({ style: 'width: 50%; vertical-align: top' },
                h3({ style: 'margin: 0' }, 'Mailing Address'),
                div(
                  input({ style: 'width: 260px', name: 'address', placeholder: 'Address Line 1' })
                ),
                div(
                  input({ style: 'width: 260px', name: 'address2', placeholder: 'Address Line 2 (Optional)' })
                ),
                div(
                  input({ style: 'width: 118px', name: 'city', placeholder: 'City' }),
                  input({ style: 'width: 40px', name: 'state', placeholder: 'State' }),
                  input({ style: 'width: 70px', name: 'zip', placeholder: 'Zip' })
                ),
                div(
                  select({ style: 'width: 150px', name: 'country' }, option({ disabled: 'disabled' }, 'Country:'), country_options())
                )
              )
            )
          )),

          h3({ style: 'margin: 15px 0 0 0' }, 'Password for Badger.com'),
  				div(
  					input({ name: 'password', style: 'width: 200px', placeholder: 'Desired Password', type: 'password' }),
  					input({ name: 'confirm_password', style: 'width: 200px', placeholder: 'Confirm Password', type: 'password' })
  				),


          div({ style: 'margin: 10px 0' },
            input({ type: 'checkbox', name: 'agree_to_terms', id: 'agree_to_terms', value: true }),
            label({ 'for': 'agree_to_terms' }, ' I agree to the Badger.com '),
            a({ href: window.location.href.split('#')[0] + '#terms_of_service', target: '_blank' }, 'Terms of Service')
          ),

          div(
            input({ 'class': 'myButton', type: 'submit', value: 'Create Account' })
          ),
          
          div({ style: 'margin-top: 20px' }, 
            a({ href: curry(show_login_modal, callback) }, "Already have an account?")
          )
        )        
      )
    );
  });

  define('create_person', function(callback, data) {
		if(data.password != data.confirm_password) {
			$('#signup-errors').empty().append(error_message({ data: { message: "Passwords do not match" } }));
      return;
		}
    // if (!data.agree_to_terms) {
    //   $('#signup-errors').empty().append(error_message({ data: { message: "You must accept terms of service to use our site" } }));
    //   return;
    // }
    
    if (Badger.register_code) data.invite_code = Badger.register_code;

    Badger.createAccount(data, spin_modal_until(function(response) {
      if (response.meta.status == 'ok') {
        if (callback) {
          callback();
        } else {
          set_route('#');
          setTimeout(SiteTour.site_tour_0, 250);
        }
      } else {
        $('#signup-errors').empty().append(error_message(response));
      }
    }));
  });

	define('show_reset_password_modal', function(email, code) {
    show_modal(
			form({ action: curry(reset_password, null) },
				h1("Enter your new password"),
				div({ id: 'reset-password-messages' }),
				div({ id: 'reset-password-form' },
					div({ style: 'margin: 20px 0; text-align: center' },
					  input({ name: "email", type: 'hidden', value: email }),
						input({ name: "code", type: 'hidden', value: code  }),
						input({ name: "new_password", type: 'password', placeholder: "New Password" }),
						input({ name: "confirm_password", type: 'password', placeholder: "Confirm New Password" }),
						input({ 'class': 'myButton small', type: 'submit', value: 'Update' })
					)
				)
			)
		);
	});

	define('show_forgot_password_modal', function(callback) {
    show_modal(
			form({ action: curry(send_password_reset_email, callback) },
				h1("Forgot Password"),
				div({ id: 'forgot-password-messages' }),
				div({ id: 'forgot-password-form', style: 'margin: 20px 0; text-align: center' },
					input({ name: "email", type: "text", 'class': 'fancy', size: 30, placeholder: "Email" }),
					input({ 'class': 'myButton', type: 'submit', value: 'Send Reset Code' })
				),
        div({ style: 'margin-top: 20px' },
  				a({ href: curry(show_login_modal, callback) }, "Remember your password?"), br(),
          a({ href: curry(show_register_modal, callback) }, "Don't have an account?")
        )
			)
		);
	});

	define('send_password_reset_email', function(callback, form_data) {
		Badger.sendPasswordResetEmail(form_data, function(response) {
			if (response.meta.status == 'ok') {
        $('#forgot-password-messages').empty().append(success_message(response));
				$('#forgot-password-form').empty();
			} else {
				$('#forgot-password-messages').empty().append(error_message(response));
			}
		});
	});

	define('reset_password', function(callback, form_data) {
		if(form_data.new_password != form_data.confirm_password)
			return $('#reset-password-messages').empty().append( error_message({ data: { message: "Passwords do not match" } }) );

		Badger.resetPasswordWithCode(form_data, function(response) {
			if (response.meta.status == 'ok')
			{
        setTimeout(function() {
          show_modal(
            h1("Reset Password"),
            success_message(response),
            a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
          );
        }, 250);
			}
			else
			{
				$('#reset-password-messages').empty().append(error_message(response));
			}
		});
	});

  define('show_confirm_email_notification_modal', function(data, status) {
    show_modal(
      h1("Confirm Email Message"),
      status == 'ok' ? p(data.message + ". You can close this window now.") : p({ 'class':  'error-message'}, data.message),
      a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
    );
	});

}
