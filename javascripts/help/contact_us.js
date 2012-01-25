with (Hasher('ContactUs','Application')) {
 
  route('#contact_us', function() {
    render(
      h1('Contact Us'),
      p("Use this form if you'd like to ask us questions or give us suggestions.  You can also email us directly at ", a({ href: 'mailto:support@badger.com' }, 'support@badger.com'), " or call us at ", a({ href: 'tel:+14157875050' }, '415-787-5050' ), "."),
			
			br(),

			div({ id: 'send-contact-us-form-errors', style: 'width: 490px; margin: 0 auto' }),

			div({ 'class': 'info-message', style: 'width: 450px; margin: 0 auto', id: 'send-contact-us-form' },
				h2({ style: 'margin: 0 0 15px 0' }, 'Send Us an Email'),
	      form({ action: submit_email },
	        table({ style: 'width: 100%' }, tbody(
	          tr(
	            td({ style: 'width: 1%' }, strong('To:')),
	            td(a({ href: 'mailto:support@badger.com' }, 'support@badger.com'))
	          ),

  					(!Badger.getAccessToken() ? [
  	          tr(
  	            td(strong('From:')),
  	            td(
  	              input({ type: 'text', name: 'name', 'class': 'contact-subject', placeholder: 'Your Name', style: 'width: 40%' }),
  	              ' ',
  	              input({ type: 'text', name: 'email', 'class': 'contact-subject', placeholder: 'Your Email Address', style: 'width: 40%' })
  	            )
  	          )
  					]:[]),
	          
	          tr(
	            td(strong('Subject:')),
	            td(input({ type: 'text', name: 'subject', 'class': 'contact-subject', placeholder: 'Brief description', style: 'width: 98%' }))
	          ),

	          tr(
	            td({ style: 'vertical-align: top' }, strong('Body:')),
	            td(textarea({ name: 'body', 'class': 'contact-body', placeholder: 'Detailed description', style: 'height: 100px; width: 98%' }))
	          )
	          
	        )),

	        br(),
					div({ style: 'text-align: right' },
	        	input({ type: 'submit', value: 'Send', 'class': "myButton" })
					)
	      )
			)
    );
  });
  
  define('submit_email', function(form_data) {
    render({ target: 'send-contact-us-form-errors' }, '');

    Badger.sendEmail(form_data, function(response) {
      console.log(response);
      if (response.meta.status == 'ok') {
        render({ target: 'send-contact-us-form' },
          div({ style: 'font-weight: bold; text-align: center' }, "Your email has been sent!")
        );
      } else {
        render({ target: 'send-contact-us-form-errors' }, error_message(response));
      }
    });
  });

}
