with (Hasher.View('GoogleCalendar', 'Application')) { 

  register_domain_app({
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: 'images/apps/google_calendar.png',
    menu_item: { text: 'GOOGLE CALENDAR', href: '#domains/:domain/google_apps/calendar' },

    requires: {
      dns: [
        { type: 'cname', subdomain: 'calendar', content: 'ghs.google.com' }
      ]
    }
  });


  route('#domains/:domain/google_apps/calendar', function(domain) {
    render(
      h1("Google Calendar for ", domain),
      domain_app_settings_button('google_calendar', domain),
      p("If you haven't already, you'll need to ", a({ href: 'https://www.google.com/a/cpanel/domain/new', target: '_blank'}, 'setup Google Apps for Your Domain'), '.'),
      p("Once you've done that, you can head on over to ", a({ href: 'http://calendar.' + domain + '/', target: '_blank' }, 'calendar.' + domain), " and get started!")
    );
  });
  

  layout('dashboard');
}
