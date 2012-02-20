with (Hasher('Whois','Application')) {

  route('#account/profiles', function() {
    var target_div = div('Loading...');
    
    render(
      h1('Profiles'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton small', href: curry(Whois.edit_whois_modal, null, curry(set_route, '#account/profiles')) }, 'Create New Profile')
      ),
      target_div
    );

    BadgerCache.getContacts(function(results) {
      render({ target: target_div }, 
        ((results.data||[]).length == 0) ? 'No whois profiles found.' : table({ 'class': 'fancy-table' },
          tbody(
            results.data.map(function(contact) {
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
                  a({ 'class': 'myButton small', href: curry(Whois.edit_whois_modal, contact, curry(set_route, '#account/profiles')) }, 'Edit')
                )
              );
            })
          )
        )
      );
      
    });
  });
  
  define('create_or_update_whois', function(contact_id, callback, form_data) {
    start_modal_spin();

    $('#errors').empty();
    
    var tmp_callback = function(response) {
      if (response.meta.status == 'ok') {
        BadgerCache.flush('contacts');
        BadgerCache.getContacts(function() {
          hide_modal();
          if (callback) callback();
        });
      } else {
        $('#errors').empty().append(error_message(response));
        stop_modal_spin();
      }
    }

    if (contact_id) {
      Badger.updateContact(contact_id, form_data, tmp_callback);
    } else {
      Badger.createContact(form_data, tmp_callback);
    }
  });
  
  define('whois_contact', function(whois) {
    return div(
      div(whois.first_name, ' ', whois.last_name),
      (whois.organization && div(whois.organization)),
      (whois.address && div(whois.address)),
      (whois.address2 && div(whois.address2)),
      div(whois.city, ', ', whois.state, ', ', whois.zip, ', ', whois.country),
      div('Email: ', whois.email),
      div('Phone: ', whois.phone),
      (whois.phone && div('Fax: ', whois.phone))
    );
  });
  
  define('edit_whois_modal', function(data, callback, custom_message) {
    data = data || {};
    show_modal(
      form({ action: curry(create_or_update_whois, data.id, callback) },
        h1(data.id ? 'Edit Profile' : 'Create Profile'),
        div({ style: 'color: green;' }, custom_message),
        div({ id: 'errors' }),

        p("This information will ", strong('automatically be private'), " unless you install ", i('Public Whois'), " on a domain."),
      
        table({ style: 'width: 100%' }, tbody(
          tr(
            td({ style: 'width: 50%; vertical-align: top' },
              h3({ style: 'margin: 0' }, 'Contact Information'),
              div(
                input({ style: 'width: 120px', name: 'first_name', placeholder: 'First Name', value: data.first_name || '' }),
                input({ style: 'width: 120px', name: 'last_name', placeholder: 'Last Name', value: data.last_name || '' })
              ),
              div(input({ style: 'width: 250px', name: 'organization', placeholder: 'Organization (optional)', value: data.organization || '' })),
              div(input({ style: 'width: 250px', name: 'email', placeholder: 'Email', value: data.email || '' })),
              div(
                input({ style: 'width: 120px', name: 'phone', placeholder: 'Phone', value: data.phone || '' }),
                input({ style: 'width: 120px', name: 'fax', placeholder: 'Fax (optional)', value: data.fax || '' })
              )
            ),
            td({ style: 'width: 50%; vertical-align: top' },
              h3({ style: 'margin: 0' }, 'Mailing Address'),
              div(
                input({ style: 'width: 250px', name: 'address', placeholder: 'Address Line 1', value: data.address || '' })
              ),
              div(
                input({ style: 'width: 250px', name: 'address2', placeholder: 'Address Line 2 (Optional)', value: data.address2 || '' })
              ),
              div(
                input({ style: 'width: 118px', name: 'city', placeholder: 'City', value: data.city || '' }),
                input({ style: 'width: 40px', name: 'state', placeholder: 'State', value: data.state || '' }),
                input({ style: 'width: 70px', name: 'zip', placeholder: 'Zip', value: data.zip || '' })
              ),
              div(
                select({ style: 'width: 150px', name: 'country' }, option({ disabled: 'disabled' }, 'Country:'), country_options(data.country))
              )
            )
          )
        )),

        div({ style: 'text-align: center; margin-top: 10px' }, input({ 'class': 'myButton', type: 'submit', value: data.id ? 'Save Profile' : 'Create Profile' }))
      )
    );
  });
}
