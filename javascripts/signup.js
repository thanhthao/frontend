with (Hasher.Controller('Signup','Application')) {
  route({
    '#request_invite': 'request_invite',
    '#register/:code': 'register',
    '#login': 'login'
  });
  
  //skip_before_filter('redirect_to_root_unless_logged_in');
  
  create_action('request_invite', function() {
    render('request_invite');
    $('#email-address').focus();
  });
  
  create_action('submit_invite_request', function() {
    Badger.requestInvite($('#email-address').val(), function(response) {
      console.log(response)
      if (response.meta.status == 'ok') {
        render('request_invite_thanks');
      } else {
        render('request_invite');
        $('#signup-errors').empty().append(helper('Application.error_message', response));
      }
    });
    render('request_invite_processing');
  });
  
  create_action('process_login', function(form) {
    $('#signup-errors').empty();
    Badger.login(form.email, form.password, function(response) {
      if (response.meta.status == 'ok') {
        redirect_to('#');
      } else {
        $('#signup-errors').empty().append(helper('Application.error_message', response));
      }
    });
  });

  create_action('register', function(code) {
    render('register', code);
  });
  
  create_action('create_person', function(data) {
    Badger.createAccount(data, function(response) {
      if (response.meta.status == 'ok') {
        redirect_to('#');
      } else {
        $('#signup-errors').empty().append(helper('Application.error_message', response));
      }
    });
  });

	create_action('send_password_reset_email', function(callback, form_data) {
		$('#forgot-password-messages').empty();
		
		Badger.sendPasswordResetEmail(form_data, function(response) {
			if (response.meta.status == 'ok')
			{
				$('#forgot-password-messages').empty().append(helper('Application.success_message', response));
				
				$('#reset-password-placeholder').append(helper('reset_password_helper', form_data));
			}
			else
				$('#forgot-password-messages').empty().append(helper('Application.error_message', response));
		});
	});
	
	create_action('reset_password', function(callback, form_data) {
		$('#reset-password-messages').empty();
		
		if(form_data.new_password != form_data.confirm_password)
			return $('#reset-password-messages').append( helper('Application.error_message', { data: { message: "Passwords do not match" } }) );
		
		Badger.resetPasswordWithCode(form_data, function(response) {
			if (response.meta.status == 'ok')
				$('#reset-password-messages').empty().append(helper('Application.success_message', response));
			else
				$('#reset-password-messages').empty().append(helper('Application.error_message', response));
		});
	});
  
  layout('signup');
}

with (Hasher.View('Signup', 'Application')) { (function() {

  create_view('request_invite', function() {
    return div({ id: 'signup-box' }, 
      h1('Badger.com... a domain registrar that doesn\'t suck.'),
      h2("Thanks for visiting!  We're not quite ready yet but if you'd like an invite when we are, please enter your email address:"),

      div({ id: 'signup-errors' }),

      form({ style: 'text-align: center', action: action('submit_invite_request') }, 
        input({ type: 'text', id: 'email-address', placeholder: 'Your Email Address' }),
        input({ type: 'submit', value: 'Request Invite', 'class': "myButton" })
      )
    );
  });

  create_view('login', function() {
    return div({ id: 'signup-box' },
      h1('Login'),
      div({ id: 'signup-errors' }),
      form({ action: action('process_login') },
        input({ name: 'email', placeholder: 'Email Address' }),

        input({ name: 'password', type: 'password', placeholder: 'Password' }),
        
        input({ 'class': 'myButton', type: 'submit', value: 'Login' })
      ),
      div({ style: 'margin-top: 20px' },
				a({ href: action('Modal.show', 'Signup.forgot_password_modal') }, "Forgot your password?"), br(),
        a({ href: '#request_invite' }, "Don't have an account?")
      )
    );
  });

  create_view('request_invite_processing', function() {
    return div({ id: 'signup-box' }, 
      h3('Processing... please wait.')
    );
  });

  create_view('request_invite_thanks', function() {
    return div({ id: 'signup-box' }, 
      h3('Thanks!  We\'ll get back to you shortly!')
    );
  });

  create_view('register', function(code) {
    return div({ id: 'signup-box' }, 
      h1('Create Your Badger.com Account'),
      div({ id: 'signup-errors' }),
      form({ action: action('create_person') },
        input({ type: 'hidden', name: 'invite_code', value: code }),

        div(
          input({ name: 'first_name', placeholder: 'First Name' }),
          input({ name: 'last_name', placeholder: 'Last Name' })
        ),

        div(
          input({ name: 'email', placeholder: 'Email Address' }),
          input({ name: 'password', placeholder: 'Desired Password', type: 'password' })
        ),

        div({ style: 'margin-top: 20px' }, input({ 'class': 'myButton', type: 'submit' }, "Submit"))
      )
    );
  });

	create_helper('reset_password_helper', function(data) {
		return div(
			br(), hr(),

			form({ action: action('reset_password', data) },
				h2("Reset Password"),
				div({ id: 'reset-password-messages' }),
				div(
					input({ name: "email", size: 30, type: 'text', readonly: "readonly", style: "color: #8F8E8E", value: data.email || '' })
				),
				div(
					input({ name: "new_password", type: 'password', placeholder: "New Password", value: data.new_password || '' }),
					input({ name: "confirm_password", type: 'password', placeholder: "Confirm New Password", value: data.confirm_password || '' })
				),
				div(
					input({ name: "code", placeholder: "Reset Code", value: data.code || '' }),
					button({ 'class': 'myButton myButton-small', type: 'submit' }, "Submit")
				)
			)
		);
	});

	create_helper('forgot_password_modal', function(data) {
		data = data || {};
		return div(
			form({ action: action('send_password_reset_email', data) }, 
				h2("Forgot Password"),
				div({ id: 'forgot-password-messages' }),
				div(
					input({ name: "email", type: "text", size: 30, placeholder: "Email", value: data.email || '' }),
					button({ 'class': 'myButton myButton-small', type: 'submit' }, "Send Email")
				)
			),
			div({ id: "reset-password-placeholder" })			
		);
	});
  
})(); }
