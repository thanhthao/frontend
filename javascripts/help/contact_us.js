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
      alert("Either your subject or body is left blank.");
    }
  });

  layout('dashboard');
}

with (Hasher.View('ContactUs', 'Application')) {
  create_view('contact_us', function() {
    return div(
      h1('Contact Us'),
      p("If you've come here looking for help and support, then we've failed somewhere along the way.  Please let us know what went wrong by emailing us at ", a({ href: 'mailto:support@badger.com' }, 'support@badger.com'), " or by calling us at ", a({ href: 'tel:+14157875050' }, '415-787-5050' ), " and we'll try to make things better.  Sorry!"),
			
			br(),
			div({ 'class': 'info-message', style: 'width: 450px; margin: 0 auto' },
				h2({ style: 'margin: 0 0 15px 0' }, 'Send Us an Email'),
	      form({ action: action('submit_email') },
					div(strong('To: '),  a({ href: 'mailto:support@badger.com' }, 'support@badger.com')),
	        input({ type: 'text', id: 'subject', 'class': 'contact-subject', placeholder: 'Subject', style: 'width: 98%' }),
	        br(),
	        textarea({ id: 'body', 'class': 'contact-body', placeholder: 'Body', style: 'height: 100px; width: 98%' }),
	        br(),
					div({ style: 'text-align: right' },
	        	input({ type: 'submit', value: 'Send', 'class': "myButton" })
					)
	      )
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
