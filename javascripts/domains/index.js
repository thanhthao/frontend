with (Hasher('Domains','Application')) {
  route('#filter_domains/:filter/:view_type', function(filter, view_type) {
    render('');
    BadgerCache.getDomains(function(domains) {
      var results = [];
      if (view_type == null)
        view_type = "list";
      switch (filter){
        case 'transfers':
          for (i = 0; i < domains.length; i ++) {
            if ((domains[i].status == 'pending_transfer_in') || (domains[i].status == 'transfer_rejected'))
              results.push(domains[i]);
          }
          break;
        case 'expiringsoon':
          for (i = 0; i < domains.length; i ++) {
            var current_date = new Date();
            var expire_date = new Date(Date.parse(domains[i].expires));
            var days = parseInt(expire_date - current_date)/(24*3600*1000);
            if (days <= 90)
              results.push(domains[i]);
          }
          break;
        default:
          filter = 'all';
          results = domains
      }
      render(index_view(results, filter, view_type));
      if (view_type == 'grid')
        create_grid_view(results);
    });
  });

  define('truncate_domain_name', function(domain_name, length) {
    length = (length || 25)
    name = domain_name.substring(0, length)
    if (domain_name.length > length) name = name + "..."
    return name;
  });

  define('create_grid_view', function(domains) {
    var domain_names = [];
    var search_keys = [];
    $.each(domains, function() {
      domain_names.push(this.name);
      key = this.name.split(".")[0]
      if (search_keys.indexOf(key) == -1)
        search_keys.push(key);
    })

    $.each(search_keys, function(){
      var key = this.toString();
      $('#grid tbody').append(add_grid_view(domain_names, [[key, null], [key, null]]));
      Badger.domainSearch(this, false, function(resp) {
        $("#grid tbody tr[key='" + key + "']").replaceWith(add_grid_view(domain_names, resp.data.domains));
      });
    });

    var name = BadgerCache.cached_account_info.data.name.toLowerCase();
    var suggest_keys = [];
    var first_name = name.split(" ")[0];
    suggest_keys.push(first_name);
    suggest_keys.push(name.replace(first_name,"").replace(/ /g, ""));
    suggest_keys.push(name.replace(/ /g, ""));
    suggest_keys.push(name.replace(/ /g, "-"));
    $.each(suggest_keys, function(){
      var key = this.toString();
      $('#suggest-grid tbody').append(add_grid_view(domain_names, [[key, null], [key, null]]));
      Badger.domainSearch(this, false, function(resp) {
        $("#suggest-grid tbody tr[key='" + key + "']").replaceWith(add_grid_view(domain_names, resp.data.domains));
      });
    });
  });


  define('index_view', function(domains, filter, view_type) {
    var empty_domain_message = [];
    var title = "MY DOMAINS";
    switch (filter) {
      case 'transfers':
        empty_domain_message = [div("It looks like you don't have any domains in pending transfer.")];
        title = "DOMAIN TRANSFERS";
        break;
      case 'expiringsoon':
        empty_domain_message = [div("It looks like you don't have any domains expiring soon.")];
        title = "DOMAINS EXPIRING SOON";
        break;
      default:
        empty_domain_message = [
        div("It looks like you don't have any domains registered with us yet. You should probably:"),
        ul(
          li(a({ href: function() { $('#form-search-input').focus(); } }, "Search for a new domain")),
          li(a({ href: Transfer.show }, "Transfer a domain from another registrar"))
        ),
        div("Then this page will be a lot more fun.")
      ];
    }

    return div(
      h1(
				span(span(title), span({ id: filter + '-my-domains-h1' })),
				span({ style: 'padding-left: 20px' },
					a({href: "#filter_domains/" + filter + "/list"}, img({ src: 'images/icon-list-view.jpg' })),
					' ',
					a({href: "#filter_domains/" + filter + "/grid"}, img({ src: 'images/icon-grid-view.gif' }))
				)
			),
      div({ style: 'float: right; margin-top: -44px' },
        a({ 'class': 'myButton myButton-small', href: Transfer.show }, 'Transfer in a Domain')
      ),

      (typeof domains == 'undefined') ? [
        div('Loading domains...')
      ]:((domains.length == 0) ? 
				empty_domain_message
      : [ 
        remote_domains_transfer(domains),
        this[view_type + '_view'](domains)
			])
    );
  });

  define('remote_domains_transfer', function(domains) {
    var registrars = {};
    $.each(domains, function(key, domain) {
      switch (domain.current_registrar) {
        case 'Network Solutions, LLC':
        case 'GoDaddy Inc.':
          if (!registrars[domain.current_registrar]) {
            registrars[domain.current_registrar] = {
              count: 0,
              default_domains: ''
            };
          }
          registrars[domain.current_registrar].count++;
          registrars[domain.current_registrar].default_domains += domain.name + "\n";
          break;
      }
    });
    if ($.isEmptyObject(registrars)) {
      return;
    }
    
    return div({ 'class': 'info-message', style: 'text-align: right; padding: 10px;' }, $.map(registrars, function(data, name) {
      return div({ style: 'height: 30px;' }, 'You have ', b(data.count), ' domain' + (data.count == 1 ? '' : 's') + ' at ' + name,
        a({ 'class': 'myButton myButton-small', style: 'margin-left: 10px;', href: curry(Transfer.show, data.default_domains, true) }, 'Transfer To Badger')
      );
    }));
  });
  
  define('list_view', function(domains) {
    return [
      table({ 'class': 'fancy-table' },
        tbody(
          tr({ 'class': 'table-header' },
            th('Name'),
            th('Status'),
            th('Registrar'),
            th('Expires'),
            th('Applications')
          ),

          (domains || []).map(function(domain) {
            return tr(
              td(a({ href: '#domains/' + domain.name }, Domains.truncate_domain_name(domain.name))),
              td(domain.status),
              td(domain.current_registrar),
              td(new Date(Date.parse(domain.expires)).toDateString()),
              td(
                // img({ src: 'images/apps/facebook-icon.png'}),
                // ', ',
                a({ href: '#domains/' + domain.name + '/registration' }, 'registration'),
                ', ',
                a({ href: '#domains/' + domain.name + '/dns' }, 'dns')
              )
            );
          })
        )
      )
    ];
  });

  define('add_grid_view', function(domains, results) {
    var available_extensions = $.grep(results, function(ext) {
      return ext[1];
    });

    return tr( {'key': results[0][0].split('.')[0]},
      td(Domains.truncate_domain_name(results[0][0].split('.')[0], 40)),

      results.map(function(domain) {
        var tld = domain[0].split('.')[1];
        if (domains.indexOf(domain[0])!=-1)
          return td({ 'class': 'tld'}, a({ href: '#domains/' + domain[0], style: 'color: #0a0' }, img({ src: "images/check.png" }), ' ', tld));
        else {
					if (!tld) return span();
					else if (domain[1]) return td({ 'class': 'tld' }, a({ href: curry(Register.show, domain[0], $.grep(available_extensions, function(ext) { return ext != domain })) }, img({ src: "images/icon-plus.png" }), ' ', tld));
					else return td({ 'class': 'tld' }, span(img({ src: "images/icon-no-light.gif" }), ' ', span({ style: 'text-decoration: line-through' }, tld)));
        }
      })
    );
  })

  define('grid_view', function(domains) {
    return [
      table({ id: 'grid', 'class': 'fancy-table' }, tbody()),
      table({ id: 'suggest-grid', 'class': 'fancy-table' }, tbody())
    ];
  });

}
