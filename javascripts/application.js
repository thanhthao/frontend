with (Hasher.Controller('Application')) {
  initializer(function() {
    // local cache
    Badger.onLogin(BadgerCache.load);
    Badger.onLogout(BadgerCache.flush);
    BadgerCache.load();

    Badger.onLogout(function() {
      redirect_to('#');
    });
  });

  before_filter('redirect_to_root_unless_logged_in', function() {
    // if they have an access token (logged in), skip everything
    if (Badger.getAccessToken()) return;
    
    // hack until skip_before_filters works
    if (Hasher.Routes.getHash().match(/^#(request_invite|login|register\/.*)$/)) return;

    // got this far? send 'em away
    console.log("redirect_to_root_unless_logged_in");
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
        img({ src: '/images/badger-5.png' }),
        div({ id: 'main-minimal-box' }, 
          div({ id: 'content' }, yield)
        ),
        div({ style: 'clear: both'})
      )
    );
  });
  
  create_helper('error_message', function(response) {
    return div({ 'class': 'error-message' }, 
      div(
        response.data.message + ': ',
        response.data.errors.map(function(error) { return error.field; }).join(', ')
      )
    )
  });
  
  create_helper('domain_menu_item', function(domain) {
    return li({ id: 'domain-menu-item-' + domain.replace('.','-'), 'class': 'domain-menu-item' },
      a({ href: "#domains/" + domain }, domain.toUpperCase()),
      ul(
        li({ 'class': "email" }, a({ href: "#domains/" + domain + "/dns" }, 'DNS')),
        li({ 'class': "email" }, a({ href: "#domains/" + domain + "/whois" }, 'WHOIS'))
      )
    );
  });

  create_layout('dashboard', function(yield) {
    return div({ id: 'wrapper' },

      div({ id: 'header' },
        h1({ id: 'logo' }, a({ href: '#'}, 'badger.com')),
        div({ id: 'user-nav' }, a({ href: Badger.logout }, 'Logout'))
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
              a({ href: "#" }, 'MY DOMAINS'),
              ul(
                li({ 'class': "email"}, a({ href: "#domain-transfers" }, 'TRANSFERS'))
              )
            ),

            li({ id: 'nav-my-account' },
              a({ href: "#account" }, 'MY ACCOUNT'),
              ul(
                li({ 'class': "email"}, a({ href: "#account/profiles" }, 'WHOIS PROFILES')),
                li({ 'class': "website"}, a({ href: "#account/billing" }, 'BILLING')),
                li({ 'class': "email"}, a({ href: "#account/settings" }, 'SETTINGS'))
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
            li(a({ href: "#" }, 'Terms of Service'))
          )
        ),
        div({ 'class': "col" },
          h2('HELP AND SUPPORT'),
          ul(
            li(a({ href: "#" }, 'Contact Us')),
            li(a({ href: "#" }, 'Frequently Asked Questions')),
            li(a({ href: "#" }, 'Knowledge Center'))
          )
        ),
        div({ 'class': "col" },
          h2('CONTACT US'),
          ul({ 'class': 'social-network' },
            li(a({ href: "mailto:support@badger.com#" }, 'support@badger.com')),
            li(a({ href: "#", 'class': 'twitter' }, 'Twitter')),
            li(a({ href: "#", 'class': 'facebook' }, 'Facebook'))
          )
        ),
        div({ 'class': "col" },
          h2('ACCREDITATIONS'),
          img({ src: '/images/icann.png' })
        ),
        
        div({ style: 'clear: both'})
      )
    );
  });

}


