with (Hasher('WebForwards', 'DomainApps')) {

  register_domain_app({
    id: 'badger_web_forward',
    name: 'Webpage Forwarding',
    menu_item: { text: 'WEB FORWARDING', href: '#domains/:domain/web_forwards' },
    requires: {
      dns: [
        { type: 'cname', content: "forward.badger.com" },
        { type: 'cname', subdomain: '*', content: "forward.badger.com" }
      ]
    }
  });
  
  route('#domains/:domain/web_forwards', function(domain) {
    render(
      div({ id: 'web-forwards-wrapper' },
        h1('WEB FORWARDING FOR ' + domain),
        domain_app_settings_button('badger_web_forward', domain),

        div({ id: 'web-forwards-errors' }),
      
        form({ action: curry(create_web_forward, domain) },
          table({ 'class': 'fancy-table', id: 'web-forwards-table' },
            tbody({ id: 'web-forwards-table-tbody' },
              tr({ 'class': 'table-header'},
                th('Source'),
                th('Destination'),
                th('Actions')
              ),

              tr(
                td(
                  div(
                    domain, "/", input({ id: 'input-path', name: 'path', placeholder: 'path' })
                  )
                ),
                td(
                  input({ id: 'input-destination', name: 'destination', placeholder: 'example.com' })
                ),
                td(
                  button({ 'class': 'myButton myButton-small' }, 'Add')
                )
              )
            )
          )
        )
      )
    );

    var the_tbody = $('#web-forwards-table-tbody');
    Badger.getWebForwards(domain, function(results) {
      for_each(results.data, function(row) {
        the_tbody.append(show_web_forward_table_row(domain, row));
      });
    })
  });
  
  
  define('create_web_forward', function(domain, form_data) {
    $('#web-forwards-errors').empty();
    
    Badger.createWebForward(domain, form_data, function(response) {
      if(response.meta.status == 'ok') {
        call_action('Modal.hide');
        $('#input-path').val('').blur();
        $('#input-destination').val('').blur();
        
        $('#web-forwards-table').append( show_web_forward_table_row(domain, response.data) );
      } else {
        $('#web-forwards-errors').empty().append(
          helper('Application.error_message', response)
        );
      }
      
    });
  });
  
  define('delete_web_forward', function(domain, web_forward) {
    $('#email-forwards-errors').empty();
    
    if( confirm('Delete web forward ' + domain + '/' + web_forward.path + '?') ) {
      Badger.deleteWebForward(domain, web_forward.id, function(response) {
        if(response.meta.status != 'ok') {
          $('#web-forwards-errors').empty().append(
            helper('Application.error_message', response)
          )
        } else {
          $('#web-forwards-table tr#' + web_forward.path).remove(); //remove the row
        }
      });
    }
  });
    
  define('show_web_forward_table_row', function(domain, web_forward) {
    return tr({ id: web_forward.path },
      td(domain, "/", web_forward.path),
      td(web_forward.destination),
      td(
        a({ 'class': 'myButton myButton-small', href: action('WebForwards.delete_web_forward', domain, web_forward) }, 'Delete')
      )
    );
  });

  layout('dashboard');
  
};