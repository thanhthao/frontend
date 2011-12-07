with (Hasher.View('GoogleMail', 'Application')) { 

  register_domain_app({
    id: 'google_mail',
    name: 'Google Mail',
    icon: 'images/apps/gmail.png',
    menu_item: { text: 'GOOGLE MAIL', href: '#domains/:domain/google_apps/gmail' },

    requires: {
      dns: [
        { type: 'cname', subdomain: 'mail', content: 'ghs.google.com' },
        { type: 'txt', content: 'v=spf1 include:_spf.google.com ~all' },
        { type: 'mx', priority: 1, content: "aspmx.l.google.com" },
        { type: 'mx', priority: 5, content: "alt1.aspmx.l.google.com" },
        { type: 'mx', priority: 5, content: "alt2.aspmx.l.google.com" },
        { type: 'mx', priority: 10, content: "aspmx2.googlemail.com" },
        { type: 'mx', priority: 10, content: "aspmx3.googlemail.com" },
        { type: 'mx', priority: 10, content: "aspmx4.googlemail.com" },
        { type: 'mx', priority: 10, content: "aspmx5.googlemail.com" }
      ]
    }
  });


  route('#domains/:domain/google_apps/gmail', function(domain) {
    render(
      h1("Google Mail for ", domain),
      domain_app_settings_button('google_mail', domain),
      p("If you haven't already, you'll need to ", a({ href: 'https://www.google.com/a/cpanel/domain/new', target: '_blank'}, 'setup Google Apps for Your Domain'), '.'),
      p("Once you've done that, you can head on over to ", a({ href: 'http://mail.' + domain + '/', target: '_blank' }, 'mail.' + domain), " and get started!")
    );
  });
  

  layout('dashboard');
}



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

