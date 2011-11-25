with (Hasher.Controller('DNS','Application')) {
  route({
    '#domains/:domain/dns': 'index'
  });
  
  create_action('index', function(domain) {
    Badger.getDomain(domain, function(response) {
      var domain_info = response['data'];
      if (domain_info.name_servers.join(',') == 'ns1.badger.com,ns2.badger.com') {
        Badger.getRecords(domain, function(records) {
          render('manager', domain_info, records);
          call_action('show_correct_form_fields')
        });
      } else {
        render('offsite', domain_info);
      }
    });
    
    render('loading', domain);
  });
  
  create_action('show_correct_form_fields', function() {
    var record_type = $('#dns-add-type').val();
    $('#dns-add-content-ipv4')[['A'].indexOf(record_type) >= 0 ? 'show' : 'hide']();
    $('#dns-add-content-ipv6')[['AAAA'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns-add-content-host')[['CNAME','MX'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns-add-content-priority')[['MX'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns-add-content-text')[['TXT'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
  });
  
  create_action('dns_add', function(domain) {
    $('#errors').empty();
    
    var dns_fields = {
      record_type: $('#dns-add-type').val(),
      name: $('#dns-add-name').val(),
      ttl: $('#dns-add-ttl').val()
    };
    
    if (dns_fields.record_type == 'A') {
      dns_fields.content = $('#dns-add-content-ipv4').val();
    } else if (dns_fields.record_type == 'AAAA') {
      dns_fields.content = $('#dns-add-content-ipv6').val();
    } else if (dns_fields.record_type == 'CNAME') {
      dns_fields.content = $('#dns-add-content-host').val();
    } else if (dns_fields.record_type == 'MX') {
      dns_fields.content = $('#dns-add-content-host').val();
      dns_fields.priority = $('#dns-add-content-priority').val();
    } else if (dns_fields.record_type == 'TXT') {
      dns_fields.content = $('#dns-add-content-text').val();
    }

    Badger.addRecord(domain, dns_fields, function(response) {
      if (response.meta.status == 'ok') {
        call_action('index', domain);
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    })
  });

  create_action('dns_delete', function(domain, record_id) {
    if (confirm('Are you sure you want to delete this record?')) {
      Badger.deleteRecord(domain, record_id, function(results) {
        console.log(results);
        call_action('index', domain);
      })
    }
  });
  
  create_action('save_name_servers', function(domain_info) {
    $('#errors_modal').empty();
    Badger.updateDomain(domain_info.name, { name_servers: $('#name_server_select').val() }, function(response) {
      console.log(response)
      if (response.meta.status == 'ok') {
        call_action('Modal.hide');
        call_action('index', domain_info.name);
      } else {
        $('#errors_modal').empty().append(helper('Application.error_message', response));
      }
    });
  });

  layout('dashboard');
}

with (Hasher.View('DNS', 'Application')) { (function() {

  create_view('loading', function(domain) {
    return div(
      h1(domain + ' DNS'),
      'Loading... please wait.'
    );
  });

  create_view('offsite', function(domain_info) {
    return div(
      h1(domain_info.name + ' DNS'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'DNS.change_name_servers_modal', domain_info) }, 'Change Name Servers')
      ),
      
      p("NOTE: You are not currently using our Badger.com DNS servers.  If you'd like to manage your DNS records from here, click 'Change Name Servers' and choose Badger.com DNS."),
      h2('External Servers'),
      ul(
        domain_info.name_servers.map(function(server) {
          return li(server);
        })
      )
    );
  });

  create_view('manager', function(domain_info, records) {
    var domain = domain_info.name;
    return div(
      h1(domain + ' DNS'),
      div({ style: 'float: right; margin-top: -44px' }, 
        a({ 'class': 'myButton myButton-small', href: action('Modal.show', 'DNS.change_name_servers_modal', domain_info) }, 'Change Name Servers')
      ),
      
      div({ id: 'errors' }),
      table({ 'class': 'fancy-table' },
        tbody(
          tr({ 'class': 'table-header' },
            th('Type'),
            th('Subdomain'),
            th('Content'),
            th('TTL'),
            th('Actions')
          ),
          
          tr(
            td(
              select({ id: 'dns-add-type', events: { change: action('show_correct_form_fields') } }, 
                option('A'), 
                //option('AAAA'), 
                option('CNAME'), 
                option('MX'), 
                option('TXT')
              )
            ),
            td(input({ style: 'width: 60px', id: 'dns-add-name' }), span({ style: 'color: #888' }, '.' + domain)),
            td(
              select({ id: 'dns-add-content-priority' }, option('10'), option('20'), option('30'), option('40'), option('50')),
              input({ id: 'dns-add-content-ipv4', placeholder: 'XXX.XXX.XXX.XXX' }),
              input({ id: 'dns-add-content-ipv6', placeholder: 'XXXX:XXXX:XXXX:XXXX:XXXX:XXXX:XXXX:XXXX' }),
              input({ id: 'dns-add-content-host', placeholder: 'example.com' }),
              input({ id: 'dns-add-content-text', placeholder: 'SPF, domain keys, etc.' })
            ),
            td(
              select({ id: 'dns-add-ttl' }, 
                option({ value: '1800' }, '30 mins'), 
                option({ value: '3600' }, '1 hour'),
                option({ value: '3600' }, '6 hours'),
                option({ value: '3600' }, '12 hours'),
                option({ value: '86400' }, '1 day'),
                option({ value: '259200' }, '3 days'),
                option({ value: '604800' }, '1 week')
              )
            ),
            td(button({ 'class': 'myButton myButton-small', events: { 'click': action('dns_add', domain) }}, 'Add'))
          ),
          
          records.map(function(record) {
            return tr(
              td(record.record_type.toUpperCase()),
              td(record.name.replace(domain,''), span({ style: 'color: #888' }, domain)),
              td(record.priority, ' ', record.content),
              td(record.ttl),
              td(
                //button({ events: { 'click': action('dns_edit', domain, record.id) }}, 'Edit'),
                button({ 'class': 'myButton myButton-small', events: { 'click': action('dns_delete', domain, record.id) }}, 'Delete')
              )
            );
          })
        )
      )
    );
  });

  create_helper('dns_provider_options', function(current) {
    console.log("CURRENT: ");
    console.log(current);
    var dns_providers = [
      ['Badger DNS (recommended)', 'ns1.badger.com,ns2.badger.com'],
      ['Rackspace', 'ns1.rackspace.com,ns2.rackspace.com'],
      // ['easyDNS',''],
      // ['EveryDNS', ''],
      // ['DNSMadeEasy', ''],
      // ['DynDNS', ''],
      // ['NO-IP', ''],
      // ['PowerDNS', ''],
      // ['UltraDNS', ''],
      // ['Zerigo', ''],
      // ['ZoneEdit', ''],
      ['None','']
    ];
    
    // TODO: always have "Custom" option with input boxes
    if (current) {
      var found_it = false;
      for (var i=0; i < dns_providers.length; i++) {
        if (dns_providers[i][1] == current) { found_it = true; break; }
      }
      if (!found_it) dns_providers.push(['Custom', current]);
    }
     
    return dns_providers.map(function(provider) {
      if (provider[1] == current) {
        return option({ value: provider[1], selected: 'selected' }, provider[0]);
      } else {
        return option({ value: provider[1] }, provider[0]);
      }
    });
  });
  
  create_helper('change_name_servers_modal', function(domain_info) {
    var change_callback = function() {
      $('#name_server_ul').empty()
      $('#name_server_select').val().split(',').map(function(server) {
        if (server && server.length > 0) $('#name_server_ul').append(li(server));
      });
    };

    setTimeout(change_callback,0);
    
    return div(
      h1('DNS Host:'),
      div({ id: 'errors_modal' }),
      
      form({ action: action('save_name_servers', domain_info) },
        div({ style: 'font-weight: bold' }, 'DNS Provider:'), 
        select({ 
          id: 'name_server_select', 
          events: { 
            change: change_callback
          }},
          helper('dns_provider_options', domain_info.name_servers.join(','))
        ),

        div({ style: 'font-weight: bold; margin-top: 10px' }, 'Name Servers:'),
        ul({ id: 'name_server_ul' }),
        div({ style: 'text-align: right; margin-top: 10px' }, input({ 'class': 'myButton', type: 'submit', value: 'Save' }))
      )
    );
  });
})(); }
