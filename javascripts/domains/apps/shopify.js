with (Hasher('Shopify', 'DomainApps')) {

  register_domain_app({
    id: 'badger_shopify',
    name: 'Shopify',
    icon: 'images/apps/shopify.png',
    menu_item: { text: 'SHOPIFY', href: '#domains/:domain/shopify' },
    requires: {
      dns: [
        { type: 'a', content: "204.93.213.45" },
        { type: 'cname', subdomain: 'www', content: /[a-zA-Z0-9_-]+\.myshopify\.com/, name: 'shopify_app_url' }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div(
        p("Shopify offers a complete ecommerce solution that allows you to create and run your own online store. List your products, customize your store's design, accept credit card orders, and ship your goods - all with a few clicks of the mouse. Shopify is easy to use and there's no software to download or maintain."),
        p('Install this app to point your domain to your shop on Shopify.'),
        show_required_dns(app, domain_obj),
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          'http://',
          text({ name: 'shopify_app_url', placeholder: 'YOURSHOPNAME.myshopify.com', style: 'width: 250px' }),
          '/ ',
          input({ 'class': 'myButton', type: 'submit', value: 'Install Shopify' })
        )
      );
    }
  });

  route('#domains/:domain/shopify', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'SHOPIFY FOR ' + domain)),
      domain_app_settings_button('badger_shopify', domain),

      div("Shopify is now installed!  If you haven't already, you'll need to add ["+ domain + "] and [www." + domain + "] in your Shopify Preferences (under \"DNS & Domains\")")
    );
  });


};