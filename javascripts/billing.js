with (Hasher.Controller('Billing','Application')) {
  route({
    '#account/billing': 'index'
  });
  
  create_action('index', function() {
    BadgerCache.getPaymentMethods(function(results) {
      render('index', results.data.message ? [] : results.data);
    });
  });
  
  create_action('purchase_credits', function(callback, form_data) {
    // prevent double submits            
    if ($('#purchase-button').attr('disabled')) return;
    else $('#purchase-button').attr('disabled', true);
    
    if (form_data.credits == '1' && form_data.credits_variable) form_data.credits = form_data.credits_variable;
    delete form_data.credits_variable;

    $('#errors').empty();

    Badger.purchaseCredits(form_data, function(response) {
      $('#purchase-button').attr('disabled', false);
      console.log(response);

      if (response.meta.status == 'ok') {
        BadgerCache.flush('account_info');
        BadgerCache.getAccountInfo(function(response) {
          helper('Application.update_credits');

          if (callback) {
            callback();
          } else {
            call_action('Modal.hide');
            call_action('index');
          }
          
        });
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    });
  });
  
  layout('dashboard');
}

with (Hasher.View('Billing', 'Application')) { (function() {

  create_view('index', function(contacts) {
    return div(
      h1('Billing Settings'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Billing.purchase_modal') }, 'Purchase Credits')
      ),

      table({ 'class': 'fancy-table' },
        tbody(
              //           (contacts || []).map(function(payment_method) {
              //             return tr(
              //               // td(
              //               //   div(contact.first_name, ' ', contact.last_name)
              //               // ),
              //               // td(
              //               //   div(contact.cc_number),
              //               //   div(contact.cc_expiration)
              //               // ),
              // td(payment_method.name),
              //               td({ style: "text-align: right" },
              //                 a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'Billing.purchase_modal', payment_method) }, 'Edit')
              //               )
              //             );
              //           })
        )
      )
    );
  });

  create_helper('credits_table', function() {
    var tmp_table = table({ 'class': 'fancy-table purchase-credits' }, tbody(
      tr({ 'class': 'table-header' },
        th({ style: 'width: 25%' }, 'Package'), 
        th({ style: 'width: 25%' }, 'Credits'), 
        th({ style: 'width: 25%' }, 'Each'), 
        th({ style: 'width: 25%; text-align: right' }, 'Total')
      ),
      tr(
        td(input({ checked: 'checked', type: 'radio', name: 'credits', value: 1 })), 
        td(
          select({ name: 'credits_variable' },
            option(1), option(2), option(3), option(4), option(5), option(6), option(7), option(8), option(9)
          )
        ),
        td('$15'), 
        td({ style: "text-align: right" }, '$', span({ id: 'variable-credits' }, '15'))
      ),
      tr(
        td(input({ type: 'radio', name: 'credits', value: 10 })), 
        td(10), 
        td('$14'), 
        td({ style: "text-align: right" }, '$', 10*14)
      ),
      tr(
        td(input({ type: 'radio', name: 'credits', value: 25 })), 
        td(25), 
        td('$13'), 
        td({ style: "text-align: right" }, '$', 25*13)
      ),
      tr(
        td(input({ type: 'radio', name: 'credits', value: 50 })), 
        td(50), 
        td('$12'), 
        td({ style: "text-align: right" }, '$', 50*12)
      ),
      tr(
        td(input({ type: 'radio', name: 'credits', value: 100 })), 
        td(100), 
        td('$11'), 
        td({ style: "text-align: right" }, '$', 100*11)
      ),
      tr(
        td(input({ type: 'radio', name: 'credits', value: 250 })), 
        td(250), 
        td('$10'), 
        td({ style: "text-align: right" }, '$', 250*10)
      )
    ));
    
    $(tmp_table).find('select').change(function(e) {
      $('#variable-credits').html($(e.target).val()*15);
      $(tmp_table).find('input[value=1]').click();
    });

    $(tmp_table).find('input').each(function(index, inp) {
      $(inp).click(function(e) {
        e.stopPropagation();
        var num_credits = parseInt($(e.target).val());
        if (num_credits == 1) {
          num_credits = parseInt($(tmp_table).find('select').val());
        }
        var price = 0;
        if (num_credits < 10) price = num_credits*15;
        else if (num_credits == 10) price = 10*14;
        else if (num_credits == 25) price = 25*13;
        else if (num_credits == 50) price = 50*12;
        else if (num_credits == 100) price = 100*11;
        else if (num_credits == 250) price = 250*10;
        $('#purchase-button').html('Purchase ' + num_credits + (num_credits == 1 ? ' Credit' : ' Credits') + " for $" + price);
      });
      
      $(inp).parent().parent().click(function(e) { if (event.target != inp) $(inp).click() });
    });

    return tmp_table;
  });

  create_helper('purchase_modal', function(callback) {
    return form({ action: action('purchase_credits', callback) },
      h1('Purchase Credits'),
      //div({ style: 'margin-bottom: 15px' }, 'Use credits to buy new domains, transfer in existing domains, or renew expiring domain.'),
      div({ id: 'errors' }),
      table({ style: 'width: 100%' }, tbody(
        tr(
          td({ style: 'vertical-align: top; width: 300px; padding-right: 30px' },
            div({ 'class': 'info-message' },
              helper('credits_table'),
              div({ style: 'margin-top: 10px; font-weight: bold; text-align: center' }, '1 credit = 1 domain for 1 year'),
              div({ style: 'color: #666; font-style: italic; text-align: center' }, 'On new domains, renewals or transfers.')
            )
          ),

          td({ style: 'vertical-align: top' },
            div({ style: 'font-weight: bold' }, 'Billing Address'),
            div(
              input({ name: 'first_name', placeholder: 'First Name', style: "width: 110px; margin: 2px" }),
              input({ name: 'last_name', placeholder: 'Last Name', style: "width: 110px; margin: 2px" })
            ),
            div(
              input({ name: 'street_address', placeholder: 'Address Line 1', style: "width: 240px; margin: 2px" })
            ),
            div(
      				input({ name: 'extended_address', placeholder: 'Address Line 2 (Optional)', style: "width: 240px; margin: 2px"  })
            ),
            div(
              input({ name: 'city', placeholder: 'City', style: 'width: 100px; margin: 2px' }),
              input({ name: 'state', placeholder: 'State', style: 'width: 40px; margin: 2px' }),
              input({ name: 'zip', placeholder: 'Zip', style: 'width: 50px; margin: 2px' })
            ),
            div(
              select({ name: 'country_name', style: "width: 90px; margin: 2px" }, option({ disabled: 'disabled' }, 'Country:'), helper("Application.country_options"))
            ),
          

            div({ style: 'font-weight: bold; margin-top: 12px' }, 'Credit Card'),
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
      
      div({ style: 'text-align: right; margin-top: 10px' }, button({ 'class': 'myButton', id: 'purchase-button' }, 'Purchase 1 Credit for $15'))
    );
  });
})(); }
