with (Hasher('Ticket','Application')) {

  route('#tickets', function() {
    render(
			h1('Support Tickets'),

      div({ style: 'float: right; margin-top: -44px' },
        a({ 'class': 'myButton myButton-small', href: ticket_form }, 'Create a New Ticket')
      ),

      div({ id: 'tickets' }, p('Loading...'))
    );

    Badger.getTickets(function(response) {
      var pending_tickets = response.data.pending_tickets;
      var closed_tickets = response.data.closed_tickets;

      render({ target: 'tickets' },
        (pending_tickets.length + closed_tickets.length) == 0 ? p('You have no tickets')
        : [ render_ticket_table('Your Pending Tickets', pending_tickets),
            render_ticket_table('Your Closed Tickets', closed_tickets)
        ]
      );
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
              td(strong('Created on: ')),
              td(format_date(ticket.created_at))
            ),
            tr(
              td(strong('Updated on: ')),
              td(format_date(ticket.updated_at))
            ),
            tr(
              td(strong('Category: ')),
              td(ticket.category)
            )
          )),
          div({ 'class': 'ticket-content' }, p(
            p(strong('Subject: '), ticket.subject),
            display_attachments(ticket.attachments),
            p(display_multiple_line(ticket.content))
          )),
          p(),
          ticket.responses.map(function(ticket_response) {
            return div({ 'class': 'ticket-response' },
              span(strong(ticket_response.person.name + ': ')),
              span(display_multiple_line(ticket_response.response)),
              display_attachments(ticket_response.attachments)
            )
          }),
          ticket.status == 'closed' ? '' : response_form(id)
        )
      } else {
        render({ target: ticket_info }, div());
        alert(response.data.message);
      }

      if (ticket.status != 'closed') {
        attachment_field('response-file-uploader');
      }
    })
  });

  define('attachment_field', function(id) {
    document.domain = 'badger.dev';
    var response_attachment_uploader = new qq.FileUploader({
      // pass the dom node (ex. $(selector)[0] for jQuery users)
      element: $('#' + id)[0],
      // path to server-side upload script
      action: Badger.api_host + 'attachments',
      params: {
        access_token: Badger.getAccessToken(),
        upload_inside_iframe: document.domain
      }
    });
  })

  define('display_attachments', function(attachments) {
    return attachments.length == 0 ? ''
    : p(strong('Attachments: '), attachments.map(function (attachment) {
      return [a({ href: attachment.url }, attachment.filename), " "]
    }))
  })

  define('ticket_form', function() {
    show_modal(
      h1({ id: 'ticket-form-header' }, 'Create A New Ticket'),
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
            ),
            tr(
              td(),
              td(div({ id: "file-uploader" }))
            )
          )),
          br(),
          div({ style: 'text-align: right' },
            input({ type: 'submit', value: 'Submit', 'class': "myButton" })
          )
        )
      )
    )
    attachment_field('file-uploader');
  });

  define('response_form', function(id) {
    var result = form({ id: "response-form", action: add_response },
      hidden({ name: 'id', value: id}),
      textarea({ style: 'width: 98%; height: 60px; margin: 10px 0;', name: 'response' }),
      div({ id: "response-file-uploader" }),
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
        render({ target: 'ticket-form-header' }, 'Support Ticket Created')
        render({ target: 'send-ticket-form' },
          div('You have created a support ticket: "',
              strong(form_data.subject),
              '". We will review your ticket and respond to you as quickly as we can. Thank you!'
          ),
          div({ style: 'text-align: right; margin-top: 10px;' }, a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close"))
        );
      } else {
        render({ target: 'send-ticket-form-errors' }, error_message(response));
      }
    });
  });

  define('add_response', function(form_data) {
    if (form_data && form_data.response.trim() != '' ) {
      Badger.addResponseTicket(form_data.id, form_data, function(response) {
        alert(response.data.message);
        set_route('#tickets/' + form_data.id);
      });
    } else {
      alert('Response is empty')
    }
  });

  define('render_ticket_table', function(header, tickets) {
    return(
        tickets.length == 0 ? ''
        : [
          h2(header),
          table({ 'class': 'fancy-table' }, tbody(
            tr(
              th('Subject'),
              th('Category'),
              th('Created on'),
              th('Updated on'),
              th('Status')
            ),
            tickets.map(function(ticket) {
              return tr(
                td(a({ href: '#tickets/' + ticket.id }, ticket.subject)),
                td(ticket.category),
                td(format_date(ticket.created_at)),
                td(format_date(ticket.updated_at)),
                td(ticket.status)
              );
            })
        ))]
      );
  });


  define('format_date', function(day) {
    var date = new Date(day);
    return (date.getMonth() +  1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
  });

  define('display_multiple_line', function(text) {
    var lines = text.split('\n')
    return lines.map(function(line) {
      return [span(line), br()]
    });
  });
}
