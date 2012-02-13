with (Hasher('Tumblr', 'DomainApps')) {

  register_domain_app({
    id: 'badger_tumblr',
    name: 'Tumblr',
    icon: 'images/apps/tumblr.png',
    menu_item: { text: 'TUMBLR', href: '#domains/:domain/tumblr' },
    requires: {
      dns: [
        { type: 'a', content: "66.6.44.4" },
        { type: 'cname', subdomain: 'www', content: "domains.tumblr.com" }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div(
        p("A feature rich and free blog hosting platform offering professional and fully customizable templates, bookmarklets, photos, mobile apps, and social network."),
        p('Install this app to point your domain to your Tumblr site.'),
        show_required_dns(app, domain_obj),
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          input({ 'class': 'myButton', type: 'submit', value: 'Install Tumblr' })
        )
      );
    }
  });

  route('#domains/:domain/tumblr', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'TUMBLR FOR ' + domain)),
      domain_app_settings_button('badger_tumblr', domain),

      div("Tumblr DNS settings have been installed into Badger DNS.",
          'Also check out ',
          a({ href: 'http://www.tumblr.com/docs/en/custom_domains', target: '_blank' }, 'Tumblr Custom Domains'), '.')
    );
  });


};