with (Hasher('GoogleCalendar', 'DomainApps')) {

  register_domain_app({
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: 'images/apps/google_calendar.png',
    menu_item: { text: 'GOOGLE CALENDAR', href: '#domains/:domain/google_apps/calendar' },

    requires: {
      dns: [
        { type: 'cname', subdomain: 'calendar', content: 'ghs.google.com' }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div(
        p("With Google's free online calendar, it's easy to keep track of life's important events all in one place. Install this app to integrate Google Calendar to your domain."),
        show_required_dns(app, domain_obj),
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          input({ 'class': 'myButton', type: 'submit', style: 'margin-top: 10px', value: 'Install Google Calendar' })
        )
      );
    }
  });


  route('#domains/:domain/google_apps/calendar', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, "Google Calendar for ", domain)),
      domain_app_settings_button('google_calendar', domain),
      p("If you haven't already, you'll need to ", a({ href: 'https://www.google.com/a/cpanel/domain/new', target: '_blank'}, 'setup Google Apps for Your Domain'), '.'),
      p("Once you've done that, you can head on over to ", a({ href: 'http://calendar.' + domain + '/', target: '_blank' }, 'calendar.' + domain), " and get started!")
    );
  });


 }
