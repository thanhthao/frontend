with (Hasher('SiteTour', 'Application')) { (function() {
	create_helper('site_tour_0', function() {
		return div(
      h1("Welcome to Badger.com!"),
      p("We do things a little bit differently around here, so please take a moment to read the next few screens. It will be quick!"),
      div({ style: 'text-align: right' }, a({ href: action('Modal.show', 'SiteTour.site_tour_1'), 'class': 'myButton', value: "submit" }, "Next"))
		);
	});

	create_helper('site_tour_1', function() {
		return div(
      h1("Credits, not a Shopping Cart."),
      p(
        span("Instead of sending you through a shopping cart and making you checkout each time, we use Credits."),
        strong(" It costs 1 Credit to register, transfer or renew a domain for one year."),
        span(" If you don't have enough credits, you will be asked to purchase more:")
      ),
      div({ style: 'text-align: center' }, img({ src: 'images/site_tour_1.jpg', style: 'border: 1px solid #333' })),
      p(
        span("Credits cost"),
        strong(" between $10 and $15 depending on how many you buy"),
        span(" at once. If you know you will be registering and renewing lots of domains, buying Credits in bulk can save you a ton!")
      ),
      BadgerCache.cached_account_info.data.domain_credits > 0 ? p( {style: 'text-align: center;'},
        span("It looks like your invite code came with "),
        span(strong({style: 'color: red; size: 120%;'}, BadgerCache.cached_account_info.data.domain_credits + " free "
        + (BadgerCache.cached_account_info.data.domain_credits == 1 ? 'Credit' : 'Credits'))),
        span(", congrats!")) : "",
      div({ style: 'text-align: right' }, a({ href: action('Modal.show', 'SiteTour.site_tour_2'), 'class': 'myButton', value: "submit" }, "Next"))
		);
	});

  create_helper('site_tour_2', function() {
		return div(
      h1("To search, just start typing."),
      p("If you want to search for a new domain, just start typing in the search box and results will appear as you type:"),
      div({ style: 'text-align: center' }, img({ src: 'images/site_tour_2.jpg', style: 'border: 1px solid #333' })),
      p("Registering or renewing a domain costs 1 Credit per year."),
      div({ style: 'text-align: right' }, a({ href: action('Modal.show', 'SiteTour.site_tour_3'), 'class': 'myButton', value: "submit" }, "Next"))
		);
	});

  create_helper('site_tour_3', function() {
		return div(
      h1("Already have a domain? Transfer it!"),
      p(span("If you have a domain registered at another registrar, you can easily transfer it to "), a({href: "http://www.badger.com"}, "Badger.com"), span(".")),
      div({ style: 'text-align: center' }, img({ src: 'images/site_tour_3.jpg', style: 'border: 1px solid #333' })),
      p("Domain transfers cost 1 Credit and will extend your existing registration by one year."),
      div({ style: 'text-align: right' }, a({ href: action('Modal.show', 'SiteTour.site_tour_4'), 'class': 'myButton', value: "submit" }, "Next"))
		);
	});

  create_helper('site_tour_4', function() {
		return div(
      h1("Please give us feedback!"),
      p(span("Feedback from people like you will make "), a({href: "http://www.badger.com"},"Badger.com"), span(" a better place, so please don't hold back!")),
      p(span("Feel free to email us: "), a({href: "mailto:support@badger.com#"}, "support@badger.com"), span(".")),
      p(span("We hope you enjoy "), a({href: "http://www.badger.com"},"Badger.com"), span("!")),
      div({ style: 'text-align: right' }, a({ href: action('Modal.hide'), 'class': 'myButton', value: "submit" }, "Finish"))
		);
	});
})(); }
