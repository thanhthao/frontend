with (Hasher.Controller('Domains', 'Application')) {
	
	route({
		'#domains/:domain/web_forwards': 'web_forwards_index'
	});
	
	create_action('web_forwards_index', function(domain) {
		Badger.getWebForwards(domain, function(results) {
			render('web_forwards_index', domain, results.data);
		})
	});
	
	create_action('create_web_forward', function(domain, form_data) {
		$('#web-forwards-errors').empty();
		
		Badger.createWebForward(domain, form_data, function(response) {
			if(response.meta.status == 'ok') {
				call_action('Modal.hide');
				
				$('#web-forwards-table').append( helper('show_web_forward_table_row', domain, response.data) );
			} else {
				$('#web-forwards-errors').empty().append(
					helper('Application.error_message', response)
				);
			}
			
		});
	});
	
	create_action('delete_web_forward', function(domain, web_forward) {
		$('#email-forwards-errors').empty();
		
		if( confirm('Delete web forward ' + domain + '/' + web_forward.path + '?') ) {
			Badger.deleteWebForward(domain, web_forward.id, function(response) {
				if(response.meta.status != 'ok') {
					$('#web-forwards-errors').empty().append(
						helper('Application.error_message', response)
					)
				} else {
					$('#web-forwards-table tr#' + web_forward.path).remove(); //remove the row
				}
			});
		}
	});
		
};

with (Hasher.View('Domains', 'Application')) {
	
	create_helper('show_web_forward_table_row', function(domain, web_forward) {
		return tr({ id: web_forward.path },
			td(domain, "/", web_forward.path),
			td(web_forward.destination),
			td(
				a({ 'class': 'myButton myButton-small', href: action('Domains.delete_web_forward', domain, web_forward) }, 'Delete')
			)
		);
	});
		
	create_helper('loading', function(domain) {
		return div(
			h1(domain, ' WEB FORWARDS'),
			div('Loading data...')
		);
	});
	
	create_view('web_forwards_index', function(domain, web_forwards) {
		return div({ id: 'web-forwards-wrapper' },
		
			!web_forwards ? [ helper('loading', domain) ] : [
			
				h1(domain, ' WEB FORWARDS'),

				div({ id: 'web-forwards-errors' }),
				
				form({ action: action('create_web_forward', domain) },
					table({ 'class': 'fancy-table', id: 'web-forwards-table' },
						tbody(
							tr({ 'class': 'table-header'},
								th('Source'),
								th('Destination'),
								th('Actions')
							),

							tr(
								td(
									div(
										domain, "/", input({ name: 'path', placeholder: 'path' })
									)
								),
								td(
									input({ name: 'destination', placeholder: 'example.com' })
								),
								td(
									button({ 'class': 'myButton myButton-small' }, 'Add')
								)
							),

							(web_forwards || []).map(function(web_forward) {
								return helper('show_web_forward_table_row', domain, web_forward);
							})
						)
					)
				)
				
			]				
		);
	});
	
};