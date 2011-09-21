with (Hasher.Controller('Application')) {
  initializer(function() {
  });

  create_action('logout', function() {
    Badger.logout();
    redirect_to('#');
  });
  
  before_filter('redirect_to_root_unless_logged_in', function() {
    // if they have an access token (logged in), skip everything
    if (Badger.getAccessToken()) return;
    
    // hack until skip_before_filters works
    if (Hasher.Routes.getHash().match(/^#(|request_invite|login|register\/.*)$/)) return;

    // got this far? send 'em away
    console.log("redirect_to_root_unless_logged_in");
    redirect_to('#');
  });
  
  after_filter('update_sidebar_with_active_class', function() {
    if ($('#sidebar')) {
      var request_uri = Hasher.Routes.getHash();

      $('#form-search')[request_uri == '#search' ? 'addClass' : 'removeClass']('active');
      $('#nav-my-domains')[request_uri == '#' ? 'addClass' : 'removeClass']('active');
      $('#nav-my-account')[request_uri == '#my-account' ? 'addClass' : 'removeClass']('active');
      $('#nav-help-and-support')[request_uri == '#help-and-support' ? 'addClass' : 'removeClass']('active');
    }
  });
}

with (Hasher.View('Application')) { (function() {

  create_layout('signup', function(yield) {
    return div({ id: 'wrapper' },
      div({ id: 'user-nav' }, a({ href: '#login' }, 'Login')),

      div({ id: 'main-minimal' },
        img({ src: '/frontend/images/badger-5.png' }),
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
        div({ id: 'user-nav' }, span('wkonkel@gmail.com'), a({ href: action('logout') }, 'Logout'))
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
              a({ href: "#my-account" }, 'MY ACCOUNT'),
              ul(
                li(a({ 'class': "email", href: "#" }, 'SETTINGS')),
                li(a({ 'class': "email", href: "#" }, 'PUBLIC PROFILES')),
                li(a({ 'class': "website", href: "#" }, 'BILLING'))
              )
            ),

            li({ id: 'nav-help-and-support' },
              a({ href: "#help-and-support" }, 'HELP & SUPPORT'),
              ul(
                li(a({ 'class': "website", href: "#" }, 'KNOWLEDGE BASE')),
                li(a({ 'class': "email", href: "#" }, 'SUPPORT TICKETS'))
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
          ul(
            li(a({ href: "mailto:support@badger.com#" }, 'support@badger.com')),
            li(a({ href: "#" }, '1-855-HI-RHINO'))
          )
        ),
        div({ 'class': "col" },
          h2('CONNECT'),
          ul({ 'class': 'social-network' },
            li(a({ href: "#", 'class': 'twitter' }, 'Twitter')),
            li(a({ href: "#", 'class': 'facebook' }, 'Facebook'))
          )
        ),
        
        div({ style: 'clear: both'})
      )


      // div({ 'class': 'w1' },
      // 
      //   div({ 'class': 'w2' },
      //     
      //     div({ 'id': 'main' },
      //       div({ 'class': 'holder' },
      //         div({ 'class': 'frame' },
      //           div({ 'id': 'content' },
      //             yield
      //           ),
      //           
      //           div({ id: "sidebar" }, 
      //             form({ 'class': "form-search", action: "#" },
      //               input({ type: 'text', value: '', events: { focus: function() { Hasher.Routes.setHash('#search'); }  } })
      //             ),
      // 
      //             ul({ 'class': 'menu' },
      //               li({ 'class': "active" }, 
      //                 a({ href: "#" }, 'MY DOMAINS')
      //               ),
      //               li(
      //                 a({ href: "#" }, 'WKONKEL.NET'),
      //                 ul(
      //                   li(a({ 'class': "website", href: "#" }, 'WEBSITE FORWARDING')),
      //                   li(a({ 'class': "email", href: "#" }, 'EMAIL FORWARDING')),
      //                   li(a({ 'class': "dns", href: "#" }, 'DNS SETTINGS')),
      //                   li(a({ 'class': "analytics", href: "#" }, 'ANALYTICS'))
      //                 )
      //               ),
      // 
      //               li(
      //                 a({ href: "#" }, 'MY ACCOUNT')
      //               ),
      // 
      //               li(
      //                 a({ href: "#" }, 'HELP & SUPPORT')
      //               )
      //               
      //             )
      //           )
      //         )
      //       )
      //     )
      //   )
      // )

    );
  });



})(); }

