with (Hasher.Controller('Account','Application')) {
  route({
    '#account': 'account',
    '#account/settings': 'settings'
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
      h1('Settings'),
      'Coming soon:',
      ul(
        li('change password'),
        li('email preferences')
      )
    );
  });

  create_view('billing', function() {
    return div(
      h1('Billing'),
      'Welcome!'
    );
  });
})(); }
