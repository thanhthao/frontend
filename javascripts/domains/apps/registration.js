with (Hasher('Registration ','DomainApps')) {

  register_domain_app({
    id: 'badger_registration',
    icon: function(domain_obj) {
      switch (domain_obj.current_registrar) {
        case 'godaddy': return "images/apps/godaddy.png";
        case 'enom': return "images/apps/enom.png";
        case '1and1': return "images/apps/1and1.png";
        default: return;
      }
    },
    name: function(domain_obj) {
      switch (domain_obj.current_registrar) {
        case 'godaddy': return "GoDaddy Registration";
        case 'enom': return "eNom Registration";
        case '1and1': return "1&1 Registration";
        default: return 'Registration';
      }
    },
    menu_item: { text: 'REGISTRATION', href: '#domains/:domain/registration' },
    requires: {}
  });

  route('#domains/:domain/registration', function(domain) {
    render(
      h1({ 'class': 'long-domain-name' }, domain, ' Registration'),
      domain_data_block(domain)
    );
  });

  define('domain_data_block', function(domain) {
    var elem = dl({ 'class': 'fancy-dl' });

    Badger.getDomain(domain, function(response) {
      var domain = response.data;
      render({ target: elem },
        dt('Status: '), dd(domain.status), br(),
        dt('Created: '), dd(new Date(Date.parse(domain.created_at)).toDateString()), br(),
        dt('Expires:'), dd(new Date(Date.parse(domain.expires_on)).toDateString()), br()
        // dt('Registered:'), dd(new Date(Date.parse(data.registered_on)).toDateString(), (data.created_registrar ? ' via '+data.created_registrar : '')), br(),
        // dt('Previous Registrar: '), dd(data.losing_registrar), br(),
        // dt('Updated At: '), dd(new Date(Date.parse(data.updated_at)).toDateString()), br(),
        // dt('Updated On: '), dd(new Date(Date.parse(data.updated_on)).toDateString())
      );
    });

    return elem;
  });
  
  layout('dashboard');
}