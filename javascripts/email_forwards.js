with (Hasher.Controller('Domains', 'Application')) {
	
	route({
		'#domains/:domain/email_forwards': 'email_forwards_index'
	});
	
	create_action('email_forwards_index', function(domain) {
		Badger.getEmailForwards(domain, function(results) {
			render('email_forwards_index', domain, results.data);
		})
	});
	
	create_action('create_email_forward', function(domain, form_data) {
		$('#email-forwards-errors').empty();
		
		Badger.createEmailForward(domain, form_data, function(response) {
			if(response.meta.status == 'ok') {
				call_action('Modal.hide');
				
				console.log( helper('show_email_forward_table_row', domain, response.data) );
				
				$('#email-forwards-table').append( helper('show_email_forward_table_row', domain, response.data) );
				
			} else {
				$('#email-forwards-errors').empty().append(
					helper('Application.error_message', response)
				);
			}
			
		});
	});
	
	create_action('delete_email_forward', function(domain, email_forward) {
		$('#email-forwards-errors').empty();
		
		if( confirm('Delete email forward ' + email_forward.username + '@' + domain + '?') ) {
			Badger.deleteEmailForward(domain, email_forward.id, function(response) {
				if(response.meta.status != 'ok') {
					$('#email-forwards-errors').empty().append(
						helper('Application.error_message', response)
					)
				} else {
					$('#email-forwards-table tr#' + email_forward.username).remove(); //remove the row
				}
			});
		}
	});
	
	create_action('update_email_forward', function(domain, email_forward, fomr_data) {
		$('#update-email-forward-errors').empty();
		
		Badger.updateEmailForward(domain, email_forward.id, form_data, function(response) {
			if(response.meta.status != 'ok') {
				$('#update-email-forward-errors').empty().append(
					helper('Application.error_message', response)
				);
			} else {
				call_action('Modal.hide');
				
				$('#email-forwards-table tr#' + email_forward.username).remove(); //remove the row
			}
		});
	});
	
};

with (Hasher.View('Domains', 'Application')) {
	
	create_helper('show_email_forward_table_row', function(domain, email_forward) {
		return tr({ id: email_forward.username },
			td(email_forward.username, "@", domain),
			td(email_forward.destination),
			td(
				a({ 'class': 'myButton myButton-small', href: action('Domains.delete_email_forward', domain, email_forward) }, 'Delete')
			)
		);
	})
		
	create_helper('loading', function(domain) {
		return div(
			h1(domain, ' EMAIL FORWARDS'),
			div('Loading data...')
		);
	});
	
	create_view('email_forwards_index', function(domain, email_forwards) {
		return div({ id: 'email-forwards-wrapper' },
		
			!email_forwards ? [ helper('loading', domain) ] : [
			
				h1(domain, ' EMAIL FORWARDS'),

				div({ id: 'email-forwards-errors' }),
				
				form({ action: action('create_email_forward', domain) },
					table({ 'class': 'fancy-table', id: 'email-forwards-table' },
						tbody(
							tr({ 'class': 'table-header'},
								th('Source'),
								th('Destination'),
								th('Actions')
							),

							tr(
								td(
									div(
										input({ name: 'username', placeholder: 'username' }), '@', domain
									)
								),
								td(
									input({ name: 'destination', placeholder: 'test@example.com' })
								),
								td(
									button({ 'class': 'myButton myButton-small' }, 'Add')
								)
							),

							(email_forwards || []).map(function(email_forward) {
								return helper('show_email_forward_table_row', domain, email_forward)
							})
						)
					)
				)
				
			]				
		);
	});
	
};