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
				(response.data || []).length == 0 ? [
					div({ style: "margin-bottom: 15px" }, "You have not linked any social accounts yet, why not add one now?"),
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
						var row = linked_accounts_table_row("Twitter",
						  div({ id: ("twitter-" + account.id), style: "text-align: center" },
							  img({ src: "images/ajax-loader.gif" })
						  )
						);
						
						update_linked_account_row_handler(account);
						
						return row;
					} else if (account.site == "facebook") {
						
						var row = linked_accounts_table_row("Facebook",
						  div({ id: ("facebook-" + account.id), style: "text-align: center" },
							  img({ src: "images/ajax-loader.gif" })
						  )
						);
						
						update_linked_account_row_handler(account);
						
						return row;
						
					} else if (account.site == "godaddy" || account.site == "networksolutions") {
					  var name = 'Unknown';
					  var status = 'Unknown';
  					var error = false;
  					switch (account.status) {
  					  case 'synced':
  					    status = 'Linked'
  					    break;
  					  case 'error_auth':
  					    status = span({ 'class': 'error-red' }, 'Login Failure')
  					    error = true;
  					    break
  					}
  					switch (account.site) {
  					  case 'godaddy':
  					    name = 'Go Daddy, Inc.';
  					    break;
  					  case 'networksolutions':
    				    name = 'Network Solutions LLC';
    				    break;
  					}
  					
					  return linked_accounts_table_row(name, 
			  	    div({ id: (account.site + "-" + account.id) },
			  	      div({ 'class': error ? "error-message" : "info-message", style: "position: relative; text-align: right; margin: 5px auto 5px auto; height: 95px; width: 350px;" },
			  	        a({ href: curry(Registrar.remove_link, account), 'class': 'close-button' }, 'X'),
                  h3("Status: ", status),
                  div("Last Sync: " + (account.last_synced_at ? new Date(Date.parse(account.last_synced_at)).toString() : 'Never')),
									div("Login: " + account.login + " (" + account.domain_count + " Linked Domain(s))"),
									error ? a({ 'class': "myButton red", style: 'margin: 10px 0 0;', href: curry(Registrar.show_link, account)}, "edit")
									  : a({ 'class': "myButton", style: 'margin: 10px 0 0;', href: curry(Registrar.sync_now, account)}, "Sync Now")
								)
							)
					  );
					} else {
						console.log("Unknown account (" + account.site + ")", account);
					}
					
				})
			])
		));
	});
	
	define('linked_accounts_table_row', function(site, account_info) {
		return tr(
			td({ width: "40%" }, div({ style: "font-weight: bold; font-size: 20px; padding-left: 15px;" }, site)),
			td({ width: "60%" }, account_info)
		);
	});
	
	define('update_linked_account_row_handler', function(account) {
	  Badger.getAuthorizedAccountInfo(account.id, function(response) {
		  if (response.data.status == "linked") {
				$("#" + account.site + "-" + account.id).html(
					div({ 'class': "info-message", style: "margin: 5px auto 5px auto; height: 25px; width: 350px;" },
						img({ style: "margin-top: -11px", src: response.data.profile_image_url }),
						div({ style: "float: right; margin: 4px 25px auto auto;" }, response.data.name + " (@" + response.data.username + ")")
					)
				).css("text-align", "left");
		  } else {
				$("#" + account.site + "-" + account.id).html(
				  div({ style: "margin: 15px 15px 15px auto; float: right" },span({ 'class': "error" }, "Account unlinked. ", a({ href: curry(TwitterAccount.show_link_accounts_modal, response.data.id) }, "Link again?")))
				).css("text-align", "left");
		  }
		});
	});
	
	define('link_accounts_button', function(target) {
		return a({ 'class': "myButton", style: "float: right; margin: 5px auto 5px auto", href: target }, "Link Accounts");
	});
	
	define('authorize_account', function() {
		Badger.authorizeLinkedAccount("developer", function(response) {
			console.log(response);
		});
	});
	
	define('show_all_account_link_rows', function() {
		// var existing_accounts = (existing_accounts || []).map(function(a) { return a.site });
		
		var result = [
		  linked_accounts_table_row("Go Daddy", "godaddy", link_accounts_button(curry(Registrar.show_link, {site: 'godaddy'}))),
		  linked_accounts_table_row("Network Solutions", "networksolutions", link_accounts_button(curry(Registrar.show_link, {site: 'networksolutions'})))
		];
		
		if ($("#accounts-table tr#twitter").length == 0) result.push(
			linked_accounts_table_row("Twitter", "twitter", link_accounts_button(curry(TwitterAccount.show_link_accounts_modal)))
		);
		
		if ($("#accounts-table tr#facebook").length == 0) result.push(
			linked_accounts_table_row("Facebook", "facebook", link_accounts_button(curry(FacebookAccount.show_link_accounts_modal)))
		);
			
		return result;
	});
	
	define('close_window_and_reload_linked_accounts', function(old_account_id) {
	  // if fixing broken linked account, delete the old one
	  if (old_account_id) {
	    Badger.deleteLinkedAccount(old_account_id, function(response) {
	      hide_modal();
    		set_route("#linked_accounts");
	    });
	  } else {
      hide_modal();
  		set_route("#linked_accounts");
	  }
	});

}