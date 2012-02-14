with (Hasher('DomainShow','DomainApps')) {

  route('#domains/:domain', function(domain) {
    var content_div = div('Loading...');
    render(
      h1({ 'class': 'long-domain-name' }, domain),
      content_div
    );

    Badger.getDomain(domain, curry(handle_get_domain_response, content_div, domain));
  });

  define('handle_get_domain_response', function(content_div, domain, response) {
    var domain_obj = response.data;
    if (response.meta.status == 'ok') {
      if (!domain_obj.current_registrar) {
        render({ into: content_div },
          "This domain is not currently registered!",br(),br(),
          a({ 'class': 'myButton myButton-small', href: curry(Register.show, domain_obj.name) }, 'Register ', domain_obj.name)
        );
      } else if (domain_obj.current_registrar == 'Unknown') {
        // if it's "unknown", it was probably just added and we're still loading info for it... try again in 1 second
        setTimeout(curry(Badger.getDomain, domain_obj.name, curry(handle_get_domain_response, content_div, domain)), 1000);
      } else {
        render({ into: content_div }, 
          domain_status_description(domain_obj),
          render_all_application_icons(domain_obj)
        );
      }
    } else {
      render({ into: content_div }, 
        error_message("Oops, we're having a problem finding any information for: " + domain)
      );
    }
  });

  define('domain_status_description', function(domain_obj) {
    return p('This domain is ', domain_obj.status, ' and will auto-renew for 1 Credit on ', new Date(Date.parse(domain_obj.expires_on)).toDateString(), '.');
  });

  define('render_all_application_icons', function(domain_obj) {
    var installed_apps = div();
    var available_apps = div();

    for (var key in Hasher.domain_apps) {
      var app = Hasher.domain_apps[key];
      if (app.menu_item) {
        var href;
        var target;
        if (app_is_installed_on_domain(app, domain_obj)) {
          href = app.menu_item.href.replace(/:domain/, domain_obj.name);
          target = installed_apps;
        } else {
          if ((app.id == 'badger_dns') || (app.id == 'remote_dns')) {
            href = curry(BaseDnsApp.change_name_servers_modal, domain_obj);
          } else {
            href = curry(show_modal_install_app, app, domain_obj);
          }
          target = available_apps;
        }
        target.appendChild(
          a({ 'class': 'app_store_container', href: href },
            span({ 'class': 'app_store_icon', style: 'background-image: url(' + ((app.icon && app.icon.call ? app.icon.call(null, domain_obj) : app.icon) || 'images/apps/badger.png') + ')' } ),
            span({ style: 'text-align: center; font-weight: bold' }, (app.name.call ? app.name.call(null, domain_obj) : app.name))
          )
        );
        // add a clear every six icons
        if (target.childNodes.length % 7 == 6) target.appendChild(div({ style: 'clear: left ' }));
      }
    }

    return [
      h2({ style: 'border-bottom: 1px solid #888; padding-bottom: 6px' }, 'Installed Applications'),
      installed_apps,
      div({ style: 'clear: both '}),
      h2({ style: 'border-bottom: 1px solid #888; padding-bottom: 6px' }, 'Available Applications'),
      available_apps,
      div({ style: 'clear: both '})
    ];
  });
  
}
