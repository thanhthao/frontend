with (Hasher('TwitterAccount','Application')) {
	
	define('close_window_and_reload_linked_accounts', function() {
		hide_modal();
		set_route("#linked_accounts");
	});
	
	define('show_link_accounts_modal', function() {
		show_modal(
			h1("Link Your Twitter Account"),
			div({ style: "margin: 15px 10px 15px 10px; text-align: center" },
				"By linking your Twitter account with Badger.com, you will be able to share your domain registrations and transfers with your followers."
			),
			div({ align: "center" },
				a({ onclick: function() {
						start_modal_spin('Wating for authorization...');
						
						var w = window.open("http://api.badger.dev/auth/twitter?access_token=" + Badger.getAccessToken(),"twitter-authorization","width=600,height=600");
						
						var watchClose = setInterval(function() {
					    if (w.closed) {
					    	clearTimeout(watchClose);
					    	close_window_and_reload_linked_accounts()
					    }
						 }, 200);
					}},
					img({ src: "images/linked_accounts/twitter.png" })
				)
			)
		);
	});
	
};