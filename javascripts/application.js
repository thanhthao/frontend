with (Hasher.Controller('Application')) {
  initializer(function() {
    console.log('application.js initializer');
  });
  
  route({
    '#': 'signup',
    '#search': 'search'
  });
  
  // create_action('signup', function() {
  // });
  
  layout('minimal');
}

with (Hasher.View('Application')) { (function() {

  create_layout('minimal', function(yield) {
    return div({ id: 'wrapper' },
      div({ 'class': 'w1' },
        div({ 'class': 'w2' },
          yield
        )
      )
    );
  });



  create_layout('default', function(yield) {
    return div({ id: 'wrapper' },
      div({ 'class': 'w1' },
        div({ 'class': 'w2' },
          div({ 'id': 'header' },
            form({ 'class': 'form', 'action': '#' }, 'login'),
            div({ 'class': 'logo' }, a({ href: '#' }, 'BADGER'))
          ),
          
          div({ 'id': 'main' },
            div({ 'class': 'holder' },
              div({ 'class': 'frame' },
                div({ 'id': 'content' },
                  yield
                ),
                
                div({ id: "sidebar" }, 
                  form({ 'class': "form-search", action: "#" },
                    input({ type: 'text', value: '', events: { focus: function() { Hasher.Routes.setHash('#search'); }  } })
                  ),

                  ul({ 'class': 'menu' },
                    li({ 'class': "active" }, 
                      a({ href: "#" }, 'MY DOMAINS')
                    ),
                    li(
                      a({ href: "#" }, 'WKONKEL.NET'),
                      ul(
                        li(a({ 'class': "website", href: "#" }, 'WEBSITE FORWARDING')),
                        li(a({ 'class': "email", href: "#" }, 'EMAIL FORWARDING')),
                        li(a({ 'class': "dns", href: "#" }, 'DNS SETTINGS')),
                        li(a({ 'class': "analytics", href: "#" }, 'ANALYTICS'))
                      )
                    ),

                    li(
                      a({ href: "#" }, 'MY ACCOUNT')
                    ),

                    li(
                      a({ href: "#" }, 'HELP & SUPPORT')
                    )
                    
                  )
                )
              )
            )
          )
        )
      ),
      
      div({ id: "footer" },
        div({ 'class': "footer-holder" },
          div({ 'class': "box" },
            div({ 'class': "holder" },
              div({ 'class': "frame" },
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
                )
              )
            )
          )
        )
      )
    );
  });

  create_view('search', function() {
    return div(
      h1('SEARCH RESULTS')
    );
  });
  
  create_view('signup', function() {
    return div({ style: 'margin: 200px 0'},
      img({ style: 'float: left; padding-right: 30px', src: '/frontend/images/badger-5.png' }),
      div({ style: 'float: left; width: 600px; background: white; padding: 20px; border-radius: 5px' }, 
        div({ style: 'font-size: 32px; color: #333; line-height: 36px; font-weight: bold' }, 'Thanks for checking out Badger.com!'),
        div({ style: 'font-size: 20px; color: #333; line-height: 24px; margin-top: 20px' }, "We're not quite ready yet but if you'd like an invite when we are, please enter your email address:"),
        div({ style: 'margin: 20px 0 10px 0; text-align: center' },
          input({ type: 'text', style: 'margin-top: 4px; padding: 5px; font-size: 20px; border: 1px solid #aaa; border-radius: 3px' }),
          input({ type: 'submit', value: 'Request Invite', 'class': "myButton" })
        )
      )
    );
  });
  
})(); }
