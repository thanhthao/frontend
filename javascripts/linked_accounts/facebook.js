with (Hasher('FacebookAccount','Application')) {
	
	define('show_link_accounts_modal', function(old_account_id) {
		show_modal(
			h1("Link Your Facebook Account"),
			div({ style: "margin: 15px 10px 15px 10px; text-align: center" },
				"By linking your Facebook account with Badger.com, you will be able to share your domain registrations and transfers with your friends. Cool!"
			),
			div({ align: "center" },
				a({ onclick: function() {
						start_modal_spin('Wating for authorization...');
						
						Badger.getLinkedAccountAuthorizationUrl("facebook", function(response) {
							var w = window.open(response.data, "facebook-authorization", "width=600,height=600");

							var watchClose = setInterval(function() {
						    if (w.closed) {
						    	clearTimeout(watchClose);
									LinkedAccounts.close_window_and_reload_linked_accounts(old_account_id);
						    }
							 }, 200);
						});
					}},
					img({ src: "images/linked_accounts/facebook.png" })
				)
			)
		);
	});
	
};