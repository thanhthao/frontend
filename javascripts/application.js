with (Hasher.Controller('Application')) {
  initializer(function() {
    // local cache
    Badger.onLogin(BadgerCache.load);
    Badger.onLogout(BadgerCache.flush);
    BadgerCache.load();

    Badger.onLogout(function() {
      var path = document.location.href.split('#')[0];
      if (document.location.href == path) document.location.reload();
      else document.location.href = path;
    });
  });

  before_filter('redirect_to_root_unless_logged_in', function() {
    // if they have an access token (logged in), skip everything
    if (Badger.getAccessToken()) return;
    
    // hack until skip_before_filters works
    if (Hasher.Routes.getHash().match(/^#(request_invite|login|register\/.*)$/)) return;

    // got this far? send 'em away
    redirect_to('#request_invite');
  });
  
  after_filter('update_sidebar_with_active_class', function() {
    if ($('#sidebar')) {
      var request_uri = Hasher.Routes.getHash();

      var parts = request_uri.split('/');
      if (parts[0] == '#domains') {
        var domain = parts[1].toLowerCase();
        if ($('#menu #domain-menu-item-' + domain.replace('.','-')).length == 0) {
          $('#menu .domain-menu-item').slice(4).remove();
          $('#nav-help-and-support').after(helper('domain_menu_item', domain));
        }
      }
      
      // select active link and expand parent
      $('#sidebar ul').removeClass('expanded');
      $('#sidebar a').removeClass('active');
      if (request_uri == '#search') {
        $('#form-search').addClass('active');
      } else {
        $('#form-search').removeClass('active');
        var links = $('#sidebar a[href="' + request_uri + '"]').addClass('active');
        var parent_li = links.parent();
        if (!parent_li.parent().is('#menu')) parent_li = parent_li.parent().parent();
        parent_li.find('ul').addClass('expanded');
      }

    }
  });
}

with (Hasher.View('Application')) {

  create_layout('signup', function(yield) {
    return div({ id: 'wrapper' },
      div({ id: 'user-nav' }, a({ href: '#login' }, 'Login')),

      div({ id: 'main-minimal' },
        img({ src: 'images/badger-5.png' }),
        div({ id: 'main-minimal-box' }, 
          div({ id: 'content' }, yield)
        ),
        div({ style: 'clear: both'})
      )
    );
  });
  
  create_helper('error_message', function(response) {
    console.log("ERRRRRROR")
    console.log(response)
    return div({ 'class': 'error-message' }, 
			div(
				response.data.message,
				!response.data.errors ? "" : ": " + response.data.errors.map(function(error) { return error.reason ? error.reason : error.field.replace(/_/g, ' ').capitalize_first() + " " + error.code.replace(/_/g, ' ');}).join(', ')
			)
    )
  });

  create_helper('success_message', function(response) {
    return div({ 'class': 'success-message' }, 
			div( response.data.message || "Success!" )
    )
  });
  
  create_helper('domain_menu_item', function(domain) {
    return li({ id: 'domain-menu-item-' + domain.replace('.','-'), 'class': 'domain-menu-item' },
      a({ href: "#domains/" + domain }, domain.toUpperCase()),
      ul(
        li({ 'class': "email" }, a({ href: "#domains/" + domain + "/dns" }, 'DNS')),
        li({ 'class': "email" }, a({ href: "#domains/" + domain + "/whois" }, 'WHOIS & PRIVACY'))
        //li({ 'class': "email" }, a({ href: "#domains/" + domain + "/whois" }, 'TRANSFER'))
      )
    );
  });
  
  create_helper('update_credits', function(refresh) {
    if (refresh) BadgerCache.flush('account_info');
    BadgerCache.getAccountInfo(function(response) {
      $('#user_nav_credits').html(response.data.domain_credits == 1 ? '1 Credit' : response.data.domain_credits + ' Credits');
    });
  });
  
  create_helper('user_nav', function() {
    var user_nav = div({ id: 'user-nav' }, 
      a({ href: Badger.logout }, 'Logout')
    );

    BadgerCache.getAccountInfo(function(response) {
      //$(user_nav).prepend(span(a({ href: '#account/settings'}, response.data.name)));
      $(user_nav).prepend(span(response.data.name));
      $(user_nav).prepend(span(a({ href: '#account/billing', id: 'user_nav_credits' }, 'Credits')));
      helper('update_credits');
    });

    return user_nav;
  });
  
  create_helper('country_options', function(selected_country) {
    countries = [["AF", "Afghanistan"],["AX", "Åland"],["AL", "Albania"],["DZ", "Algeria"],["AS", "American Samoa"],["AD", "Andorra"],["AO", "Angola"],["AI", "Anguilla"],["AQ", "Antarctica"],["AG", "Antigua and Barbuda"],["AR", "Argentina"],["AM", "Armenia"],["AW", "Aruba"],["AU", "Australia"],["AT", "Austria"],["AZ", "Azerbaijan"],["BS", "Bahamas"],["BH", "Bahrain"],["BD", "Bangladesh"],["BB", "Barbados"],["BY", "Belarus"],["BE", "Belgium"],["BZ", "Belize"],["BJ", "Benin"],["BM", "Bermuda"],["BT", "Bhutan"],["BO", "Bolivia"],["BA", "Bosnia and Herzegovina"],["BW", "Botswana"],["BV", "Bouvet Island"],["BR", "Brazil"],["IO", "British Indian Ocean Territory"],["BN", "Brunei Darussalam"],["BG", "Bulgaria"],["BF", "Burkina Faso"],["BI", "Burundi"],["KH", "Cambodia"],["CM", "Cameroon"],["CA", "Canada"],["CV", "Cape Verde"],["KY", "Cayman Islands"],["CF", "Central African Republic"],["TD", "Chad"],["CL", "Chile"],["CN", "China"],["CX", "Christmas Island"],["CC", "Cocos (Keeling) Islands"],["CO", "Colombia"],["KM", "Comoros"],["CG", "Congo (Brazzaville)"],["CD", "Congo (Kinshasa)"],["CK", "Cook Islands"],["CR", "Costa Rica"],["CI", "Côte d'Ivoire"],["HR", "Croatia"],["CU", "Cuba"],["CY", "Cyprus"],["CZ", "Czech Republic"],["DK", "Denmark"],["DJ", "Djibouti"],["DM", "Dominica"],["DO", "Dominican Republic"],["EC", "Ecuador"],["EG", "Egypt"],["SV", "El Salvador"],["GQ", "Equatorial Guinea"],["ER", "Eritrea"],["EE", "Estonia"],["ET", "Ethiopia"],["FK", "Falkland Islands"],["FO", "Faroe Islands"],["FJ", "Fiji"],["FI", "Finland"],["FR", "France"],["GF", "French Guiana"],["PF", "French Polynesia"],["TF", "French Southern Lands"],["GA", "Gabon"],["GM", "Gambia"],["GE", "Georgia"],["DE", "Germany"],["GH", "Ghana"],["GI", "Gibraltar"],["GR", "Greece"],["GL", "Greenland"],["GD", "Grenada"],["GP", "Guadeloupe"],["GU", "Guam"],["GT", "Guatemala"],["GG", "Guernsey"],["GN", "Guinea"],["GW", "Guinea-Bissau"],["GY", "Guyana"],["HT", "Haiti"],["HM", "Heard and McDonald Islands"],["HN", "Honduras"],["HK", "Hong Kong"],["HU", "Hungary"],["IS", "Iceland"],["IN", "India"],["ID", "Indonesia"],["IR", "Iran"],["IQ", "Iraq"],["IE", "Ireland"],["IM", "Isle of Man"],["IL", "Israel"],["IT", "Italy"],["JM", "Jamaica"],["JP", "Japan"],["JE", "Jersey"],["JO", "Jordan"],["KZ", "Kazakhstan"],["KE", "Kenya"],["KI", "Kiribati"],["KP", "Korea, North"],["KR", "Korea, South"],["KW", "Kuwait"],["KG", "Kyrgyzstan"],["LA", "Laos"],["LV", "Latvia"],["LB", "Lebanon"],["LS", "Lesotho"],["LR", "Liberia"],["LY", "Libya"],["LI", "Liechtenstein"],["LT", "Lithuania"],["LU", "Luxembourg"],["MO", "Macau"],["MK", "Macedonia"],["MG", "Madagascar"],["MW", "Malawi"],["MY", "Malaysia"],["MV", "Maldives"],["ML", "Mali"],["MT", "Malta"],["MH", "Marshall Islands"],["MQ", "Martinique"],["MR", "Mauritania"],["MU", "Mauritius"],["YT", "Mayotte"],["MX", "Mexico"],["FM", "Micronesia"],["MD", "Moldova"],["MC", "Monaco"],["MN", "Mongolia"],["ME", "Montenegro"],["MS", "Montserrat"],["MA", "Morocco"],["MZ", "Mozambique"],["MM", "Myanmar"],["NA", "Namibia"],["NR", "Nauru"],["NP", "Nepal"],["NL", "Netherlands"],["AN", "Netherlands Antilles"],["NC", "New Caledonia"],["NZ", "New Zealand"],["NI", "Nicaragua"],["NE", "Niger"],["NG", "Nigeria"],["NU", "Niue"],["NF", "Norfolk Island"],["MP", "Northern Mariana Islands"],["NO", "Norway"],["OM", "Oman"],["PK", "Pakistan"],["PW", "Palau"],["PS", "Palestine"],["PA", "Panama"],["PG", "Papua New Guinea"],["PY", "Paraguay"],["PE", "Peru"],["PH", "Philippines"],["PN", "Pitcairn"],["PL", "Poland"],["PT", "Portugal"],["PR", "Puerto Rico"],["QA", "Qatar"],["RE", "Reunion"],["RO", "Romania"],["RU", "Russian Federation"],["RW", "Rwanda"],["BL", "Saint Barthélemy"],["SH", "Saint Helena"],["KN", "Saint Kitts and Nevis"],["LC", "Saint Lucia"],["MF", "Saint Martin (French part)"],["PM", "Saint Pierre and Miquelon"],["VC", "Saint Vincent and the Grenadines"],["WS", "Samoa"],["SM", "San Marino"],["ST", "Sao Tome and Principe"],["SA", "Saudi Arabia"],["SN", "Senegal"],["RS", "Serbia"],["SC", "Seychelles"],["SL", "Sierra Leone"],["SG", "Singapore"],["SK", "Slovakia"],["SI", "Slovenia"],["SB", "Solomon Islands"],["SO", "Somalia"],["ZA", "South Africa"],["GS", "South Georgia and South Sandwich Islands"],["ES", "Spain"],["LK", "Sri Lanka"],["SD", "Sudan"],["SR", "Suriname"],["SJ", "Svalbard and Jan Mayen Islands"],["SZ", "Swaziland"],["SE", "Sweden"],["CH", "Switzerland"],["SY", "Syria"],["TW", "Taiwan"],["TJ", "Tajikistan"],["TZ", "Tanzania"],["TH", "Thailand"],["TL", "Timor-Leste"],["TG", "Togo"],["TK", "Tokelau"],["TO", "Tonga"],["TT", "Trinidad and Tobago"],["TN", "Tunisia"],["TR", "Turkey"],["TM", "Turkmenistan"],["TC", "Turks and Caicos Islands"],["TV", "Tuvalu"],["UG", "Uganda"],["UA", "Ukraine"],["AE", "United Arab Emirates"],["GB", "United Kingdom"],["UM", "United States Minor Outlying Islands"],["US", "United States of America"],["UY", "Uruguay"],["UZ", "Uzbekistan"],["VU", "Vanuatu"],["VA", "Vatican City"],["VE", "Venezuela"],["VN", "Vietnam"],["VG", "Virgin Islands, British"],["VI", "Virgin Islands, U.S."],["WF", "Wallis and Futuna Islands"],["EH", "Western Sahara"],["YE", "Yemen"],["ZM", "Zambia"],["ZW", "Zimbabwe"]];
    return [
      option({ value: "AU" }, "Australia"),
      option({ value: "CA" }, "Canada"),
      option({ value: "GB" }, "United Kingdom"),
      option({ value: "US" }, "United States of America"),
      option({ disabled: 'disabled' },''),

      countries.map(function(country) {
        var opts = { value: country[0] };
        if (selected_country == country[0]) opts.selected = 'selected';
        return option(opts, country[1]);
      })
    ];
  });

  create_layout('dashboard', function(yield) {

    return div({ id: 'wrapper' },

      div({ id: 'header' },
        h1({ id: 'logo' }, a({ href: '#'}, 'badger.com')),
        helper('user_nav')
      ),

      div({ id: 'main' },
        div({ id: "sidebar" }, 
          form({ id: "form-search", action: action('Search.search_box_changed') },
            input({ id: 'form-search-input', type: 'text', value: '', placeholder: 'Start typing...', events: { 
              focus: action('Search.search_box_changed'),
              keyup: action('Search.search_box_changed'),
              keypress: function(e) {
                if (/[^a-zA-Z0-9\-]/.test(String.fromCharCode(e.charCode))) Hasher.Event.stop(e);
              }
            }})
          ),

          ul({ id: 'menu' },
            li({ id: 'nav-my-domains' },
              a({ href: "#" }, 'MY DOMAINS')
              // ul(
              //   li({ 'class': "email"}, a({ href: "#domain-transfers" }, 'TRANSFERS'))
              // )
            ),

            li({ id: 'nav-my-account' },
              a({ href: "#account" }, 'MY ACCOUNT'),
              ul(
                li({ 'class': "email"}, a({ href: "#account/profiles" }, 'WHOIS PROFILES')),
                li({ 'class': "website"}, a({ href: "#account/billing" }, 'CREDITS & BILLING')),
                li({ 'class': "website"}, a({ href: "#account/settings" }, 'SETTINGS'))
              )
            ),

            li({ id: 'nav-help-and-support' },
              a({ href: "#help-and-support" }, 'HELP & SUPPORT')
              // ul(
              //   li({ 'class': "website" }, a({ href: "#knowledge-base" }, 'KNOWLEDGE BASE')),
              //   li({ 'class': "email" }, a({ href: "#tickets" }, 'SUPPORT TICKETS'))
              // )
            )

          )
        ),

        div({ 'id': 'content' },
          yield
        ),
        
        div({ style: 'clear: both' })
      ),

      div({ id: 'footer' },
        div({ 'class': "col" },
          h2('COMPANY'),
          ul(
            li(a({ href: "#" }, 'Blog')),
            li(a({ href: "#" }, 'Jobs')),
            li(a({ href: "#terms_of_service" }, 'Terms of Service'))
          )
        ),
        div({ 'class': "col" },
          h2('HELP AND SUPPORT'),
          ul(
            li(a({ href: "#contact_us" }, 'Contact Us')),
            li(a({ href: "#" }, 'Frequently Asked Questions')),
            li(a({ href: "#" }, 'Knowledge Center'))
          )
        ),
        div({ 'class': "col" },
          h2('CONTACT US'),
          ul(
            li(a({ href: "mailto:support@badger.com#" }, 'support@badger.com')),
            li('415-787-5050'),
            li(a({ href: "https://twitter.com/BadgerDotCom", target: "_blank" }, 'Twitter'), ' / ', a({ href: "https://www.facebook.com/BadgerDotCom", target: "_blank" }, 'Facebook'))
          )
        ),
        div({ 'class': "col" },
          h2('ACCREDITATIONS'),
          img({ src: 'images/icann.png' })
        ),
        
        div({ style: 'clear: both'})
      )
    );
  });

}

String.prototype.capitalize_all = function() {
	var words = [];
	this.split(' ').forEach(function(word) {
		words.push( word.charAt(0).toUpperCase() + word.slice(1) );
	});
	return words.join(" ");
}

String.prototype.capitalize_first = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
