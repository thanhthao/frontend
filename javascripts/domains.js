with (Hasher.Controller('Domains','Application')) {
  route({
    '#': 'index',
    '#domains/:domain': 'show',
    '#domains/:domain/dns': 'dns',
    '#domains/:domain/whois': 'whois',
  });
  
  create_action('show', function(domain) {
    console.log('show domain:' + domain);
    render('show', domain);
  });

  create_action('dns', function(domain) {
    Badger.getRecords(domain, function(records) {
      console.log(records)
      render('dns', domain, records);
    });
    render('dns', domain);
  });
  
  create_action('dns_add', function(domain) {
    Badger.addRecord(domain, {
      record_type: $('#dns-add-type').val(),
      name: $('#dns-add-name').val(),
      content: $('#dns-add-content').val(),
      priority: $('#dns-add-priority').val(),
      ttl: $('#dns-add-ttl').val()
    }, function(results) {
      console.log('oh hi results for ' + domain);
      console.log(results);
      call_action('dns', domain);
    })
  });

  create_action('dns_delete', function(domain, record_id) {
    if (confirm('Are you sure you want to delete this record?')) {
      Badger.deleteRecord(domain, record_id, function(results) {
        console.log(results);
        call_action('dns', domain);
      })
    }
  });

  create_action('index', function() {
    Badger.getDomains(function(domains) {
      render('index', domains);
    });
  });

  layout('dashboard');
}

with (Hasher.View('Domains', 'Application')) { (function() {

  create_view('index', function(domains) {
    return div(
      h1('My Domains'),
      table({ 'class': 'fancy-table' },
        tbody(
          tr({ 'class': 'table-header' },
            th('Name'),
            th('Expires'),
            th('Links')
          ),

          (domains || []).map(function(domain) {
            return tr(
              td(a({ href: '#domains/' + domain.name }, domain.name)),
              td(new Date(domain.expires).toDateString()),
              td(
                a({ href: '#domains/' + domain.name + '/dns' }, 'DNS')
              )
            );
          })
        )
      )
    );
  });

  create_view('show', function(domain) {
    return div(
      h1(domain)
    );
  });

  create_view('dns', function(domain, records) {
    return div(
      h1(domain + ' DNS'),
      
      !records ? 'Loading DNS records... please wait' : [
        table({ 'class': 'fancy-table' },
          tbody(
            tr({ 'class': 'table-header' },
              th('Type'),
              th('Subdomain'),
              th('IP/Target'),
              th('TTL'),
              th('Actions')
            ),
            
            tr(
              td(select({ id: 'dns-add-type' }, option('A'), option('CNAME'), option('MX'), option('TXT'))),
              td(input({ style: 'width: 60px', id: 'dns-add-name' }), span({ style: 'color: #888' }, '.' + domain)),
              td(input({ id: 'dns-add-content' })),
              td(
                select({ id: 'dns-add-ttl' }, 
                  option({ value: '1800' }, '30 minutes'), 
                  option({ value: '3600' }, '1 hour'),
                  option({ value: '3600' }, '6 hours'),
                  option({ value: '3600' }, '12 hours'),
                  option({ value: '86400' }, '1 day'),
                  option({ value: '259200' }, '3 days'),
                  option({ value: '604800' }, '1 week')
                )
              ),
              td(button({ events: { 'click': action('dns_add', domain) }}, 'Add'))
            ),
            
            records.map(function(record) {
              return tr(
                td(record.record_type.toUpperCase()),
                td(record.name.replace(domain,''), span({ style: 'color: #888' }, domain)),
                td(record.priority, ' ', record.content),
                td(record.ttl),
                td(
                  button({ events: { 'click': action('dns_edit', domain, record.id) }}, 'Edit'),
                  button({ events: { 'click': action('dns_delete', domain, record.id) }}, 'Delete')
                )
              );
            })
          )
        )
      ]
    );
  });

  create_view('whois', function(domain) {
    return div(
      h1(domain + ' WHOIS')
    );
  });

})(); }
