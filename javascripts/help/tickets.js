with (Hasher('Ticket','Application')) {

  route('#tickets', function() {
    render(
			h1('Tickets'),

      div({ style: 'float: right; margin-top: -44px' },
        a({ 'class': 'myButton myButton-small', href: ticket_form }, 'Create a New Ticket')
      ),

      div(
        h2('Your Pending Tickets'),
        div({ id: 'pending-tickets' }, p('Loanding...'))
      ),

      div(
        h2('Your Closed Tickets'),
        div({ id: 'closed-tickets' }, p('Loanding...'))
      )
    );

    Badger.getTickets(function(response) {
      var pending_tickets = response.data.pending_tickets;
      var closed_tickets = response.data.closed_tickets;

      render_ticket_table('pending-tickets', pending_tickets);
      render_ticket_table('closed-tickets', closed_tickets);
    });
  });

  route('#tickets/:id', function(id) {
    var ticket_info = div(p('Loading...'))
    render(
      h1('Ticket Information'),
      ticket_info
    );

    Badger.getTicket(id, function(response) {
      if (response.meta.status == 'ok') {
        ticket = response.data;
        render({ target: ticket_info },
          table(tbody(
            tr(
              td(strong('Status: ')),
              td(ticket.status)
            ),
            tr(
              td(strong('Created At: ')),
              td(new Date(Date.parse(ticket.created_at)).toDateString())
            ),
            tr(
              td(strong('Updated At: ')),
              td(new Date(Date.parse(ticket.updated_at)).toDateString())
            ),
            tr(
              td(strong('Category: ')),
              td(ticket.category)
            )
          )),
          div({ 'class': 'ticket-content' }, p(
            p(strong('Subject: '), ticket.subject),
            p(ticket.content)
          )),
          p(),
          ticket.responses.map(function(ticket_response) {
            return div({ 'class': 'ticket-response' },
              span(strong(ticket_response.person.name + ': ')),
              span(ticket_response.response)
            )
          }),
          ticket.status == 'closed' ? '' : response_form(id)
        )
      } else {
        render({ target: ticket_info }, div());
        alert(response.data.message);
      }
    })
  });

  define('ticket_form', function() {
    show_modal(
      h1('Create A New Ticket'),
      div({ id: 'send-ticket-form-errors' }),

      div({ id: 'send-ticket-form' },
        form({ action: submit_ticket },
          table({ style: 'width: 100%' }, tbody(
            tr(
              td(strong('Category:')),
              td(select({ id: "category", name: 'category' },
                option({ disabled: "disabled" }, "Select A Field"),
                option({ value: "Website Bug" }, "Website Bug"),
                option({ value: "Feature Request" }, "Feature Request"),
                option({ value: "Billing Inquiry" }, "Billing Inquiry")
              ))
            ),

            tr(
              td(strong('Subject:')),
              td(input({ type: 'text', name: 'subject', placeholder: 'Brief description', style: 'width: 98%' }))
            ),

            tr(
              td({ style: 'vertical-align: top' }, strong('Content:')),
              td(textarea({ name: 'content', placeholder: 'Detailed description', style: 'height: 100px; width: 98%' }))
            )

          )),

          br(),
          div({ style: 'text-align: right' },
            input({ type: 'submit', value: 'Submit', 'class': "myButton" })
          )
        )
      )
    )
  });

  define('response_form', function(id) {
    var result = form({ id: "response-form", action: add_response },
      hidden({ name: 'id', value: id}),
      textarea({ style: 'width: 98%; height: 60px; margin: 10px 0;', name: 'response' }),
      br(),
      input({'class': 'myButton', type:'submit', value: 'Reply' })
    );

    return result;
  });

  define('submit_ticket', function(form_data) {
    render({ target: 'send-ticket-form-errors' }, '');

    Badger.createTicket(form_data, function(response) {
      if (response.meta.status == 'ok') {
        set_route(get_route());
        render({ target: 'send-ticket-form' },
          div({ style: 'font-weight: bold; text-align: center' }, "Your ticket has been created!")
        );
      } else {
        render({ target: 'send-ticket-form-errors' }, error_message(response));
      }
    });
  });

  define('add_response', function(form_data) {
    if (form_data && form_data.response.trim() != '' ) {
      Badger.addResponseTicket(form_data.id, form_data, function(response) {
        set_route('#tickets/' + form_data.id);
        alert(response.data.message);
      });
    } else {
      alert('Response is empty')
    }
  });

  define('render_ticket_table', function(target_div, tickets) {
    render({ target: target_div },
        tickets.length == 0 ? p('You have no tickets')
        : table({ 'class': 'fancy-table' }, tbody(
            tr(
              th('Subject'),
              th('Category'),
              th('Created At'),
              th('Updated At'),
              th('Status')
            ),
            tickets.map(function(ticket) {
              return tr(
                td(a({ href: '#tickets/' + ticket.id }, ticket.subject)),
                td(ticket.category),
                td(new Date(Date.parse(ticket.created_at)).toDateString()),
                td(new Date(Date.parse(ticket.updated_at)).toDateString()),
                td(ticket.status)
              );
            })
        ))
      );
  })
}
