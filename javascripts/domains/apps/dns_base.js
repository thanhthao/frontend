with (Hasher.Controller('BaseDnsApp','DomainApps')) {

  define('change_name_servers_modal', function(domain_info) {
    show_modal(
      div(
        h1('DNS SETTINGS'),
        div({ id: 'errors_modal' }),
      
        div({ style: 'width: 275px; padding-right: 20px; float: left; margin-right: -1px; border-right: 1px solid #ccc' },
          h2(span({ style: 'cursor: pointer', onclick: function() { $('#remote-dns-details').hide(); $('#badger-dns-details').show(); $('#radio-nameservers-badger').click(); } }, radio({ id: 'radio-nameservers-badger', style: 'margin: 0 8px 2px 0', name: 'nameservers' }), 'BADGER DNS'), span({ style: 'padding-left: 10px; font-weight: normal; font-size: 11px'}, '(RECOMMENDED)')),
          div({ id: 'badger-dns-details' },
            ul(
              li("Proven reliability."),
              li("Servers around the world."),
              li("Manage from within Badger.com")
            ),

            div({ id: 'badger-dns-installed-div', style: 'margin-top: 30px; font-size: 20px; font-weight: bold; text-align: center; font-style: italic; display: none'}, 
              img({ src: "images/check.png" }),
              'Already Installed!'
            ),
            div({ id: 'badger-dns-install-button-div', style: 'margin-top: 10px; text-align: center; display: none' }, button({ 'class': 'myButton', onclick: curry(save_name_servers, domain_info, 'ns1.badger.com,ns2.badger.com') }, 'Install'))
          )
        ),

        div({ style: 'width: 275px; padding-left: 20px; float: left; border-left: 1px solid #ccc' },
          h2(span({ style: 'cursor: pointer', onclick: function() { $('#remote-dns-details').show(); $('#badger-dns-details').hide(); $('#radio-nameservers-remote').click(); } }, radio({ id: 'radio-nameservers-remote', style: 'margin: 0 8px 2px 0', name: 'nameservers' }), 'REMOTE DNS'), span({ style: 'padding-left: 10px; font-weight: normal; font-size: 11px'}, '(THE HARD WAY)')),
          div({ id: 'remote-dns-details', style: "padding-left: 20px" },
            form({ action: function() { save_name_servers(domain_info, $('#name_server_select').val()); } },
              div({ style: 'font-weight: bold' }, 'DNS Provider:'), 
              select({ 
                  id: 'name_server_select', 
                  onChange: update_name_server_ul_from_select
                },
                dns_provider_options(domain_info.name_servers.join(','))
              ),

              div({ style: 'font-weight: bold; margin-top: 10px' }, 'Name Servers:'),
              ul({ id: 'name_server_ul', style: 'margin-left: 0px; padding-left: 0; margin-top: 0' }),
              
              div({ style: 'margin-top: 10px' }, input({ 'class': 'myButton', type: 'submit', value: 'Save' }))
            )
          )
        ),

        div({ style: 'clear: left' }),
        
        p({ style: "font-style: italic; padding-top: 20px; margin-bottom: 0" }, 'WARNING: Changing these settings could take up to 48 hours to be updated by everybody.')
        
      )
    );

    if (domain_info.name_servers.join(',') == 'ns1.badger.com,ns2.badger.com') {
      $('#badger-dns-installed-div').show();
      $('#radio-nameservers-badger').click();
    } else {
      $('#badger-dns-install-button-div').show();
      $('#radio-nameservers-remote').click();
    }

    update_name_server_ul_from_select();
  });

  define('save_name_servers', function(domain_info, new_name_servers) {
    $('#errors_modal').empty();
    Badger.updateDomain(domain_info.name, { name_servers: new_name_servers }, function(response) {
      if (response.meta.status == 'ok') {
        hide_modal();
        $('#domain-menu-item-' + domain_info.name.replace('.','-')).remove();
        set_route('#domains/' + domain_info.name);
      } else {
        $('#errors_modal').empty().append(helper('Application.error_message', response));
      }
    });
  });

  define('update_name_server_ul_from_select', function() {
    $('#name_server_ul').empty()
    var tmp_select = $('#name_server_select');
    if (tmp_select[0].selectedIndex == 0) {
      var tmp_custom_option = tmp_select[0].childNodes[0];
      $('#name_server_ul').append(
        li({ style: 'list-style: none' }, 
          textarea({ 
            style: 'width: 200px; height: 80px',
            onChange: function() {
              console.log(tmp_custom_option)
              tmp_custom_option.value = $(this).val().replace("\r",'').split("\n").join(',').replace(/,+/,',').replace(/^,/,'').replace(/,$/,'');
            }},
            tmp_select.val().split(',').join("\n")
          )
        )
      );
    } else {
      $('#name_server_select').val().split(',').map(function(server) {
        if (server && server.length > 0) $('#name_server_ul').append(li({ style: "margin-left: 20px" }, server));
      });
    }
  });

  define('dns_provider_options', function(current) {
    if (current == 'ns1.badger.com,ns2.badger.com') current = '';
    
    var dns_providers = [
      ['Custom',''],
      ['Rackspace', 'ns1.rackspace.com,ns2.rackspace.com'],
      // ['easyDNS',''],
      // ['EveryDNS', ''],
      // ['DNSMadeEasy', ''],
      // ['DynDNS', ''],
      // ['NO-IP', ''],
      // ['PowerDNS', ''],
      // ['UltraDNS', ''],
      // ['Zerigo', ''],
      // ['ZoneEdit', ''],
    ];
    
    if (current) {
      //console.log(current);
      var found_it = false;
      for (var i=0; i < dns_providers.length; i++) {
        if (dns_providers[i][1] == current) { found_it = true; break; }
      }

      // didn't find it? set current
      if (!found_it) dns_providers[0][1] = current;
    }
         
    return dns_providers.map(function(provider) {
      if (provider[1] == current) {
        return option({ value: provider[1], selected: 'selected' }, provider[0]);
      } else {
        return option({ value: provider[1] }, provider[0]);
      }
    });
  });

  define('change_name_servers_button', function(domain_info) {
    return div({ style: 'float: right; margin-top: -44px' }, 
      a({ 'class': 'myButton myButton-small', href: curry(change_name_servers_modal, domain_info) }, 'Settings')
    );
  })
}