with (Hasher('FlavorsMe', 'DomainApps')) {

  register_domain_app({
    id: 'badger_flavorsme',
    name: 'FlavorsMe',
    icon: 'images/apps/flavorsme.png',
    menu_item: { text: 'FLAVORS ME', href: '#domains/:domain/flavorsme' },
    requires: {
      dns: [
        { type: 'a', content: "184.73.237.244" },
        { type: 'a', subdomain: "www", content: "184.73.237.244" }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div('You are about to install Flavors Me',
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          input({ 'class': 'myButton', type: 'submit', value: 'Install Flavors Me' })
        )
      );
    }
  });

  route('#domains/:domain/flavorsme', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'FLAVORS ME FOR ' + domain)),
      domain_app_settings_button('badger_flavorsme', domain),

      div("Flavors Me DNS settings have been installed into Badger DNS.",
          'Also check out ',
          a({ href: 'http://help.flavors.me/kb/settings/setting-up-your-custom-domain-name', target: '_blank' }, 'Flavors Me Custom Domains'), '.')
    );
  });


};