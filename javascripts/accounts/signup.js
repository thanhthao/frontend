with (Hasher('Signup','Application')) {
  layout('dashboard');

  route('#register/:code', function(code) {
    Badger.register_code = code;
    redirect_to('#');
  });
  
  route('#confirm_email/:code', function(code) {
    redirect_to('#');
		Badger.confirmEmail(code, function(response) {
      show_confirm_email_notification_modal(response.data, response.meta.status);
		});
  });

  route('#welcome', function() {
    render(
      div(
        h1({ style: 'margin-top: 0' }, 'Welcome to Badger.com'),
        
        div({ 'class': 'info-message', style: 'font-weight: bold; padding: 10px; text-align: center; font-size: 17px' }, "Dec 29th - Domain Transfer Day Special - $8 domains!"),
        
        table({ style: 'width: 100%' },
          tr(
            td({ style: 'vertical-align: top' }, img({ src: 'images/badger-5.png', style: 'padding: 20px 50px' })),
            td({ style: 'vertical-align: top' }, 
              div({ style: "margin-top: 30px" },
                h3({ style: "margin: 0" }, "What is badger.com?"),
                p({ style: "margin-top: 5px" }, "We are a domain registrar.  You can register and configure domains through us."),
            
                h3({ style: "margin: 0" }, "What is a domain?"),
                p({ style: "margin-top: 5px" }, 'Think of it as the "badger.com" in ', a({ href: '#welcome' }, 'www.badger.com'), ' or ', a({ href: 'mailto:support@badger.com' }, 'support@badger.com'), '.'),

                h3({ style: "margin: 0" }, "Where do I begin?"),
                p({ style: "margin-top: 5px" }, "Start typing in the search box in the top left.  If you're not sure of what to type, start with your name."),

                h3({ style: "margin: 0" }, "What services do you offer for free?"),
                p({ style: "margin-top: 5px" }, 'WHOIS privacy, DNS hosting, email forwarding, website forwarding and more.'),

                h3({ style: "margin: 0" }, "Already have a domain?"),
                //p({ style: "margin-top: 5px" }, "Read about out ", a({ href: '#faqs/how-were-different' }, "how we're different"), ".  Or, you can jump right in and ", a({ href: action('Transfer.show') }, "transfer a domain"), ".")
                p({ style: "margin-top: 5px" }, "You can jump right in and ", a({ href: action('Transfer.show') }, "transfer a domain"), ".")
              )
            )
          )
        )
      )
    );
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
    Badger.login(form.email, form.password, function(response) {
      console.log(response)
      if (response.meta.status == 'ok') {
        if (callback) {
          callback();
        } else if (Badger.back_url != "") {
          redirect_to(Badger.back_url);
          Badger.back_url = "";
        }
      } else {
        $('#signup-errors').empty().append(helper('Application.error_message', response));
      }
    });
  });

  define('show_register_modal', function(callback) {
    show_modal(
      div({ id: 'signup-box' },
        h1('Create Your Badger.com Account'),
        div({ id: 'signup-errors' }),
        form({ action: curry(create_person, callback) },
          input({ type: 'hidden', name: 'invite_code' }),

          div(
            input({ name: 'first_name', placeholder: 'First Name' }),
            input({ name: 'last_name', placeholder: 'Last Name' })
          ),

          div(
            input({ name: 'email', size: 35, placeholder: 'Email Address' })
          ),

  				div(
  					input({ name: 'password', placeholder: 'Desired Password', type: 'password' }),
  					input({ name: 'confirm_password', placeholder: 'Confirm Password', type: 'password' })
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
			$('#signup-errors').empty().append(helper('Application.error_message', { data: { message: "Passwords do not match" } }));
      return;
		}
    // if (!data.agree_to_terms) {
    //   $('#signup-errors').empty().append(helper('Application.error_message', { data: { message: "You must accept terms of service to use our site" } }));
    //   return;
    // }
    
    if (Badger.register_code) data.invite_code = Badger.register_code;
    
    Badger.createAccount(data, function(response) {
      if (response.meta.status == 'ok') {
        if (callback) {
          callback();
        } else {
          redirect_to('#');
          Application.reload_layout();
          setTimeout(function() { call_action('Modal.show', 'SiteTour.site_tour_0'); }, 250);
        }
      } else {
        $('#signup-errors').empty().append(helper('Application.error_message', response));
      }
    });
  });

	define('show_reset_password_modal', function(data) {
    show_modal(
			form({ action: curry(reset_password, data) },
				h1("Reset Password"),
				div({ id: 'reset-password-messages' }),
				div({ id: 'reset-password-form' },
					div({ style: 'margin: 20px 0; text-align: center' },
					  input({ name: "email", type: 'hidden', value: data.email }),
						input({ name: "code", placeholder: "Reset Code", value: data.code || '' }),
						input({ name: "new_password", type: 'password', placeholder: "New Password", value: data.new_password || '' }),
						input({ name: "confirm_password", type: 'password', placeholder: "Confirm New Password", value: data.confirm_password || '' }),
						input({ 'class': 'myButton myButton-small', type: 'submit', value: 'Update' })
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
        show_reset_password_modal(form_data);
			} else {
				$('#forgot-password-messages').empty().append(helper('Application.error_message', response));
			}
		});
	});

	define('reset_password', function(callback, form_data) {
		if(form_data.new_password != form_data.confirm_password)
			return $('#reset-password-messages').empty().append( helper('Application.error_message', { data: { message: "Passwords do not match" } }) );

		Badger.resetPasswordWithCode(form_data, function(response) {
			if (response.meta.status == 'ok')
			{
				$('#reset-password-messages').empty().append(helper('Application.success_message', response));
				$('#reset-password-form').empty();
			}
			else
			{
				$('#reset-password-messages').empty().append(helper('Application.error_message', response));
			}
		});
	});

  define('show_confirm_email_notification_modal', function(data, status) {
    show_modal(
      h1("Confirm Email Message"),
      status == 'ok' ? p(data.message + ". You can close this window now.") : p({ 'class':  'error-message'}, data.message),
      a({ href: action('Modal.hide'), 'class': 'myButton', value: "submit" }, "Close")
    );
	});

}
