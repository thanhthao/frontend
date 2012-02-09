with (Hasher('Blogger', 'DomainApps')) {

  register_domain_app({
    id: 'badger_blogger',
    name: 'Blogger',
    icon: 'images/apps/blogger.png',
    menu_item: { text: 'BLOGGER', href: '#domains/:domain/blogger' },
    requires: {
      dns: [
        { type: 'a', content: "216.239.32.21" },
        { type: 'a', content: "216.239.34.21" },
        { type: 'a', content: "216.239.36.21" },
        { type: 'a', content: "216.239.38.21" },
        { type: 'cname', subdomain: 'www', content: 'ghs.google.com' }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div('You are about to install Blogger',
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          input({ 'class': 'myButton', type: 'submit', value: 'Install Blogger' })
        )
      );
    }
  });

  route('#domains/:domain/blogger', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'BLOGGER FOR ' + domain)),
      domain_app_settings_button('badger_shopify', domain),

      div("Blogger DNS settings have been installed into Badger DNS.",
          'Also check out ',
          a({ href: 'http://support.google.com/blogger/bin/static.py?hl=en&ts=1233381&page=ts.cs', target: '_blank' }, 'Blogger Custom Domains'), '.')
    );
  });


};