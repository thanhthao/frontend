with (Hasher.Controller('Account','Application')) {
  route({
    '#account': 'account',
    '#account/settings': 'settings',
    '#account/profiles': 'profiles',
    '#account/billing': 'billing'
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
      'Welcome!'
    );
  });

  create_view('profiles', function() {
    return div(
      h1('Profiles'),
      'Welcome!'
    );
  });

  create_view('billing', function() {
    return div(
      h1('Billing'),
      'Welcome!'
    );
  });
})(); }
