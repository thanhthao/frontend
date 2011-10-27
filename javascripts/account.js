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
      'Welcome!'
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
