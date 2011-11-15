with (Hasher.Controller('ContactUs','Application')) {
  route({
    '#contact_us': 'contact_us',
    '#email_sent' : 'email_sent'
  });

  create_action('contact_us', function() {
    render('contact_us');
  });

  create_action('email_sent', function() {
    render('email_sent');
  })

  create_action('submit_email', function() {
    $('#subject').val($('#subject').val().trim());
    $('#body').val($('#body').val().trim());
    if (($('#subject').val()!="")&&($('#body').val()!="")) {
      Badger.sendEmail($('#subject').val(), $('#body').val());
      redirect_to('#email_sent')
    } else {
      alert("Either your subject or body is left blank.")
    }
  });

  layout('dashboard');
}

with (Hasher.View('ContactUs', 'Application')) {
  create_view('contact_us', function() {
    return div(
      h1('Contact Us'),
      p(span('Email: '), a({href: "mailto:support@badger.com#"}, "support@badger.com")),
      p('Phone: 415-787-5050'),
      h3('Send us a message:'),
      form({ action: action('submit_email') },
        input({ type: 'text', id: 'subject', placeholder: 'Subject', size: 50 }),
        br(),
        textarea({ rows: 10, cols: 50, id: 'body', placeholder: 'Body' }),
        br(),
        input({ type: 'submit', value: 'Send', 'class': "myButton" })
      )
    )
  });

  create_view('email_sent', function() {
    return div(
      h1('Contact us'),
      p("Thank you. Your message has been sent.")
    )
  });
}
