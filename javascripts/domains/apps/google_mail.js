with (Hasher('GoogleMail', 'DomainApps')) { 

  register_domain_app({
    id: 'google_mail',
    name: 'Google Mail',
    icon: 'images/apps/gmail.png',
    menu_item: { text: 'GOOGLE MAIL', href: '#domains/:domain/google_apps/gmail' },

    requires: {
      dns: [
        { type: 'cname', subdomain: 'mail', content: 'ghs.google.com' },
        { type: 'txt', content: 'v=spf1 include:_spf.google.com ~all' },
        { type: 'mx', priority: 1, content: "aspmx.l.google.com" },
        { type: 'mx', priority: 5, content: "alt1.aspmx.l.google.com" },
        { type: 'mx', priority: 5, content: "alt2.aspmx.l.google.com" },
        { type: 'mx', priority: 10, content: "aspmx2.googlemail.com" },
        { type: 'mx', priority: 10, content: "aspmx3.googlemail.com" },
        { type: 'mx', priority: 10, content: "aspmx4.googlemail.com" },
        { type: 'mx', priority: 10, content: "aspmx5.googlemail.com" }
      ]
    }
  });


  route('#domains/:domain/google_apps/gmail', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, "Google Mail for ", domain)),
      domain_app_settings_button('google_mail', domain),
      p("If you haven't already, you'll need to ", a({ href: 'https://www.google.com/a/cpanel/domain/new', target: '_blank'}, 'setup Google Apps for Your Domain'), '.'),
      p("Once you've done that, you can head on over to ", a({ href: 'http://mail.' + domain + '/', target: '_blank' }, 'mail.' + domain), " and get started!")
    );
  });
  

 }
