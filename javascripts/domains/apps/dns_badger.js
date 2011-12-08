with (Hasher('BadgerDnsApp','BaseDnsApp')) {

  layout('dashboard');

  register_domain_app({
    id: 'badger_dns',
    name: 'Badger DNS',
    menu_item: { text: 'BADGER DNS', href: '#domains/:domain/dns' },
    requires: {
      name_servers: ['ns1.badger.com','ns2.badger.com']
    }
  });

  route('#domains/:domain/dns', function(domain) {
    render('Loading...');

    Badger.getDomain(domain, function(response) {
      var domain_info = response['data'];
      if (domain_info.name_servers.join(',') == 'ns1.badger.com,ns2.badger.com') {
        Badger.getRecords(domain, function(records) {
          render(manager_view(domain_info, records));
          show_correct_form_fields();
        });
      } else {
        set_route('#domains/' + domain + '/remote_dns');
      }
    });
  });
  
  define('manager_view', function(domain_info, records) {
    var domain = domain_info.name;
    return div(
      h1('BADGER DNS FOR ' + domain),
      change_name_servers_button(domain_info),
      
      div({ id: 'errors' }),
      table({ 'class': 'fancy-table' },
        tbody(
          tr({ 'class': 'table-header' },
            th('Type'),
            th('Subdomain'),
            th('Content'),
            th('TTL'),
            th(' ')
          ),
          
          tr(
            td(
              select({ id: 'dns-add-type', onchange: show_correct_form_fields }, 
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
            td({ style: 'text-align: center' }, button({ 'class': 'myButton myButton-small', onclick: curry(dns_add, domain) }, 'Add'))
          ),
          
          records.map(function(record) {
            return tr(
              td(record.record_type.toUpperCase()),
              td(record.name.replace(domain,''), span({ style: 'color: #888' }, domain)),
              td(record.priority, ' ', record.content),
              td(record.ttl),
              td({ style: "text-align: center" },
                //button({ events: { 'click': action('dns_edit', domain, record.id) }}, 'Edit'),
                a({ href: curry(dns_delete, domain, record.id) }, img({ src: 'images/icon-no.gif'}))
              )
            );
          })
        )
      )
    );
  });
  
  define('show_correct_form_fields', function() {
    var record_type = $('#dns-add-type').val();
    $('#dns-add-content-ipv4')[['A'].indexOf(record_type) >= 0 ? 'show' : 'hide']();
    $('#dns-add-content-ipv6')[['AAAA'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns-add-content-host')[['CNAME','MX'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns-add-content-priority')[['MX'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns-add-content-text')[['TXT'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
  });
  
  define('dns_add', function(domain) {
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
        set_route(get_route());
      } else {
        $('#errors').empty().append(helper('Application.error_message', response));
      }
    })
  });

  define('dns_delete', function(domain, record_id) {
    if (confirm('Are you sure you want to delete this record?')) {
      Badger.deleteRecord(domain, record_id, function(results) {
        console.log(results);
        set_route(get_route());
      })
    }
  });
  
}
