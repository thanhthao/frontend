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
        var app_dns = []
        load_domain(domain, function(domain_obj) {
          for (var key in Hasher.domain_apps) {
            var app = Hasher.domain_apps[key];
            if (app.requires.dns && app_is_installed_on_domain(app, domain_obj)) {
              var app_result = { app_id: key, app_name: app.name, records: [] }
              for (var dns_record in app.requires.dns) {
                for (var i=0; app.requires.dns && (i<app.requires.dns.length); i++) {
                  var found_record = domain_has_record(domain_obj, app.requires.dns[i]);
                  if (found_record) {
                    app_result.records.push(found_record);

                    domain_obj.records = $.grep(domain_obj.records, function(value) {
                      return value != found_record;
                    });
                  }
                }
              }
              app_dns.push(app_result);
            }
          }
          render(manager_view(domain_info, domain_obj.records, app_dns));
          show_correct_form_fields();
        });
      } else {
        set_route('#domains/' + domain + '/remote_dns');
      }
    });
  });

  define('manager_view', function(domain_info, records, app_dns) {
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
            return record_row(record, domain, true)
          }),

          app_dns.map(function(app_item) {
            return app_dns_rows(app_item.app_name, app_item.app_id, app_item.records, domain);
          })
        )
      )
    );
  });

  define('app_dns_rows', function(app_name, app_id, records, domain) {
    return [
      tr({ 'class': 'table-header' },
        td({ colspan: 5, 'class': 'app_dns_header' }, h2({ style: "border-bottom: 1px solid #888; padding-bottom: 5px; margin-bottom: 0" }, app_name),
        div({ style: 'float: right; margin-top: -30px' },
          a({ 'class': 'myButton myButton-small', href: curry(show_settings_modal_for_app, app_id, domain) }, 'Settings')
        ))
      ),
      records.map(function(record) {
        return record_row(record, domain, false)
      })
    ];
  });

  define('record_row', function(record, domain, editable) {
    return tr(
      td(record.record_type.toUpperCase()),
      td(record.name.replace(domain,''), span({ style: 'color: #888' }, domain)),
      td(record.priority, ' ', record.content),
      td(parse_readable_ttl(record.ttl)),
      editable ? td({ style: "text-align: center" },
        //button({ events: { 'click': action('dns_edit', domain, record.id) }}, 'Edit'),
        a({ href: curry(dns_delete, domain, record.id) }, img({ src: 'images/icon-no.gif'}))
      ) : td()
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

  define('parse_readable_ttl', function(ttl) {
    var array = []
    array.push(["week", parseInt(ttl / 604800)]);
    array.push(["day", parseInt((ttl % 604800) / 86400)]);
    array.push(["hour", parseInt((ttl % 86400) / 3600)]);
    array.push(["min", parseInt((ttl % 3600) / 60)]);
    array.push(["second", ttl % 60]);

    array = array.map(function(item) {
      return item[1] > 0 ? (item[1] > 1 ? (item[1] + ' ' + item[0] + 's') : "1 " + item[0]) : ''
    });
    return $.grep(array, function(item) { return item != '' }).join(' ');
  });
}
