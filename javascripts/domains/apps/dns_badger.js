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
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'BADGER DNS FOR ' + domain)),
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
              select({ id: 'dns-add-type', onchange: function() { show_correct_form_fields(); } },
                option('A'),
                //option('AAAA'),
                option('CNAME'),
                option('MX'),
                option('TXT')
              )
            ),
            td(input({ id: 'dns-add-subdomain' }), div({ 'class': 'long-domain-name domain-name-label' }, '.' + domain)),
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
                option({ value: '21600' }, '6 hours'),
                option({ value: '43200' }, '12 hours'),
                option({ value: '86400' }, '1 day'),
                option({ value: '259200' }, '3 days'),
                option({ value: '604800' }, '1 week')
              )
            ),
            td({ style: 'text-align: center' }, button({ style: "background-image: url(images/add.gif); background-color:Transparent; border: none; width: 16px; height: 16px; cursor: pointer", onclick: curry(dns_add, domain) }))
          ),

          sort_dns_records(records).map(function(record) {
            return record_row(record, domain, true)
          }),

          app_dns.map(function(app_item) {
            return app_dns_rows(app_item.app_name, app_item.app_id, sort_dns_records(app_item.records), domain);
          })
        )
      )
    );
  });

  define('app_dns_rows', function(app_name, app_id, records, domain) {
    return [
      tr({ 'class': 'table-header' },
        td({ colSpan: 5, 'class': 'app_dns_header' }, h2({ style: "border-bottom: 1px solid #888; padding-bottom: 5px; margin-bottom: 0" }, app_name),
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
    return tr({ id: 'dns-row-' + record.id },
      td(record.record_type.toUpperCase()),
      td(div({ 'class': 'long-domain-name', style: 'width: 300px;' }, record.subdomain.replace(domain,''), span({ style: 'color: #888' }, domain))),
      td(record.priority, ' ', Domains.truncate_domain_name(record.content)),
      td(parse_readable_ttl(record.ttl)),
      editable ? td({ style: "text-align: center; min-width: 40px;"},
        div({ 'class': 'edit-buttons' },
          //button({ events: { 'click': curry(dns_edit, domain, record.id) }}, 'Edit'),
          a({ 'class': 'hover-buttons icon-buttons', href: curry(edit_dns, domain, record) }, img({ src: 'images/edit.gif'})),
          a({ 'class': 'hover-buttons icon-buttons', href: curry(dns_delete, domain, record.id) }, img({ src: 'images/trash.gif'}))
      )) : td()
    );
  });

  define('show_correct_form_fields', function(id) {
    var type = '-add-';
    if (id != null)
      type = '-' + id + '-edit-';
    var record_type = $('#dns' + type + 'type').val();
    $('#dns' + type + 'content-ipv4')[['A'].indexOf(record_type) >= 0 ? 'show' : 'hide']();
    $('#dns' + type + 'content-ipv6')[['AAAA'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns' + type + 'content-host')[['CNAME','MX'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns' + type + 'content-priority')[['MX'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
    $('#dns' + type + 'content-text')[['TXT'].indexOf(record_type) >= 0  ? 'show' : 'hide']();
  });

define('get_dns_params', function(id) {
    var type = '-add-';
    if (id != null)
      type = '-' + id + '-edit-';

    $('#errors').empty();

    var dns_fields = {
      record_type: $('#dns' + type + 'type').val(),
      subdomain: $('#dns' + type + 'subdomain').val(),
      ttl: $('#dns' + type + 'ttl').val()
    };

    if (dns_fields.record_type == 'A') {
      dns_fields.content = $('#dns' + type + 'content-ipv4').val();
    } else if (dns_fields.record_type == 'AAAA') {
      dns_fields.content = $('#dns' + type + 'content-ipv6').val();
    } else if (dns_fields.record_type == 'CNAME') {
      dns_fields.content = $('#dns' + type + 'content-host').val();
    } else if (dns_fields.record_type == 'MX') {
      dns_fields.content = $('#dns' + type + 'content-host').val();
      dns_fields.priority = $('#dns' + type + 'content-priority').val();
    } else if (dns_fields.record_type == 'TXT') {
      dns_fields.content = $('#dns' + type + 'content-text').val();
    }

    return dns_fields;
  });

  define('dns_add', function(domain) {
    $('#errors').empty();

    Badger.addRecord(domain, get_dns_params(), function(response) {
      if (response.meta.status == 'ok') {
        set_route(get_route());
      } else {
        $('#errors').empty().append(Application.error_message(response));
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

  define('dns_update', function(domain, record) {
    $('#errors').empty();

    Badger.updateRecord(domain, record.id, get_dns_params(record.id), function(results) {
      if (results.meta.status == 'ok') {
        set_route(get_route());
      } else {
        $('#errors').empty().append(Application.error_message(results));
      }
    })
  });

  define('edit_dns', function(domain, record) {
    $('#dns-row-' + record.id).after(edit_dns_row(domain, record));
    $('#dns-row-' + record.id).addClass('hidden');
    show_correct_form_fields(record.id);
  });

  define('reset_dns_row', function(id) {
    $('#dns-row-' + id).removeClass('hidden');
    $('#edit-dns-' + id).remove();
  });

  define('edit_dns_row', function(domain, record) {
    return tr({ id: 'edit-dns-' + record.id },
      td(
        select({ id: 'dns-' + record.id + '-edit-type', onchange: function() { show_correct_form_fields(record.id); } },
          option( record.record_type.toUpperCase() == 'A' ? { selected: 'selected' } : {}, 'A'),
          option( record.record_type.toUpperCase() == 'CNAME' ? { selected: 'selected' } : {}, 'CNAME'),
          option( record.record_type.toUpperCase() == 'MX' ? { selected: 'selected' } : {}, 'MX'),
          option( record.record_type.toUpperCase() == 'TXT' ? { selected: 'selected' } : {}, 'TXT')
        )
      ),
      td(input({ style: 'width: 60px', id: 'dns-'+record.id+'-edit-subdomain', value: record.subdomain.replace('.'+domain,'') }), span({ style: 'color: #888' }, '.' + domain)),
      td(
        select({ id: 'dns-' + record.id + '-edit-content-priority' },
          option( record.priority == 10 ? { selected: 'selected' } : {}, '10'),
          option( record.priority == 20 ? { selected: 'selected' } : {}, '20'),
          option( record.priority == 30 ? { selected: 'selected' } : {}, '30'),
          option( record.priority == 40 ? { selected: 'selected' } : {}, '40'),
          option( record.priority == 50 ? { selected: 'selected' } : {}, '50')
        ),
        input({ id: 'dns-' + record.id + '-edit-content-ipv4', placeholder: 'XXX.XXX.XXX.XXX', value: record.content }),
        input({ id: 'dns-' + record.id + '-edit-content-ipv6', placeholder: 'XXXX:XXXX:XXXX:XXXX:XXXX:XXXX:XXXX:XXXX', value: record.content }),
        input({ id: 'dns-' + record.id + '-edit-content-host', placeholder: 'example.com', value: record.content }),
        input({ id: 'dns-' + record.id + '-edit-content-text', placeholder: 'SPF, domain keys, etc.', value: record.content })
      ),
      td(
        select({ id: 'dns-' + record.id + '-edit-ttl' },
          option({ value: '1800' }, '30 mins'),
          option(record.ttl == 3600 ? { selected: 'selected', value: '3600' } : { value: '3600' }, '1 hour'),
          option(record.ttl == 21600 ? { selected: 'selected', value: '21600' } : { value: '21600' }, '6 hours'),
          option(record.ttl == 43200 ? { selected: 'selected', value: '43200' } : { value: '43200' }, '12 hours'),
          option(record.ttl == 86400 ? { selected: 'selected', value: '86400' } : { value: '86400' }, '1 day'),
          option(record.ttl == 259200 ? { selected: 'selected', value: '259200' } : { value: '259200' }, '3 days'),
          option(record.ttl == 604800 ? { selected: 'selected', value: '604800' } : { value: '604800' }, '1 week')
        )
      ),
      td({ style: 'text-align: center; min-width: 40px' },
        a({ 'class': 'icon-buttons', href: curry(dns_update, domain, record) }, img({ src: 'images/save.png'})),
        a({ 'class': 'icon-buttons', href: curry(reset_dns_row, record.id) }, img({ src: 'images/cancel.png'}))
      )
    );
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

  define('sort_dns_records', function(records) {
    var results = [];
    var count = 0;
    var tempts = records.map(function(record) {
      return [record.record_type + (record.priority || '').toString() + record.subdomain + record.content, count++];
    });

    tempts.sort(function(x,y){
      var a = x.toString().toUpperCase();
      var b = y.toString().toUpperCase();
      if (a > b)
         return 1
      if (a < b)
         return -1
      return 0;
    });

    results = tempts.map(function(item) {
      return records[item[1]];
    })

    return results;
  });
}
