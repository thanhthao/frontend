with (Hasher.Controller('Billing','Application')) {
  route({
    '#account/billing': 'index'
  });
  
  create_action('index', function() {
    BadgerCache.getPaymentMethods(function(results) {
      render('index', results.data.message ? [] : results.data);
    });
  });
  
  create_action('create_or_update_billing', function(contact_id, form_data) {
    $('#errors').empty();
    var callback = function(response) {
			console.log(response);

      if (response.meta.status == 'ok') {
        call_action('Modal.hide');
        call_action('index');
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    }

    if (contact_id) {
      Badger.updatePaymentMethod(contact_id, form_data, callback);
    } else {
      Badger.createPaymentMethod(form_data, callback);
    }
  });
  
  layout('dashboard');
}

with (Hasher.View('Billing', 'Application')) { (function() {

  create_view('index', function(contacts) {
    return div(
      h1('Billing Settings'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Billing.edit_billing_modal') }, 'Purchase Credits')
      ),

      table({ 'class': 'fancy-table' },
        tbody(
          (contacts || []).map(function(payment_method) {
            return tr(
              // td(
              //   div(contact.first_name, ' ', contact.last_name)
              // ),
              // td(
              //   div(contact.cc_number),
              //   div(contact.cc_expiration)
              // ),
							td(payment_method.name),
              td({ style: "text-align: right" },
                a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Billing.edit_billing_modal', payment_method) }, 'Edit')
              )
            );
          })
        )
      )
    );
  });

  create_helper('edit_billing_modal', function(data) {
    data = data || {};
    return form({ action: action('create_or_update_billing', data.id) },
      h1('Purchase Credits'),
      //div({ style: 'margin-bottom: 15px' }, 'Use credits to buy new domains, transfer in existing domains, or renew expiring domain.'),
      div({ id: 'errors' }),
      table({ 'class': 'fancy-table' }, tbody(
        tr({ 'class': 'table-header' },
          th({ style: 'width: 25%' }, 'Package'), 
          th({ style: 'width: 25%' }, 'Credits'), 
          th({ style: 'width: 25%' }, 'Price per Credit'), 
          th({ style: 'width: 25%' }, 'Total')
        ),
        tr({ style: 'cursor: pointer', events: { click: function() { $('#variable-credits-radio').click();  }}},
          td(input({ id: 'variable-credits-radio', checked: 'checked', type: 'radio', name: 'credits', value: 1 })), 
          td(
            select({ id: 'variable-credits-quantity', events: { change: function(){ $('#variable-credits').html($('#variable-credits-quantity').val()*15); $('#variable-credits-radio').click(); }}},
              option(1), option(2), option(3), option(4), option(5), option(6), option(7), option(8), option(9)
            )
          ),
          td('$15'), 
          td('$', span({ id: 'variable-credits' }, '15'))
        ),
        tr({ style: 'cursor: pointer', events: { click: function() { $('#credits-10').click();  }}},
          td(input({ id: 'credits-10', type: 'radio', name: 'credits', value: 1 })), 
          td(10), 
          td('$14'), 
          td('$', 10*14)
        ),
        tr({ style: 'cursor: pointer', events: { click: function() { $('#credits-25').click();  }}},
          td(input({ id: 'credits-25', type: 'radio', name: 'credits', value: 1 })), 
          td(25), 
          td('$13'), 
          td('$', 25*13)
        ),
        tr({ style: 'cursor: pointer', events: { click: function() { $('#credits-50').click();  }}},
          td(input({ id: 'credits-50', type: 'radio', name: 'credits', value: 1 })), 
          td(50), 
          td('$12'), 
          td('$', 50*12)
        ),
        tr({ style: 'cursor: pointer', events: { click: function() { $('#credits-100').click();  }}},
          td(input({ id: 'credits-100', type: 'radio', name: 'credits', value: 1 })), 
          td(100), 
          td('$11'), 
          td('$', 100*11)
        ),
        tr({ style: 'cursor: pointer', events: { click: function() { $('#credits-250').click();  }}},
          td(input({ id: 'credits-250', type: 'radio', name: 'credits', value: 1 })), 
          td(250), 
          td('$10'), 
          td('$', 250*10)
        )
      )),
    
      table({ style: 'margin-top: 15px; width: 100%' }, tbody(
        tr(
          th({ style: 'width: 60%; text-align: left; font-weight: bold' }, 'Billing Address'),
          th({ style: 'width: 40%; text-align: left; font-weight: bold' }, 'Credit Card')
        ),
        tr(
          td({ style: 'vertical-align: top' },
            div(
              input({ name: 'first_name', placeholder: 'First Name', style: "width: 110px; margin: 2px" }),
              input({ name: 'last_name', placeholder: 'Last Name', style: "width: 110px; margin: 2px" })
            ),
            div(
              input({ name: 'street_address', placeholder: 'Address Line 1', style: "width: 300px; margin: 2px" })
            ),
            div(
      				input({ name: 'extended_address', placeholder: 'Address Line 2 (Optional)', style: "width: 300px; margin: 2px"  })
            ),
            div(
              input({ name: 'city', placeholder: 'City', style: 'width: 100px; margin: 2px' }),
              input({ name: 'state', placeholder: 'State', style: 'width: 40px; margin: 2px' }),
              input({ name: 'zip', placeholder: 'Zip', style: 'width: 50px; margin: 2px' }),
              select({ name: 'country_name', style: "width: 90px; margin: 2px" }, option({ disabled: 'disabled' }, 'Country:'), helper("Application.country_options"))
            )
          ),
          td({ style: 'vertical-align: top' },
            div(
              'Number: ', input({ name: 'cc_number', placeholder: 'XXXX-XXXX-XXXX-XXXX', style: "width: 160px" })
            ),
            div(
              'Expiration: ',
              select({ name: 'cc_expiration_date_month', style: 'width: 46px' }, 
                option({ value: '01' }, '01 - January'),
                option({ value: '02' }, '02 - February'),
                option({ value: '03' }, '03 - March'),
                option({ value: '04' }, '04 - April'),
                option({ value: '05' }, '05 - May'),
                option({ value: '06' }, '06 - June'),
                option({ value: '07' }, '07 - July'),
                option({ value: '08' }, '08 - August'),
                option({ value: '09' }, '09 - September'),
                option({ value: '10' }, '10 - October'),
                option({ value: '11' }, '11 - November'),
                option({ value: '12' }, '12 - December')
              ),
              '/',
              select({ name: 'cc_expiration_date_year' }, 
                option('2011'),
                option('2012'),
                option('2013'),
                option('2014'),
                option('2015'),
                option('2016'),
                option('2017'),
                option('2018'),
                option('2019'),
                option('2020')
              )
            ),
            div(
              'Security Code: ',
              input({ name: 'cc_cvv', placeholder: '123', style: 'width: 40px' })
            ),
            input({ type: 'checkbox', name: 'save_card' }), ' Keep this card on file'
          )
        )
      )),
      div({ style: 'text-align: right; margin-top: 10px' }, button({ 'class': 'myButton' }, 'Purchase'))
    );
  });
})(); }
