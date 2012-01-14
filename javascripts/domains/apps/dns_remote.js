with (Hasher('RemoteDnsApp','BaseDnsApp')) {

  register_domain_app({
    id: 'remote_dns',
    name: 'Nameservers',
    menu_item: { text: 'NAMESERVERS', href: '#domains/:domain/remote_dns' },
    requires: {
      name_servers: ['!=', 'ns1.badger.com','ns2.badger.com']
    }
  });

  route('#domains/:domain/remote_dns', function(domain) {
    load_domain(domain, function(domain_info) {
      render(
        div(
          h1('NAMESERVERS FOR ' + domain),
          change_name_servers_button(domain_info),

          p("You are not currently using Badger DNS."),
          h2('Remote Name Servers'),
          ((domain_info.name_servers && domain_info.name_servers.length > 0) ? 
            ul(
              domain_info.name_servers.map(function(server) {
                return li(server);
              })
            )
          : 'None')
        )
      );
    });
    render('Loading...');
  });

}