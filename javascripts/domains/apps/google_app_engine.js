with (Hasher('GoogleAppEngine', 'DomainApps')) {

  register_domain_app({
    id: 'badger_google_app_engine',
    name: 'Google App Engine',
    icon: 'images/apps/appengine.png',
    menu_item: { text: 'GOOGLE APP ENGINE', href: '#domains/:domain/google_app_engine' },
    requires: {
      dns: [
        { type: 'cname', subdomain: 'www', content: 'ghs.google.com' }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div('You are about to install Google App Engine',
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          input({ 'class': 'myButton', type: 'submit', value: 'Install Google App Engine' })
        )
      );
    }
  });

  route('#domains/:domain/google_app_engine', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'GOOGLE APP ENGINE FOR ' + domain)),
      domain_app_settings_button('badger_shopify', domain),

      div("Google App Engine DNS settings have been installed into Badger DNS.",
          'Also check out ',
          a({ href: 'http://code.google.com/appengine/docs/domain.html', target: '_blank' }, 'Google App Engine Custom Domains'), '.')
    );
  });
};
