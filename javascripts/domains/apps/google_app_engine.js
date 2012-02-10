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
      return div(
        p('Google App Engine enables you to build and host web apps on the same systems that power Google applications. App Engine offers fast development and deployment; simple administration, with no need to worry about hardware, patches or backups; and effortless scalability.'),
        p('Install this app to point your domain to your Google App.'),
        show_required_dns(app, domain_obj),
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          input({ 'class': 'myButton', type: 'submit', value: 'Install Google App Engine' })
        )
      );
    }
  });

  route('#domains/:domain/google_app_engine', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'GOOGLE APP ENGINE FOR ' + domain)),
      domain_app_settings_button('badger_google_app_engine', domain),

      div("Google App Engine DNS settings have been installed into Badger DNS.",
          'Also check out ',
          a({ href: 'http://code.google.com/appengine/docs/domain.html', target: '_blank' }, 'Google App Engine Custom Domains'), '.')
    );
  });
};
