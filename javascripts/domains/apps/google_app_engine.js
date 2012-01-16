// with (Hasher('GoogleAppEngine', 'DomainApps')) {
// 
//   register_domain_app({
//     id: 'badger_google_app_engine',
//     name: 'Google App Engine',
//     icon: 'images/apps/appengine.png',
//     menu_item: { text: 'GOOGLE APP ENGINE', href: '#domains/:domain/google_app_engine' },
//     requires: {
//       dns: [
//         { type: 'cname', subdomain: 'www', content: 'ghs.google.com' }
//       ],
//       url_forward: { 'http://:domain/': 'http://www.:domain/' }
//     },
// 
//     install_screen: function(app, domain_obj) {
//       return div(
//         div("First, run these console commands in your project directory:"),
//         
//         div({ 'style': 'background: #3b4249; color: #f8f8f8; padding: 10px; font-family: Monaco, monospace; font-size: 11px; margin-top: 6px' }, 
//           div({ style: 'color: #8DA6CE' }, "$ heroku addons:add custom_domains")
//           // div("Adding custom_domains to YOURAPPNAME...done."),
//           // div({ style: 'color: #8DA6CE; margin-top: 5px' }, "$ heroku domains:add www." + domain_obj.name),
//           // div("Added www." + domain_obj.name + " as a custom domain name to YOURAPPNAME.heroku[app].com"),
//           // div({ style: 'color: #8DA6CE; margin-top: 5px' }, "$ heroku domains:add "+ domain_obj.name),
//           // div("Added " + domain_obj.name + " as a custom domain name to YOURAPPNAME.heroku[app].com")
//         ),
//         
//         div({ style: 'margin: 25px 0 15px 0' }, "Then copy and paste your Google App Engine URL below:"),
// 
//         form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
//           'http://',
//           'something',
//           //text({ name: 'google_app_engine_app_url', placeholder: 'YOURAPP.appspot.com', style: 'width: 250px' }),
//           '/ ', 
//           input({ 'class': 'myButton', type: 'submit', value: 'Install Google App Engine' })
//         )
//       );
//     }
//   });
//   
//   route('#domains/:domain/google_app_engine', function(domain) {
//     render(
//       h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'GOOGLE APP ENGINE FOR ' + domain)),
//       domain_app_settings_button('badger_google_app_engine', domain),
// 
//       div({ id: 'web-forwards-errors' }),
//       
//       div("Google App Engine DNS settings have been installed into ", a({ href: '#domains/' + domain + '/dns' }, "Badger DNS"), '.'),
//       br(),
//       div("Also check out ", a({ href: 'http://code.google.com/appengine/docs/domain.html', target: '_blank' }, 'Google App Engine Custom Domains'), '.')
//     );
//   });
//   
//    
// };