with (Hasher('Application')) {
  // TODO: this despearetly needs to be cached
  define('load_domain', function(domain, callback) {
    var that = this;
    
    Badger.getDomain(domain, function(response) {
      var domain_obj = response.data;
      if (response.meta.status == 'ok') {
        domain_obj.current_registrar = 'badger';
        Badger.getRecords(domain, function(records) {
          domain_obj.records = records;
          callback.call(that, domain_obj)
        });
      } else {
        return null;
      }
    });
  });
}


with (Hasher('DomainApps','Application')) {
  layout('dashboard');
  
  route('#domains/:domain', function(domain) {
    render(
      h1({ 'class': 'long-domain-name' }, domain),
      render_all_application_icons(domain)
    );
  });

  before_filter('load_domain_info_filter', function() {
    //if ()
    console.log("load domain object for: " + get_route());
  });

  define('domain_status_description', function(domain_obj) {
    return p('This domain is ', domain_obj.status, ' and will auto-renew for 1 Credit on ', new Date(Date.parse(domain_obj.expires_on)).toDateString(), '.');
  });

  define('render_all_application_icons', function(domain) {
    var installed_apps = div();
    var available_apps = div();
    var status_div = div();

    load_domain(domain, function(domain_obj) {
      //domain_obj.current_registrar = '1and1';
      for (var key in Hasher.domain_apps) {
        var app = Hasher.domain_apps[key];
        if (app.menu_item) {
          var href;
          var target;
          if (app_is_installed_on_domain(app, domain_obj)) {
            href = app.menu_item.href.replace(/:domain/, domain);
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
      
      status_div.appendChild(domain_status_description(domain_obj));
    });
    
    return [
      status_div,
      h2({ style: 'border-bottom: 1px solid #888; padding-bottom: 6px' }, 'Installed Applications'),
      installed_apps,
      div({ style: 'clear: both '}),
      h2({ style: 'border-bottom: 1px solid #888; padding-bottom: 6px' }, 'Available Applications'),
      available_apps,
      div({ style: 'clear: both '})
    ];
  });

  define('install_app_button_clicked', function(app, domain_obj, form_data) {
    install_app_on_domain(app, domain_obj, form_data);
    hide_modal();
    $('#domain-menu-item-' + domain_obj.name.replace('.','-')).remove();
    redirect_to(app.menu_item.href.replace(':domain', domain_obj.name));
  });

  define('show_modal_install_app', function(app, domain_obj) {  
    show_modal(
      h1({ 'class': 'long-domain-name' }, app.name, " for ", domain_obj.name),

      ((app.requires && app.requires.dns && domain_obj.name_servers.join(',') != 'ns1.badger.com,ns2.badger.com') ? 
        div({ 'class': 'error-message', style: 'margin-top: 20px' }, 
          "Please install Badger DNS and try again.", 
          span({ style: 'padding-right: 20px'}, ' '), 
          div({ style: 'float: right' }, a({ 'class': 'myButton myButton-small', href: curry(BaseDnsApp.change_name_servers_modal, domain_obj) }, 'Install Badger DNS'))
        )
      : app.install_screen ? app.install_screen(app, domain_obj) : [
        table({ 'class': 'fancy-table' },
          tbody(
            tr({ 'class': 'table-header' },
              th({ style: 'text-align: right; padding-right: 20px' }, 'Subdomain'),
              th({ style: 'padding: 0 20px' }, 'Type'),
              th({ style: 'width: 100%' }, 'Target')
            ),
            for_each(app.requires.dns, function(dns) { 
              return tr(
                td({ style: 'text-align: right; padding-right: 20px' }, dns.subdomain, span({ style: 'color: #aaa' }, dns.subdomain ? '.' : '', Domains.truncate_domain_name(domain_obj.name))),
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
      ])

    );
  });

  define('show_needs_badger_nameservers_modal', function(app, domain_obj) {  
    show_modal(
      h1('FIRST, INSTALL BADGER DNS?'),
      div({ style: 'padding-top: 20px; text-align: right' }, 
        a({ 'class': 'myButton', href: curry(install_app_button_clicked, app, domain_obj) }, 'Install Badger Nameservers')
      )
    )
  });

  define('show_settings_modal_for_app', function(app_id, domain) {
    var app = Hasher.domain_apps[app_id];
    show_modal(
      h1('SETTINGS FOR ', app.name),
      p("If you'd like to uninstall this application, click the uninstall button below."),
      div({ style: "text-align: right; margin-top: 30px" },
        a({ 
          'class': 'myButton', 
          href: function() {
            load_domain(domain, function(domain_obj) {
              remove_app_from_domain(app, domain_obj);
              hide_modal();
              $('#domain-menu-item-' + domain_obj.name.replace('.','-')).remove();
              redirect_to('#domains/' + domain_obj.name);
            });
          }
        }, 'Uninstall ', app.name)
      )
    )
  });
        
  define('domain_app_settings_button', function(app_id, domain) {
    return div({ style: 'float: right; margin-top: -44px' }, 
      a({ 'class': 'myButton myButton-small', href: curry(show_settings_modal_for_app, app_id, domain) }, 'Settings')
    );
  });
  



  ////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////




  define('register_domain_app', function(options) {
    if (!Hasher.domain_apps) Hasher.domain_apps = {};
    Hasher.domain_apps[options.id] = options;
  });
  
  define('app_is_installed_on_domain', function(app, domain_obj) {
    // dns? require badger nameservers
    if (app.requires && app.requires.dns) app.requires.name_servers = ['ns1.badger.com','ns2.badger.com'];

    for (var key in app.requires) {
      switch(key) {
        case 'registrar':
          if (app.requires.registrar != domain_obj.current_registrar) return false;
        break;
        case 'name_servers':
          if (app.requires.name_servers[0] == '!=') {
            if ((domain_obj.name_servers||[]).join(',') == app.requires.name_servers.slice(1).join(',')) return false;
          } else {
            if ((domain_obj.name_servers||[]).join(',') != app.requires.name_servers.join(',')) return false;
          }
        break;
        case 'dns':
          for (var i=0; app.requires.dns && (i<app.requires.dns.length); i++) {
            if (!domain_has_record(domain_obj, app.requires.dns[i])) return false;
          }
        break;
      }
    }
    
    return true;
  });
  

  define('domain_has_record', function(domain_obj, record) {
    for (var i=0; i < domain_obj.records.length; i++) {
      var tmp_record = domain_obj.records[i];

      var sanitize_domain = function(host) {
        var regex = new RegExp("\\.?" + domain_obj.name.replace('.','\\.') + '$');
        return (host || '').replace(regex,'').toLowerCase();
      };

      var content_matches;
      if (record.content && record.content.test) {//regexp
        content_matches = record.content.test((tmp_record.content||'').toLowerCase());
      } else {
        content_matches = !!((tmp_record.content||'').toLowerCase() == (record.content||'').toLowerCase());
      }
      
      var type_matches = !!((tmp_record.type||tmp_record.record_type||'').toLowerCase() == (record.type||record.record_type||'').toLowerCase());
      var subdomain_matches = !!(sanitize_domain(tmp_record.subdomain) == sanitize_domain(record.subdomain));
      var priority_matches = !!(parseInt(tmp_record.priority||'0') == parseInt(record.priority||'0'));
      
      if (content_matches && type_matches && subdomain_matches && priority_matches) return tmp_record;
    }
    
    return false;
  });

  define('install_app_on_domain', function(app, domain_obj, form_data) {
    for_each(app.requires.dns, function(record) {
      if (!domain_has_record(domain_obj, record)) {
        var dns_fields = {
          record_type: record.type,
          priority: record.priority,
          subdomain: record.subdomain,
          ttl: 1800,
          content: record.name ? (form_data||{})[record.name] : record.content
        };

        Badger.addRecord(domain_obj.name, dns_fields, function(response) {
          // TODO: notify the user if error
          // if (response.meta.status == 'ok') {
          //   call_action('index', domain);
          // } else {
          //   $('#errors').empty().append(helper('Application.error_message', response));
          // }
        });
      }
    });
  });

  define('remove_app_from_domain', function(app, domain_obj) {  
    for_each(app.requires.dns, function(record) {
      var server_record = domain_has_record(domain_obj, record)
      if (server_record) {
        console.log("DELETE RECORD")
        console.log(server_record);
        Badger.deleteRecord(domain_obj.name, server_record.id, function(response) {
          //TODO: notify user if error
        });
      }
    });
  });

}













// with (Hasher('Application')) {
// 
// }


//   var domain_obj = {
//     name: domain,
//     records: records
//   };
// 
//   console.log(data);
//   render({ target: elem },
// 
// Badger.getRecords(domain, function(records) {
//   console.log(domain_obj)


// with (Hasher('DomainApps','Application')) {
//   route({
//     '#domains/:domain/applications': 'show'
//   });
// 
//   create_action('show', function(domain) {
//    var apps = [
//      { 
//        name: 'Installed Applications',
//        apps: [
//          { name: 'DNS', icon: 'images/apps/badger.png' },
//          { name: 'Email Forwarding', icon: 'images/apps/badger.png' },
//          { name: 'URL Forwarding', icon: 'images/apps/badger.png' }
//        ]
//      },
// 
//      { 
//        name: 'Popular Applications',
//        apps: [
//          { name: 'Google Apps', icon: 'images/apps/googleapps.png' },
//           { name: 'Blogger', icon: 'images/apps/blogger.png' },
//           { name: 'Tumblr', icon: 'images/apps/tumblr.png' },
//           { name: 'Wordpress', icon: 'images/apps/wordpress.png' }
//        ]
//      },
// 
//      { 
//        name: 'Advanced Applications',
//        apps: [
//          { name: 'Public Whois', icon: 'images/apps/badger.png' },
//          { name: 'Custom Nameservers', icon: 'images/apps/badger.png' },
//        ]
//      }
//    ];
// 
//     // var apps = [
//     //  { 
//     //    name: 'Profiles',
//     //    apps: [
//     //      { name: 'About.me', icon: 'images/apps/aboutme.png' },
//     //      { name: 'Flavors.me', icon: 'images/apps/flavorsme.png' },
//     //      { name: 'Facebook', icon: 'images/apps/facebook.png' },
//     //      { name: 'Flickr', icon: 'images/apps/flickr.png' },
//     //      { name: 'Twitter', icon: 'images/apps/twitter.png' },
//     //      { name: 'Twitter', icon: 'images/apps/twitter.png' },
//     //      { name: 'Blogger', icon: 'images/apps/blogger.png' },
//     //      { name: 'Tumblr', icon: 'images/apps/tumblr.png' },
//     //      { name: 'Posterous', icon: 'images/apps/posterous.png' },
//     //      { name: 'Wordpress', icon: 'images/apps/wordpress.png' },
//     //      { name: 'App Engine', icon: 'images/apps/appengine.png' },
//     //      { name: 'Heroku', icon: 'images/apps/heroku.png' },
//     //      { name: 'Gmail', icon: 'images/apps/gmail.png' },
//     //      { name: 'Email Forwarder', icon: 'images/apps/badger.png' },
//     //      { name: 'Custom DNS', icon: 'images/apps/badger.png' },
//     //      { name: 'Public Whois', icon: 'images/apps/badger.png' },
//     //      { name: 'Website Forwarder', icon: 'images/apps/badger.png' },
//     //      { name: 'Google Docs', icon: 'images/apps/googledocs.png' }
//     //    ]
//     //  }
//     // ];
//  
//     render('show', domain, apps);
//     // 
//     // Badger.getDomain(domain, function(response) {
//     //   render('show_with_data', domain, response.data);
//     // });
//   });
// 
//  create_action('show_app_dialog', function(domain, app) {
//    var normalized_name = app.name.toLowerCase().replace(/[^a-z]/g,'_');
//     call_action('Modal.show', 'DomainApps.' + normalized_name + '_install_modal', domain, app);
//  });
// 
//   layout('dashboard');
// }
// 
// with (Hasher('DomainApps', 'Application')) { 
// 
// 
//  // create_view('show', function(domain) {
//  //   return div(
//  //     h1(domain),
//  //     p('Loading data for ' + domain + '...')
//  //   );
//  // });
//  // 
//  // create_view('show_with_data', function(domain, data) {
//  //   return div(
//  //     h1(domain),
//  //     dl({ 'class': 'fancy-dl' },
//  //       dt('Expires:'), dd(new Date(Date.parse(data.expires_on)).toDateString()), br(),
//  //       dt('Status: '), dd(data.status), br(),
//  //       dt('Registered:'), dd(new Date(Date.parse(data.registered_on)).toDateString(), (data.created_registrar ? ' via '+data.created_registrar : '')), br(),
//  //       dt('Previous Registrar: '), dd(data.losing_registrar), br(),
//  //       dt('Created At: '), dd(new Date(Date.parse(data.created_at)).toDateString()), br(),
//  //       dt('Updated At: '), dd(new Date(Date.parse(data.updated_at)).toDateString()), br(),
//  //       dt('Updated On: '), dd(new Date(Date.parse(data.updated_on)).toDateString())
//  //     )
//  //   );
//  // });
// }







// define('app_row', function(name) {
//   return div({ style: "padding: 20px 0; border-top: 1px solid #ccc; text-align: right" },
//     button({ 'class': 'myButton' }, "Install ", name)
//   );
// });

// route('#domains/:domain/google_apps', function(domain) {
//   render(
//     h1("Google Apps for ", domain),
//     p({ 'class': 'info-message' }, "By installing this application, you'll be able to login to Gmail via mail." + domain + " and create whatever@" + domain + " email addresses!"),
//     app_row('Gmail'),
//     app_row('Calendar'),
//     app_row('Chat')
//   );
// });



// with (Hasher('Model')) {
//   initializer(function() {
//     Hasher.models = {};
//   });
//   
//   define('find', function(key) {
//     alert('find: ' + key)
//     console.log(Hasher.models)
//     if (Hasher.models[key]) {
//       return Hasher.models[key];
//     } else {
//       Hasher.models[key] = {};
//     }
//   });
// }
// 
// with (Hasher('Domain', 'Model')) {
//   initializer(function() {
//     Hasher.active_domains_count_spans = [];
//   });
//   
//   define('span_active_domains_count', function() {
//     var elem = element('span', '--active_domains--');
//     Hasher.active_domains_count_spans.push(elem);
//     return elem;
//   });
// }



// after_filter('test', function() {
//   alert("check menu")
// });

// 
// with (Hasher('Model')) {
// }
// 
// with (Hasher('DomainApp', 'Model')) {
//   define('register', function(name, callback) {
//   });
// }
// 


// define('hide_modal', function() {
//   call_action('Modal.hide');
// });
// 
// define('modal', function(callback) {
//   action('Modal.show', 'DNS.change_name_servers_modal', domain_info);
//   callback()
// });

// initializer(function() {
//   console.log("TODO: register GoogleApps as an app for a domain");
// 
// });

// this isnt quite right
// domain_initializer(function() {
//   console.log("TODO: read domain DNS and determine state of each ");
// })

// define('add_side_nav_to_domain', function(action) {
//   console.log('add_side_nav: ' + action);
// });



// with (Hasher('GoogleApps','DomainApp')) {
//   initializer(function() {
//     console.log('hi')
//   });
//   
//   layout('dashboard');
// }


 // create_helper('gmail_install_modal', function(domain, app) {
 //   return [
 //     h1('Gmail for Domains'),
 //     div("By installing this application, you'll be able to login to Gmail via mail." + domain + " and create whatever@" + domain + " email addresses!"),
 //     div({ style: "text-align: right" },
 //       button({ 'class': 'myButton' }, "Install " + app.name)
 //     )
 //   ];
 // });



// with (Hasher('BadgerDns', 'DomainApp')) {
//   add_side_nav('Badger DNS', '#/');
// 
//   register('badger_dns', function() {
//     
//   });
// }
// 
// with (Hasher('DomainAppController', 'Application')) {
//   
// }

