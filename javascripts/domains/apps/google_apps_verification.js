with (Hasher('GoogleAppsVerification', 'DomainApps')) {

  register_domain_app({
    id: 'badger_google_apps_verification',
    name: 'Google Apps Verification',
    icon: 'images/apps/googleapps.png',
    menu_item: { text: 'GOOGLE APPS VERIFICATION', href: '#domains/:domain/google_verification' },
    requires: {
      dns: [
        { type: 'txt', content: /google-site-verification=.*/, name: 'google_app_verification_code' }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div(
        p('Please copy and paste the DNS configuration of TXT record for your app here:'),
        show_required_dns(app, domain_obj),
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          text({ name: 'google_app_verification_code', placeholder: 'Your TXT Record Content', style: 'width: 250px' }),
          input({ 'class': 'myButton', type: 'submit', value: 'Install Google Apps Verification' })
        )
      );
    }
  });

  route('#domains/:domain/google_verification', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'GOOGLE APPS VERIFICATION FOR ' + domain)),
      domain_app_settings_button('badger_google_apps_verification', domain),

      div("The CNAME is currently installed, you can complete the verification ",
          a({ href: 'https://www.google.com/webmasters/tools/home', target: '_blank' }, 'here'),
          ". When you are done verifying this URL with google, you can remove this app."
      )
    );
  });


};