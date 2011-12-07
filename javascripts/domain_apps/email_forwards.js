with (Hasher('EmailForwards', 'Application')) {

  register_domain_app({
    id: 'badger_email_forward',
    name: 'Email Forwarding',
    menu_item: { text: 'EMAIL FORWARDING', href: '#domains/:domain/email_forwards' },
    requires: {
      dns: [
        { type: 'mx', priority: 1, content: "smtp.badger.com" },
        { type: 'txt', content: 'v=spf1 mx mx:rhinonamesmail.com ~all' }
      ]
    }
  });
  
  route('#domains/:domain/email_forwards', function(domain) {
    render(
      div({ id: 'email-forwards-wrapper' },
        h1(domain, ' EMAIL FORWARDS'),
        
        domain_app_settings_button('badger_email_forward', domain),
      
        div({ id: 'email-forwards-errors' }),
  
        form({ action: curry(create_email_forward, domain) },
          table({ 'class': 'fancy-table', id: 'email-forwards-table' },
            tbody({ id: 'email-forwards-table-tbody' },
              tr({ 'class': 'table-header'},
                th('Source'),
                th('Destination'),
                th('Actions')
              ),
              tr(
                td(div(input({ id: 'input-username', name: 'username', placeholder: 'username' }), '@', domain)),
                td(input({ id: 'input-destination', name: 'destination', placeholder: 'test@example.com' })),
                td(button({ 'class': 'myButton myButton-small' }, 'Add'))
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
    return tr({ id: email_forward.username },
      td(email_forward.username, "@", domain),
      td(email_forward.destination),
      td(
        a({ 'class': 'myButton myButton-small', href: curry(delete_email_forward, domain, email_forward) }, 'Delete')
      )
    );
  })
  
  
  define('create_email_forward', function(domain, form_data) {
    $('#email-forwards-errors').empty();
    
    Badger.createEmailForward(domain, form_data, function(response) {
      if(response.meta.status == 'ok') {
        call_action('Modal.hide');
        $('#input-username').val('').blur();
        $('#input-destination').val('').blur();
        
        $('#email-forwards-table').append( show_email_forward_table_row(domain, response.data) );
      } else {
        $('#email-forwards-errors').empty().append(
          helper('Application.error_message', response)
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
            helper('Application.error_message', response)
          )
        } else {
          $('#email-forwards-table tr#' + email_forward.username).remove(); //remove the row
        }
      });
    }
  });
  
    
  layout('dashboard');
};
