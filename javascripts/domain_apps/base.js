// todo
// - conflicts between apps
// - require "badger dns" for apps
// - show which app the dns entry belongs to
// - add extra apps
// - fix broken "mydomains.com" test

with (Hasher('Application')) {
  define('register_domain_app', function(options) {
    if (!Hasher.domain_apps) Hasher.domain_apps = {};
    Hasher.domain_apps[options.id] = options;
  });
  
  define('app_is_installed_on_domain', function(app, domain_obj) {
    for (var key in app.requires) {
      switch(key) {
        case 'registrar':
          if (app.requires.registrar != domain_obj.current_registrar) return false;
        break;
        case 'name_servers':
          if ((domain_obj.name_servers||[]).join(',') != app.requires.name_servers.join(',')) return false;
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

  define('domain_has_record', function(domain_obj, record) {
    for (var i=0; i < domain_obj.records.length; i++) {
      var tmp_record = domain_obj.records[i];

      var sanitize_domain = function(host) {
        var regex = new RegExp("\\.?" + domain_obj.name.replace('.','\\.') + '$');
        return (host || '').replace(regex,'').toLowerCase();
      };

      var content_matches = !!((tmp_record.content||'').toLowerCase() == (record.content||'').toLowerCase());
      var type_matches = !!((tmp_record.type||tmp_record.record_type||'').toLowerCase() == (record.type||record.record_type||'').toLowerCase());
      var name_matches = !!(sanitize_domain(tmp_record.name||tmp_record.subdomain) == sanitize_domain(record.name||record.subdomain));
      var priority_matches = !!(parseInt(tmp_record.priority||'0') == parseInt(record.priority||'0'));
      
      if (content_matches && type_matches && name_matches && priority_matches) return tmp_record;
    }
    
    return false;
  });

  define('install_app_on_domain', function(app, domain_obj) {  
    for_each(app.requires.dns, function(record) {
      if (!domain_has_record(domain_obj, record)) {
        var dns_fields = {
          record_type: record.type,
          priority: record.priority,
          name: record.subdomain,
          ttl: 1800,
          content: record.content
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
  
  
	define('show_settings_modal_for_app', function(app_id, domain) {
	  var app = Hasher.domain_apps[app_id];
    show_modal(
      h1('SETTINGS FOR ', app.name),
      a({ href: function() {
        load_domain(domain, function(domain_obj) {
          remove_app_from_domain(app, domain_obj);
          hide_modal();
          $('#domain-menu-item-' + domain_obj.name.replace('.','-')).remove();
          redirect_to('#domains/' + domain_obj.name);
        });
      }}, 'Uninstall')
    )
	});
	
	define('domain_app_settings_button', function(app_id, domain) {
    return div({ style: 'float: right; margin-top: -44px' }, 
      a({ 'class': 'myButton myButton-small', href: curry(show_settings_modal_for_app, app_id, domain) }, 'Settings')
    );
  });

}


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


// with (Hasher.Controller('DomainApps','Application')) {
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
// with (Hasher.View('DomainApps', 'Application')) { 
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