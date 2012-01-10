with (Hasher.Controller('BaseDnsApp','DomainApps')) {

  define('change_name_servers_modal', function(domain_info) {
    show_modal(
      div(
        h1(domain_info.name, ' NAMESERVERS'),
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
          h2(span({ style: 'cursor: pointer', onclick: function() { $('#remote-dns-details').show(); $('#badger-dns-details').hide(); $('#radio-nameservers-remote').click(); } }, radio({ id: 'radio-nameservers-remote', style: 'margin: 0 8px 2px 0', name: 'nameservers' }), 'EXTERNAL'), span({ style: 'padding-left: 10px; font-weight: normal; font-size: 11px'}, '(THE HARD WAY)')),
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
    var custom_option = option({ value: '' }, 'Custom');
    var options = [
      custom_option,
      option({ disabled: 'disabled' }),
    
      optgroup({ label: 'Hosting' },
        option({ value: 'ns1.dnsmadeeasy.com,ns2.dnsmadeeasy.com' }, 'DNSMadeEasy'),
        option({ value: 'ns1.dreamhost.com,ns2.dreamhost.com,ns3.dreamhost.com' }, 'DreamHost'),
        option({ value: 'ns1.mydyndns.org,ns2.mydyndns.org' }, 'DynDNS'),
        option({ value: 'ns1.no-ip.com,ns2.no-ip.com,ns3.no-ip.com,ns4.no-ip.com,ns5.no-ip.com' }, 'NO-IP'),
        option({ value: 'dns-us1.powerdns.net,dns-us2.powerdns.net,dns-eu1.powerdns.net,dns-eu2.powerdns.net' }, 'PowerDNS'),
        option({ value: 'ns1.rackspace.com,ns2.rackspace.com' }, 'Rackspace'),
        option({ value: 'ns1.slicehost.com,ns2.slicehost.com,ns3.slicehost.com' }, 'SliceHost'),
        option({ value: 'ns1.softlayer.com,ns2.softlayer.com' }, 'SoftLayer'),
        option({ value: 'a.ns.zerigo.net,b.ns.zerigo.net,c.ns.zerigo.net,d.ns.zerigo.net,e.ns.zerigo.net,f.ns.zerigo.net' }, 'Zerigo')
      ),
      
      optgroup({ label: 'Parking' },
        option({ value: 'ns1.1plus.net,ns2.1plus.net' }, '1plus.net'),
        option({ value: 'ns1.bodis.com,ns2.bodis.com' }, 'Bodis'),
        option({ value: 'ns1.dsredirection.com,ns2.dsredirection.com' }, 'DomainSponsor'),
        option({ value: 'ns1.fabulous.com,ns2.fabulous.com' }, 'Fabulous'),
        option({ value: 'ns1.fastpark.net,ns2.fastpark.net' }, 'FastPark.net'),
        option({ value: 'ns1.googleghs.com,ns2.googleghs.com,ns3.googleghs.com,ns4.googleghs.com' }, 'Google AdSense'),
        option({ value: 'ns1.hitfarm.com,ns2.hitfarm.com' }, 'Hit Farm'),
        option({ value: 'ns1.parked.com,ns2.parked.com' }, 'Parked'),
        option({ value: 'ns1.parkingpanel.com,ns2.parkingpanel.com' }, 'Parking Panel'),
        option({ value: 'ns1.parkingspa.com,ns2.parkingspa.com' }, 'ParkingSpa'),
        option({ value: 'ns1.sedoparking.com,ns2.sedoparking.com' }, 'Sedo'),
        option({ value: 'ns1.smartname.com,ns2.smartname.com' }, 'SmartName'),
        option({ value: 'ns1.trafficz.com,ns2.trafficz.com' }, 'TrafficZ'),
        option({ value: 'ns1.whypark.com,ns2.whypark.com' }, 'WhyPark')
      )
    ];

    if (current == 'ns1.badger.com,ns2.badger.com') current = '';

    if (current) {
      for (var i=0; i < options.length; i++) {
        if (options[i].nodeName == 'OPTGROUP') {
          for (var j=0; j < options[i].childNodes.length; j++) {
            if (options[i].childNodes[j].value && (options[i].childNodes[j].value == current)) {
              options[i].childNodes[j].selected = 'selected';
              return options;
            }
          }
        }
      }
      
      // if we made it this far, set the value of the first option to whatever was passed in
      custom_option.value = current;
    }
         
    return options;
  });

  define('change_name_servers_button', function(domain_info) {
    return div({ style: 'float: right; margin-top: -44px' }, 
      a({ 'class': 'myButton myButton-small', href: curry(change_name_servers_modal, domain_info) }, 'Settings')
    );
  })
}