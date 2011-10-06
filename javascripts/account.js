with (Hasher.Controller('Account','Application')) {
  route({
    '#account': 'account',
    '#account/settings': 'settings',
    '#account/profiles': 'profiles',
    '#account/billing': 'billing'
  });
  
  create_action('profiles', function() {
    Badger.getContacts(function(results) {
      render('profiles', results.data);
    });
  });
  
  create_action('create_or_update_whois', function(contact_id, form_data) {
    var callback = function(response) {
      if (response.meta.status == 'ok') {
        call_action('Modal.hide');
        call_action('profiles');
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    }

    if (contact_id) {
      Badger.updateContact(contact_id, form_data, callback);
    } else {
      Badger.createContact(form_data, callback);
    }
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

  create_view('profiles', function(contacts) {
    return div(
      h1('Whois Profiles'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Account.edit_whois_modal') }, 'Create New Profile')
      ),

      table({ 'class': 'fancy-table' },
        tbody(
          (contacts || []).map(function(contact) {
            return tr(
              td(
                div(contact.first_name, ' ', contact.last_name),
                div(contact.organization)
              ),
              td(
                div(contact.email),
                div(contact.phone),
                div(contact.fax)
              ),
              td(
                div(contact.address),
                div(contact.address2),
                div(contact.city, ', ', contact.state, ', ', contact.zip),
                div(contact.country)
              ),
              td({ style: "text-align: right" },
                a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Account.edit_whois_modal', contact) }, 'Edit')
              )
            );
          })
        )
      )
    );
  });

  create_helper('edit_whois_modal', function(data) {
    data = data || {};
    return form({ action: action('create_or_update_whois', data.id) },
      h1(data.id ? 'Edit Whois' : 'Create Whois'),
      div({ id: 'errors' }),
      div(
        input({ name: 'first_name', placeholder: 'First Name', value: data.first_name || '' }),
        input({ name: 'last_name', placeholder: 'Last Name', value: data.last_name || '' }),
        input({ name: 'organization', placeholder: 'Organization (optional)', value: data.organization || '' })
      ),
      br(),
      div(
        input({ name: 'email', placeholder: 'Email', value: data.email || '' }),
        input({ name: 'phone', placeholder: 'Phone', value: data.phone || '' }),
        input({ name: 'fax', placeholder: 'Fax (optional)', value: data.fax || '' })
      ),
      br(),
      div(
        input({ name: 'address', placeholder: 'Address Line 1', value: data.address || '' }),
        input({ name: 'address2', placeholder: 'Address Line 2', value: data.address2 || '' })
      ),
      div(
        input({ name: 'city', placeholder: 'City', value: data.city || '' }),
        input({ name: 'state', placeholder: 'State', value: data.state || '' }),
        input({ name: 'zip', placeholder: 'Zip', value: data.zip || '' })
      ),
      div(
        input({ name: 'country', placeholder: 'Country', value: data.country || '' })
      ),
      div({ style: 'text-align: right; margin-top: 10px' }, button({ 'class': 'myButton' }, data.id ? 'Save' : 'Create'))
    );
  });

  create_view('billing', function() {
    return div(
      h1('Billing'),
      'Welcome!'
    );
  });
})(); }

console.log("GOTCHA TEST")