with (Hasher('Heroku', 'DomainApps')) {

  register_domain_app({
    id: 'badger_heroku',
    name: 'Heroku',
    icon: 'images/apps/heroku.png',
    menu_item: { text: 'HEROKU', href: '#domains/:domain/heroku' },
    requires: {
      dns: [
        { type: 'a', content: "75.101.163.44" },
        { type: 'a', content: "75.101.145.87" },
        { type: 'a', content: "174.129.212.2" },
        { type: 'cname', subdomain: 'www', content: /[a-zA-Z0-9_-]+\.heroku(app)?\.com/, name: 'heroku_app_url' }
      ]
    },

    install_screen: function(app, domain_obj) {
      // Aspen & Bamboo Apps: Use YOURAPPNAME.heroku.com
      // Cedar Apps: Use YOURAPPNAME.herokuapp.com      ]
      return div(
        p("Heroku is a cloud application platform - a new way of building and deploying web apps."),
        show_required_dns(app, domain_obj),
        p("To install this app, first, run these console commands in your project directory:"),
        
        div({ 'style': 'background: #3b4249; color: #f8f8f8; padding: 10px; font-family: Monaco, monospace; font-size: 11px; margin-top: 6px' }, 
          div({ style: 'color: #8DA6CE' }, "$ heroku addons:add custom_domains"),
          div("Adding custom_domains to YOURAPPNAME...done."),
          div({ style: 'color: #8DA6CE; margin-top: 5px' }, "$ heroku domains:add www." + domain_obj.name),
          div("Added www." + domain_obj.name + " as a custom domain name to YOURAPPNAME.heroku[app].com"),
          div({ style: 'color: #8DA6CE; margin-top: 5px' }, "$ heroku domains:add "+ domain_obj.name),
          div("Added " + domain_obj.name + " as a custom domain name to YOURAPPNAME.heroku[app].com")
        ),
        
        div({ style: 'margin: 25px 0 15px 0' }, "Then copy and paste your Heroku Application URL below:"),
        form({ style: 'text-align: center', action: curry(install_app_button_clicked, app, domain_obj) },
          'http://',
          text({ name: 'heroku_app_url', placeholder: 'YOURAPPNAME.heroku[app].com', style: 'width: 250px' }),
          '/ ', 
          input({ 'class': 'myButton', type: 'submit', value: 'Install Heroku' })
        )
      );
    }
  });
  
  route('#domains/:domain/heroku', function(domain) {
    render(
      h1({ 'class': 'header-with-right-btn' }, div({ 'class': 'long-domain-name' }, 'HEROKU FOR ' + domain)),
      domain_app_settings_button('badger_heroku', domain),

      div({ id: 'web-forwards-errors' }),
      
      div("Heroku DNS settings have been installed into ", a({ href: '#domains/' + domain + '/dns' }, "Badger DNS"), '.'),
      br(),
      div("Also check out ", a({ href: 'http://devcenter.heroku.com/articles/custom-domains', target: '_blank' }, 'Heroku Custom Domains'), '.')
    );
  });
  
   
};