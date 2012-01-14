with (Hasher('WebForwards', 'DomainApps')) {

  register_domain_app({
    id: 'badger_web_forward',
    name: 'URL Forwarding',
    menu_item: { text: 'URL FORWARDING', href: '#domains/:domain/web_forwards' },
    requires: {
      dns: [
        { type: 'a', content: "50.57.26.208" },
        { type: 'a', subdomain: '*', content: "50.57.26.208" }
      ]
    }
  });
  
  route('#domains/:domain/web_forwards', function(domain) {
    render(
      div({ id: 'web-forwards-wrapper' },
        h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'URL FORWARDING FOR ' + domain)),
        domain_app_settings_button('badger_web_forward', domain),

        div({ id: 'web-forwards-errors' }),
      
        form({ action: curry(create_web_forward, domain) },
          table({ 'class': 'fancy-table', id: 'web-forwards-table' },
            tbody({ id: 'web-forwards-table-tbody' },
              tr({ 'class': 'table-header'},
                th('Source'),
                th(''),
                th('Destination'),
                th('')
              ),

              tr(
                td(
                  div(
                    Domains.truncate_domain_name(domain), "/ ", input({ id: 'input-path', name: 'path', placeholder: 'path' })
                  )
                ),
                td({ style: 'text-align: center' }, img({ src: 'images/icon-arrow-right.png' })),
                td(
                  input({ id: 'input-destination', name: 'destination', placeholder: 'example.com' })
                ),
                td({ style: 'text-align: center' }, 
                  input({ 'class': 'myButton myButton-small', type: 'submit', value: 'Add' })
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
        hide_modal();
        $('#input-path').val('').blur();
        $('#input-destination').val('').blur();
        
        $('#web-forwards-table').append( show_web_forward_table_row(domain, response.data) );
      } else {
        $('#web-forwards-errors').empty().append(
          Application.error_message(response)
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
            Application.error_message(response)
          )
        } else {
          $('#web_forward_tr_' + web_forward.id).remove(); //remove the row
        }
      });
    }
  });
    
  define('show_web_forward_table_row', function(domain, web_forward) {
    return tr({ id: 'web_forward_tr_' + web_forward.id },
      td(Domains.truncate_domain_name(domain), "/", web_forward.path),
      td({ style: 'text-align: center' }, img({ src: 'images/icon-arrow-right.png' })),
      td(web_forward.destination),
      td({ style: 'text-align: center' }, 
        a({ href: curry(delete_web_forward, domain, web_forward) }, img({ src: 'images/icon-no.gif' }))
      )
    );
  });

   
};