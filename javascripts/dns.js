with (Hasher.Controller('DNS','Application')) {
  route({
    '#domains/:domain/dns': 'index'
  });
  
  create_action('index', function(domain) {
    Badger.getRecords(domain, function(records) {
      console.log(records)
      render('index', domain, records);
      call_action('show_correct_form_fields')
    });
    render('index', domain);
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

  layout('dashboard');
}

with (Hasher.View('DNS', 'Application')) { (function() {

  create_view('index', function(domain, records) {
    return div(
      h1(domain + ' DNS'),
      
      !records ? 'Loading DNS records... please wait' : [
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
      ]
    );
  });

})(); }
