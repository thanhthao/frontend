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
    Badger.requestInvite($('#email-address').val(), function() {
      render('request_invite_thanks');
    });
    render('request_invite_processing');
  });
  
  create_action('process_login', function(form) {
    Badger.login(form.email, form.password, function(response) {
      if (response.meta.status == 'ok') {
        redirect_to('#');
      } else {
        alert('Error logging in, please try again.');
        console.log(response.data.errors);
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
        alert('errors');
        console.log(response.data.errors);
      }
    });
  });
  
  layout('signup');
}

with (Hasher.View('Signup', 'Application')) { (function() {

  create_view('request_invite', function() {
    return div({ id: 'signup-box' }, 
      h1('Badger.com... a domain registrar that doesn\'t suck.'),
      h2("Thanks for visiting!  We're not quite ready yet but if you'd like an invite when we are, please enter your email address:"),

      form({ style: 'text-align: center', action: action('submit_invite_request') }, 
        input({ type: 'text', id: 'email-address', placeholder: 'Your Email Address' }),
        input({ type: 'submit', value: 'Request Invite', 'class': "myButton" })
      )
    );
  });

  create_view('login', function() {
    return div({ id: 'signup-box' }, 
      h1('Login'),
      form({ action: action('process_login') },
        input({ name: 'email', placeholder: 'Email Address' }),

        input({ name: 'password', type: 'password', placeholder: 'Password' }),
        
        input({ 'class': 'myButton', type: 'submit', value: 'Login' })
      ),
      div({ style: 'margin-top: 20px' },
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

        div({ style: 'margin-top: 20px' }, input({ 'class': 'myButton', type: 'submit', value: 'Create Account' }))
      )
    );
  });
  
})(); }
