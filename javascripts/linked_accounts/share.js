with (Hasher('LinkedAccounts','Application')) {
	
	define('perform_share_registration', function(domain_name, callback) {
		$("input[name$=-account-id]:checked").each(function() {
      Badger.shareDomainRegistration(this.value, domain_name, hide_share_messages, function(response) {
        console.log("share registration response", response);
      });
		});

		var hide_share_messages = $("input[name=hide-share-messages]").attr('checked') != undefined;
		
		if (hide_share_messages) {
      Badger.changeHideShareMessages("true");
		  after_hide_share_messages_submitted();
		} else {
		  $("input[name$=-account-id]:checked").length == 0 ? (callback ? callback() : hide_modal()) : after_submit_share(callback);
		}
	});
	
	define('perform_share_bulk_registration', function(domain_name, num_domains, hide_share_messages, callback) {
		$("input[name$=-account-id]:checked").each(function() {
			Badger.shareDomainBulkRegistration(this.value, domain_name, num_domains, function(response) {
				console.log("share bulk registration response", response);
			});
		});
		
		var hide_share_messages = $("input[name=hide-share-messages]").attr('checked') != undefined;
		
		if (hide_share_messages) {
      Badger.changeHideShareMessages("true");
		  after_hide_share_messages_submitted();
		} else {
		  $("input[name$=-account-id]:checked").length == 0 ? (callback ? callback() : hide_modal()) : after_submit_share(callback);
		}
	});
	
	define('perform_share_transfer', function(num_domains, hide_share_messages, callback) {
		$("input[name$=-account-id]:checked").each(function() {
			Badger.shareDomainTransfer(this.value, num_domains, function(response) {
				console.log("share transfer response", response);
			});
		});
		
		var hide_share_messages = $("input[name=hide-share-messages]:checked").length > 0;
		
		if (hide_share_messages) {
      Badger.changeHideShareMessages("true");
		  after_hide_share_messages_submitted();
		} else {
		  $("input[name$=-account-id]:checked").length == 0 ? (callback ? callback() : hide_modal()) : after_submit_share(callback);
		}
	});
	
	define('after_submit_share', function(callback) {
	  return show_modal(
	    h1("Content Submitted"),
	    p("Awesome! The message has been submitted, and should show up in a moment."),
	    br(),
      a({ 'class': "myButton", style: "float: right; margin-top: -25px", href: callback ? callback : hide_modal }, "Close")
	  );
	});
	
	define('after_hide_share_messages_submitted', function(callback) {
	  return show_modal(
	    h1("Share Messages Hidden"),
	    p("Got it, we won't show these messages to you anymore!"),
	    p("If you would like to enable them again in the future, you can do so through the ", b("Linked Accounts"), " tab, located under ", b("My Account.")),
	    br(),
      a({ 'class': "myButton", style: "float: right; margin-top: -25px", href: callback ? callback : hide_modal }, "Close")
	  );
	});
	
	
	
	define('show_share_modal_base', function(header, message, content, share_action, callback) {
		var modal = show_modal(
			div({ id: "share-modal-content", style: "height: 230px" })
		);
		
		start_modal_spin();
		
		Badger.accountInfo(function(response) {
			if (response.data.hide_share_messages) {
				hide_modal();
			} else {
	  		start_modal_spin("Loading linked accounts...");

				// load linked accounts, then sub them in
				Badger.getLinkedAccounts(function(response) {
					stop_modal_spin();
			
					$("#share-modal-content").attr('style','').empty().append(
						h1(header),
						content,
				
						(response.data || []).length == 0 ? [
							div({ style: "margin-top: 20px" },
								b("You haven't linked any accounts yet! "),
								ul(
									li(a({ href: curry(TwitterAccount.show_link_accounts_modal, curry(LinkedAccounts.show_share_modal_base, header, message, content)) }, "Link Twitter Account")),
									li(a({ href: curry(FacebookAccount.show_link_accounts_modal, curry(LinkedAccounts.show_share_modal_base, header, message, content)) }, "Link Facebook Account"))
								)
							)
						] : [
							table( tbody(
								tr(
									td({ width: "40%" },
										div({ 'class': "info-message" },
											table({ 'class': "fancy-table" }, tbody(
												tr({ 'class': "table-header" },
													th("Linked Accounts"), th("")
												),
												(response.data || []).map(function(account) {
													return tr(
														td(account.site.capitalize_first()),
														td(input({ type: "checkbox", name: (account.site + "-account-id"), value: account.id }))
													)
												})
											))
										)
									),
									td({ width: "5%" }, ""),
									td({ width: "100%", }, preview_message(message))
								)
							)),
						],
				
						div({ style: "float: right; margin-top: -30px" },
							span({ style: "margin-right: 10px" }, input({ type: "checkbox", name: "hide-share-messages" }), "Don't show this to me again"),
							a({ 'class': "myButton myButton", href: curry(share_action, callback) }, "Continue")
						)
					);
				});
			}
		})
		
		return modal;
	});
	
	define('preview_message', function(message) {
		return div({ style: "margin-top: -30px" },
			b("Preview: "),
			p({ id: "message-preview" }, "\"" + message + "\"")
		);
	})
	
	define('show_share_registration_modal', function(domain_name, callback) {
		return show_share_modal_base("Share Registration", ("I just registered " + domain_name + " on Badger.com!"),
			div(
				p({ style: "margin-bottom: 10px" }, "Woohoo, you just registered ", b(domain_name), "! Would you like to tell this to your friends, and help spread the word about Badger.com?")
			),
			curry(perform_share_registration, domain_name),
			callback
		);
	});
	
	define('show_share_bulk_registration_modal', function(domain_name, num_domains, callback) {
		return show_share_modal_base("Share Bulk Registration", ("I just registered " + domain_name + ", as well as " + (num_domains - 1) + " other " + (num_domains.length > 1 ? "domains" : "domain") + ", to Badger.com!"),
			div(
				p("Whoa, you registered quite a few domains there! Would you like to inform your friends of your recent domain conquest?")
			),
			curry(perform_share_bulk_registration, domain_name, num_domains),
			callback
		);
	});
	
	define('show_share_transfer_modal', function(num_domains, callback) {
		return show_share_modal_base("Share Transfer", ("I just transfered " + num_domains + (num_domains.length > 1 ? " domains" : " domain") + " to Badger.com!"),
			div(
				p("Your domains are now enjoying themselves here at Badger.com! Your friends would think very highly of you knowing that you provide your domains with such a great home, wouldn't you like to tell them?")
			),
			curry(perform_share_transfer, num_domains),
			callback
		);
	});
	
};