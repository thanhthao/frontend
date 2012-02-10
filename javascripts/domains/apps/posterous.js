with (Hasher('Posterous', 'DomainApps')) {

  register_domain_app({
    id: 'badger_posterous',
    name: 'Posterous',
    icon: 'images/apps/posterous.png',
    menu_item: { text: 'POSTEROUS', href: '#domains/:domain/posterous' },
    requires: {
      dns: [
        { type: 'a', content: "184.106.20.102" }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div('You are about to install Posterous',
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          input({ 'class': 'myButton', type: 'submit', value: 'Install Posterous' })
        )
      );
    }
  });

  route('#domains/:domain/posterous', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'POSTEROUS FOR ' + domain)),
      domain_app_settings_button('badger_posterous', domain),

      div("Posterous DNS settings have been installed into Badger DNS.",
          'Also check out ',
          a({ href: 'http://posterous.uservoice.com/knowledgebase/articles/36303-setting-up-posterous-spaces-with-a-third-party-reg', target: '_blank' }, 'Posterous Custom Domains'), '.')
    );
  });


};