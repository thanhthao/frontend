with (Hasher.Controller('DomainShow','Application')) {
  route({
    '#domains/:domain': 'show'
  });
  
  create_action('show', function(domain) {
    render(
      h1(domain),
      render_all_application_icons(domain)
    );
  });

  define('render_all_application_icons', function(domain) {
    var installed_apps = div();
    var available_apps = div();

    load_domain(domain, function(domain_obj) {
      for (var key in Hasher.domain_apps) {
        var app = Hasher.domain_apps[key];
        if (app.menu_item) {
          var href;
          var target;
          if (app_is_installed_on_domain(app, domain_obj)) {
            href = app.menu_item.href.replace(/:domain/, domain);
            target = installed_apps;
          } else {
            href = curry(show_modal_install_app, app, domain_obj);
            target = available_apps;
          }
          target.appendChild(
            a({ 'class': 'app_store_container', href: href },
              span({ 'class': 'app_store_icon', style: 'background-image: url(' + (app.icon || 'images/apps/badger.png') + ')' } ),
              span({ style: 'text-align: center; font-weight: bold' }, app.name)
            )
          );
        }
      }
    });
    
    return [
      installed_apps,
      div({ style: 'clear: both '}),
      h2('Popular Applications'),
      available_apps,
      div({ style: 'clear: both '})
    ];
  });

  define('install_app_button_clicked', function(app, domain_obj) {
    install_app_on_domain(app, domain_obj);
    hide_modal();
    $('#domain-menu-item-' + domain_obj.name.replace('.','-')).remove();
    redirect_to(app.menu_item.href.replace(':domain', domain_obj.name));
  });

  define('show_modal_install_app', function(app, domain_obj) {  
    show_modal(
      h1('INSTALL ', app.name, " on ", domain_obj.name),
      table({ 'class': 'fancy-table' },
        tbody(
          tr({ 'class': 'table-header' },
            th({ style: 'text-align: right; padding-right: 20px' }, 'Subdomain'),
            th({ style: 'padding: 0 20px' }, 'Type'),
            th({ style: 'width: 100%' }, 'Target')
          ),
          for_each(app.requires.dns, function(dns) { 
            return tr(
              td({ style: 'text-align: right; padding-right: 20px' }, dns.subdomain, span({ style: 'color: #aaa' }, dns.subdomain ? '.' : '', domain_obj.name)),
              td({ style: 'padding: 0 20px' }, dns.type.toUpperCase()),
              td(dns.priority, ' ', dns.content),
              td(domain_has_record(domain_obj, dns) ? 'yes' : 'no')
            );
          })
        )
      ),
      div({ style: 'padding-top: 20px; text-align: right' }, 
        a({ 'class': 'myButton', href: curry(install_app_button_clicked, app, domain_obj) }, 'Install ', app.name)
      )
    )
  });
  
  layout('dashboard');
  
}









