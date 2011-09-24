with (Hasher.Controller('Application')) {
  initializer(function() {
    Badger.onLogout(function() {
      redirect_to('#');
    });
  });

  create_action('logout', function() {
    Badger.logout();
    redirect_to('#');
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
      
      // $('#form-search')[request_uri == '#search' ? 'addClass' : 'removeClass']('active');
      // $('#nav-my-domains')[request_uri == '#' ? 'addClass' : 'removeClass']('active');
      // $('#nav-my-account')[request_uri == '#my-account' ? 'addClass' : 'removeClass']('active');
      // $('#nav-help-and-support')[request_uri == '#help-and-support' ? 'addClass' : 'removeClass']('active');
      
      // if (request_uri.indexOf('#domains/') == 0) {
      //   $('#menu').append(document.createTextNode('test'))
      // }
    }
  });
}

with (Hasher.View('Application')) { (function() {

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

  create_layout('dashboard', function(yield) {
    return div({ id: 'wrapper' },

      div({ id: 'header' },
        h1({ id: 'logo' }, a({ href: '#'}, 'badger.com')),
        div({ id: 'user-nav' }, a({ href: action('logout') }, 'Logout'))
      ),

      div({ id: 'main' },
        div({ id: "sidebar" }, 
          form({ id: "form-search", action: "#" },
            input({ type: 'text', value: '', events: { 
              focus: function() { 
                if (Hasher.Routes.getHash() != '#search') Hasher.Routes.setHash('#search');
              },
              keyup: function(event) {
                var _this = this;
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(function() {
                  Badger.domainSearch(_this.value, function(resp) {
                    console.log(resp);
                    $('#search-results').html('' + resp.data.join('<br/>'));
                  });
                }, 200);
              }
            }})
          ),

          ul({ id: 'menu' },
            li({ id: 'nav-my-domains' },
              a({ href: "#" }, 'MY DOMAINS')
            ),

            // li(
            //   a({ href: "#" }, 'WKONKEL.NET'),
            //   ul(
            //     li(a({ 'class': "website", href: "#" }, 'WEBSITE FORWARDING')),
            //     li(a({ 'class': "email", href: "#" }, 'EMAIL FORWARDING')),
            //     li(a({ 'class': "dns", href: "#" }, 'DNS SETTINGS')),
            //     li(a({ 'class': "analytics", href: "#" }, 'ANALYTICS'))
            //   )
            // ),

            li({ id: 'nav-my-account' },
              a({ href: "#account" }, 'MY ACCOUNT'),
              ul(
                li({ 'class': "email"}, a({ href: "#account/settings" }, 'SETTINGS')),
                li({ 'class': "email"}, a({ href: "#account/profiles" }, 'PUBLIC PROFILES')),
                li({ 'class': "website"}, a({ href: "#account/billing" }, 'BILLING'))
              )
            ),

            li({ id: 'nav-help-and-support' },
              a({ href: "#help-and-support" }, 'HELP & SUPPORT'),
              ul(
                li({ 'class': "website" }, a({ href: "#knowledge-base" }, 'KNOWLEDGE BASE')),
                li({ 'class': "email" }, a({ href: "#tickets" }, 'SUPPORT TICKETS'))
              )
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
          h2('BADGES'),
          img({ src: '/images/icann.png' })
        ),
        
        div({ style: 'clear: both'})
      )

    );
  });



})(); }


