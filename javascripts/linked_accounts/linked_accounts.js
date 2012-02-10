with (Hasher('LinkedAccounts','Application')) {

	route('#linked_accounts', function() {
		var target_div = div("Loading...");
		
		render(
			div(
				h1('Linked Accounts'),
				target_div
			)
		)
				
		Badger.getLinkedAccounts(function(response) {
			render({ target: target_div },
				((response.data||[]).length == 0) ? [
					div({ style: "margin-bottom: 15px" }, "You have not linked any accounts yet, why not add one now?"),
					linked_accounts_table("show_all")
				] : [
					div({ style: "float: right; margin-top: -44px" },
						a({ 'class': "myButton myButton-small", href: curry(add_linked_accounts_modal, response.data) }, "Add Linked Accounts")
					),
					linked_accounts_table(response.data)
				]
			);
		});
	});
	
	define('add_linked_accounts_modal', function() {
		show_modal(
			h1('Add Linked Accounts'),
			linked_accounts_table("show_all")
		);
	});
	
	define('linked_accounts_table', function(accounts) {
		return table({ id: "accounts-table", 'class': "fancy-table" }, tbody(
			// if the user has not linked any accounts yet, we want to show all of the accounts that they can link immediately.
			(accounts == "show_all" ? [
				show_all_account_link_rows()
			] : [
				(accounts || []).map(function(account) {
					
					if (account.site == "twitter") {
						var row = linked_accounts_table_row(div({ style: "font-weight: bold; font-size: 20px; padding-left: 15px;" }, "Twitter"), "twitter", div({ id: ("twitter-" + account.id), style: "text-align: center" },
							img({ src: "images/ajax-loader.gif" })
						));
						
						Badger.getAuthorizedAccountInfo(account.id, account.site, function(response) {
							$("#" + account.site + "-" + account.id).empty().append(
								div({ 'class': "info-message", style: "margin: 5px auto 5px auto; height: 25px; width: 350px;" },
									img({ style: "margin-top: -11px", src: response.data.profile_image_url }),
									div({ style: "float: right; margin: 4px 25px auto auto;" }, response.data.name + " (@" + response.data.username + ")")
								)
							).css("text-align", "left");
						});
						
						return row;
						
					} else if (account.site == "facebook") {
						
						var row = linked_accounts_table_row(div({ style: "font-weight: bold; font-size: 20px; padding-left: 15px;" }, "Facebook"), "facebook", div({ id: ("facebook-" + account.id), style: "text-align: center" },
							img({ src: "images/ajax-loader.gif" })
						));
						
						Badger.getAuthorizedAccountInfo(account.id, account.site, function(response) {
							$("#" + account.site + "-" + account.id).empty().append(
								div({ 'class': "info-message", style: "margin: 5px auto 5px auto; height: 25px; width: 350px;" },
									img({ style: "margin-top: -11px", src: response.data.profile_image_url }),
									div({ style: "float: right; margin: 4px 25px auto auto;" }, response.data.name + " (" + response.data.username + ")")
								)
							).css("text-align", "left");
						});
						
						return row;
						
					} else if (account.site == "godaddy") {
						
					} else {
						console.log("Unknown account (" + account.site + ")", account);
					}
					
				})
			])
		));
	});
	
	define('linked_accounts_table_row', function(site, row_id, link_button_or_account_info) {
		return tr({ id: row_id },
			td({ width: "30%" }, site),
			td({ width: "70%" }, link_button_or_account_info)
		);
	});
	
	define('link_accounts_button', function(target) {
		return a({ 'class': "myButton myButton", style: "float: right; margin: 5px auto 5px auto", href: target }, "Link Accounts");
	});
	
	define('authorize_account', function() {
		Badger.authorizeLinkedAccount("developer", function(response) {
			console.log(response);
		});
	});
	
	define('show_all_account_link_rows', function() {
		// var existing_accounts = (existing_accounts || []).map(function(a) { return a.site });
		
		var result = [];
		
		if ($("#accounts-table tr#godaddy").length == 0) result.push(
			linked_accounts_table_row("GoDaddy", "godaddy", link_accounts_button(curry(function() { window.open("http://api.badger.dev/auth/developer", "width=600, height=600") })))
		);
		
		if ($("#accounts-table tr#twitter").length == 0) result.push(
			linked_accounts_table_row("Twitter", "twitter", link_accounts_button(curry(TwitterAccount.show_link_accounts_modal)))
		);
		
		if ($("#accounts-table tr#facebook").length == 0) result.push(
			linked_accounts_table_row("Facebook", "facebook", link_accounts_button(curry(FacebookAccount.show_link_accounts_modal)))
		);
			
		return result;
	});

}