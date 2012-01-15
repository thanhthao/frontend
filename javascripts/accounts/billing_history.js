with (Hasher('Billing','Application')) {

  route('#account/billing', function() {
    var target_div = div('Loading...');

    render(
      h1('Credits & Billing History'),
      div({ style: 'float: right; margin-top: -44px' },
        a({ 'class': 'myButton myButton-small', href: curry(purchase_modal, function() { set_route('#account/billing'); }) }, 'Purchase Credits')
      ),
      target_div
    );
    
    Badger.getCreditHistory(function(results) {
      render({ target: target_div }, 
        ((results.data||[]).length == 0) ? 'No history found.' : table({ 'class': 'fancy-table' },
          tbody(
            tr(
              th('Date'),
              th('Description'),
              th('Domain'),
              th({ style: "text-align: right" }, 'Credits')
            ),
            
            results.data.map(function(credit_history) {
              return tr(
                td(new Date(Date.parse(credit_history.created_at)).toDateString()),
                td(credit_history.details),
                td(credit_history.domain ? a({ href: '#domains/' + credit_history.domain.name }, Domains.truncate_domain_name(credit_history.domain.name, 30)) : ''),
                td({ style: "text-align: right" }, credit_history.num_credits)

                // td({ style: "text-align: right" },
                //   a({ 'class': 'myButton myButton-small', href: curry(show_modal, 'Billing.purchase_modal', payment_method) }, 'Edit')
                // )
                // td(
                //   div(contact.first_name, ' ', contact.last_name)
                // ),
                // td(
                //   div(contact.cc_number),
                //   div(contact.cc_expiration)
                // ),
                );
              })
          )
        )        
        
      );
    });
  });

}
