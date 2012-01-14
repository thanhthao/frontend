with (Hasher('EmailForwards', 'DomainApps')) {

  register_domain_app({
    id: 'badger_email_forward',
    name: 'Email Forwarding',
    menu_item: { text: 'EMAIL FORWARDING', href: '#domains/:domain/email_forwards' },
    requires: {
      dns: [
        { type: 'mx', priority: 10, content: "smtp.badger.com" },
        { type: 'txt', content: 'v=spf1 mx mx:rhinonamesmail.com ~all' }
      ]
    }
  });
  
  route('#domains/:domain/email_forwards', function(domain) {
    render(
      div({ id: 'email-forwards-wrapper' },
        h1({ 'class': 'header-with-right-btn long-domain-name' }, domain, ' EMAIL FORWARDS'),
        domain_app_settings_button('badger_email_forward', domain),
      
        div({ id: 'email-forwards-errors' }),
  
        form({ action: curry(create_email_forward, domain) },
          table({ 'class': 'fancy-table', id: 'email-forwards-table' },
            tbody({ id: 'email-forwards-table-tbody' },
              tr({ 'class': 'table-header'},
                th('Source'),
                th(''),
                th('Destination'),
                th('')
              ),
              tr(
                td(input({ id: 'input-username', name: 'username', placeholder: 'username' }), div({ 'class': 'long-domain-name domain-name-label' }, '@', domain)),
                td({ style: 'text-align: center' }, img({ src: 'images/icon-arrow-right.png' })),
                td(input({ id: 'input-destination', name: 'destination', placeholder: 'test@example.com' })),
                td({ style: 'text-align: center' }, input({ 'class': 'myButton myButton-small', type: 'submit', value: 'Add' }))
              )
            )
          )
        )
      )
    );

    Badger.getEmailForwards(domain, function(results) {
      var the_tbody = $('#email-forwards-table-tbody');
      results.data.map(function(email_forward) {
        the_tbody.append(show_email_forward_table_row(domain, email_forward));
      });
    });
  });
  
  define('show_email_forward_table_row', function(domain, email_forward) {
    return tr({ id: 'id-' + (email_forward.username == '*' ? '' : email_forward.username) },
      td(div({ 'class': 'long-domain-name', style: 'width: 380px;' }, email_forward.username, "@", domain)),
      td({ style: 'text-align: center' }, img({ src: 'images/icon-arrow-right.png' })),
      td(email_forward.destination),
      td({ style: 'text-align: center' },
        a({ href: curry(delete_email_forward, domain, email_forward) }, img({ src: 'images/icon-no.gif' }))
      )
    );
  })
  
  
  define('create_email_forward', function(domain, form_data) {
    $('#email-forwards-errors').empty();
    
    Badger.createEmailForward(domain, form_data, function(response) {
      if(response.meta.status == 'ok') {
        hide_modal();
        $('#input-username').val('').blur();
        $('#input-destination').val('').blur();
        
        $('#email-forwards-table').append( show_email_forward_table_row(domain, response.data) );
      } else {
        $('#email-forwards-errors').empty().append(
          Application.error_message(response)
        );
      }
      
    });
  });
  
  define('delete_email_forward', function(domain, email_forward) {
    $('#email-forwards-errors').empty();
    
    if( confirm('Delete email forward ' + email_forward.username + '@' + domain + '?') ) {
      Badger.deleteEmailForward(domain, email_forward.id, function(response) {
        if(response.meta.status != 'ok') {
          $('#email-forwards-errors').empty().append(
            Application.error_message(response)
          )
        } else {
          $('#email-forwards-table tr#id-' + (email_forward.username == '*' ? '' : email_forward.username)).remove(); //remove the row
        }
      });
    }
  });
  
    
 };
