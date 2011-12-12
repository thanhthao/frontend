with (Hasher.Controller('Domains','Application')) {
  route({
    '#': 'index',
    '#filter_domains/:filter/:view_type': 'index'
  });

  create_action('index', function(filter, view_type) {
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
      render('index', results, filter, view_type);
      if (view_type == 'grid')
        call_action('create_grid_view', results);
    });
  });

  create_action('create_grid_view', function(domains) {
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
      $('#grid tbody').append(helper('add_grid_view', domain_names, [[key, null], [key, null]]));
      Badger.domainSearch(this, false, function(resp) {
        $("#grid tbody tr[key='" + key + "']").replaceWith(helper('add_grid_view', domain_names, resp.data.domains));
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
      $('#suggest-grid tbody').append(helper('add_grid_view', domain_names, [[key, null], [key, null]]));
      Badger.domainSearch(this, false, function(resp) {
        $("#suggest-grid tbody tr[key='" + key + "']").replaceWith(helper('add_grid_view', domain_names, resp.data.domains));
      });
    });
  });

  layout('dashboard');
}

with (Hasher.View('Domains', 'Application')) { (function() {

  create_view('index', function(domains, filter, view_type) {
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
          li(a({ href: action('Transfer.show') }, "Transfer a domain from another registrar"))
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
        a({ 'class': 'myButton myButton-small', href: action('Transfer.show') }, 'Transfer in a Domain')
      ),

      (typeof domains == 'undefined') ? [
        div('Loading domains...')
      ]:((domains.length == 0) ? 
				empty_domain_message
      : [ 
        helper(view_type + '_view', domains)
			])
    );
  });

  create_helper('list_view', function(domains) {
    return [
      table({ 'class': 'fancy-table' },
        tbody(
          tr({ 'class': 'table-header' },
            th('Name'),
            th('Status'),
            th('Expires'),
            th('Applications')
          ),

          (domains || []).map(function(domain) {
            return tr(
              td(a({ href: '#domains/' + domain.name }, domain.name)),
              td(domain.status),
              td(new Date(Date.parse(domain.expires)).toDateString()),
              td(
                // img({ src: 'images/apps/facebook-icon.png'}),
                // ', ',
                a({ href: '#domains/' + domain.name + '/registration' }, 'registration'),
                ', ',
                a({ href: '#domains/' + domain.name + '/dns' }, 'dns'),
                ', ',
                a({ href: '#domains/' + domain.name + '/whois' }, 'whois')
              )
            );
          })
        )
      )
    ];
  });

  create_helper('add_grid_view', function(domains, results) {
    return tr( {'key': results[0][0].split('.')[0]},
      td(results[0][0].split('.')[0]),

      results.map(function(domain) {
        var tld = domain[0].split('.')[1];
        if (domains.indexOf(domain[0])!=-1)
          return td({ 'class': 'tld'}, a({ href: '#domains/' + domain[0], style: 'color: #0a0' }, img({ src: "images/check.png" }), ' ', tld));
        else {
					if (!tld) return span();
					else if (domain[1]) return td({ 'class': 'tld' }, a({ href: action('Register.show', domain[0]) }, img({ src: "images/icon-plus.png" }), ' ', tld));
					else return td({ 'class': 'tld' }, span(img({ src: "images/icon-no-light.gif" }), ' ', span({ style: 'text-decoration: line-through' }, tld)));
        }
      })
    );
  })

  create_helper('grid_view', function(domains) {
    return [
      table({ id: 'grid', 'class': 'fancy-table' }, tbody()),
      table({ id: 'suggest-grid', 'class': 'fancy-table' }, tbody())
    ];
  });

})(); }
