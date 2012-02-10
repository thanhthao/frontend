with (Hasher('Tumblr', 'DomainApps')) {

  register_domain_app({
    id: 'badger_tumblr',
    name: 'Tumblr',
    icon: 'images/apps/tumblr.png',
    menu_item: { text: 'TUMBLR', href: '#domains/:domain/tumblr' },
    requires: {
      dns: [
        { type: 'a', content: "66.6.44.4" },
        { type: 'cname', subdomain: 'www', content: /[a-zA-Z0-9_-]+\.tumblr\.com/, name: 'tumblr_app_url' }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div('You are about to install Tumblr',
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          'http://',
          text({ name: 'tumblr_app_url', placeholder: 'YOURBLOGNAME.tumblr.com', style: 'width: 250px' }),
          '/ ',
          input({ 'class': 'myButton', type: 'submit', value: 'Install Tumblr' })
        )
      );
    }
  });

  route('#domains/:domain/tumblr', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'TUMBLR FOR ' + domain)),
      domain_app_settings_button('badger_shopify', domain),

      div("Tumblr DNS settings have been installed into Badger DNS.",
          'Also check out ',
          a({ href: 'http://www.tumblr.com/docs/en/custom_domains', target: '_blank' }, 'Tumblr Custom Domains'), '.')
    );
  });


};