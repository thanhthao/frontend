with (Hasher('GoogleDocs', 'DomainApps')) { 

  register_domain_app({
    id: 'google_docs',
    name: 'Google Docs',
    icon: 'images/apps/googledocs.png',
    menu_item: { text: 'GOOGLE DOCS', href: '#domains/:domain/google_apps/docs' },

    requires: {
      dns: [
        { type: 'cname', subdomain: 'docs', content: 'ghs.google.com' }
      ]
    }
  });


  route('#domains/:domain/google_apps/docs', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'header-with-right-btn long-domain-name' }, "Google Docs for ", domain)),
      domain_app_settings_button('google_docs', domain),
      p("If you haven't already, you'll need to ", a({ href: 'https://www.google.com/a/cpanel/domain/new', target: '_blank'}, 'setup Google Apps for Your Domain'), '.'),
      p("Once you've done that, you can head on over to ", a({ href: 'http://docs.' + domain + '/', target: '_blank' }, 'docs.' + domain), " and get started!")
    );
  });
  

 }
