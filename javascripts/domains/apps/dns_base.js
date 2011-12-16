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
    if (current == 'ns1.badger.com,ns2.badger.com') current = '';
    var dns_providers = [['Custom','']];
    dns_providers = dns_providers.concat([
      ['Rackspace', 'ns1.rackspace.com,ns2.rackspace.com'],
      ['easyDNS', 'adns3.easydns.com,dns1.easydns.com,dns2.easydns.com,ns0.easydns.com,ns1.easydns.com,ns2.easydns.com,ns3.easydns.com,ns6.easydns.com,remote1.easydns.com,remote2.easydns.com,remote3.easydns.com,remote4.easydns.com'],
      ['EveryDNS', 'everydns.com,ns1.everydns.com,ns2.everydns.com,ns3.everydns.com,ns4.everydns.com,ns5.everydns.com'],
      ['DNSMadeEasy', '2.dnsmadeeasy.com,ns.dnsmadeeasy.com,ns0.dnsmadeeasy.com,ns1.dnsmadeeasy.com,ns10.dnsmadeeasy.com,ns11.dnsmadeeasy.com,ns12.dnsmadeeasy.com,ns13.dnsmadeeasy.com,ns14.dnsmadeeasy.com,ns15.dnsmadeeasy.com,ns2.dnsmadeeasy.com,ns3.dnsmadeeasy.com,ns30.dnsmadeeasy.com,ns4.dnsmadeeasy.com,ns5.dnsmadeeasy.com,ns6.dnsmadeeasy.com,ns7.dnsmadeeasy.com,ns8.dnsmadeeasy.com,park1.dnsmadeeasy.com,park2.dnsmadeeasy.com,redun1.dnsmadeeasy.com,s3.dnsmadeeasy.com'],
      ['DynDNS', 'ns.dyndns.com,ns1.dyndns.com,ns2.dyndns.com,ns3.dyndns.com,ns4.dyndns.com,ns5.dyndns.com'],
      ['NO-IP', 'cx2sa.no-ip.com,extasis.no-ip.com,nf1.no-ip.com,nf2.no-ip.com,nf3.no-ip.com,nf4.no-ip.com,nf5.no-ip.com,ns1.no-ip.com,ns2.no-ip.com,ns3.no-ip.com,ns4.no-ip.com,ns5.no-ip.com,static-1.no-ip.com,static-2.no-ip.com,static-3.no-ip.com,wavetgolf.no-ip.com'],
      ['PowerDNS', 'ns1.powerdns.com,ns2.powerdns.com'],
      ['Zerigo', 'dnsimport.zerigo.com'],
      ['UltraDNS', 'pdns1.ultradns.com,pdns2.ultradns.com,udns1.ultradns.com,udns2.ultradns.com'],
      ['ZoneEdit', 'a.gov.zoneedit.com,b.gov.zoneedit.com,c.gov.zoneedit.com,d.gov.zoneedit.com,dns17.zoneedit.com,dns8.zoneedit.com,e.gov.zoneedit.com,f.gov.zoneedit.com,g.gov.zoneedit.com,ms14.zoneedit.com,n2.zoneedit.com,ns1.awregistry.netns16.zoneedit.com,ns1.zoneedit.com,ns10.zoneedit.com,ns11.zoneedit.com,ns12.zoneedit.com,ns13.zoneedit.com,ns14.zoneedit.com,ns15.zoneedit.com,ns16.zoneedit.com,ns17.zoneedit.com,ns18.zoneedit.com,ns19.zoneedit.com,ns2.zoneedit.com,ns3.zoneedit.com,ns4.zoneedit.com,ns5.zoneedit.com,ns6.zoneedit.com,ns7.zoneedit.com,ns8.zoneedit.com,ns9.zoneedit.com,ns93.zoneedit.com,s16.zoneedit.com,t1.zoneedit.com,t2.zoneedit.com,zoneedit.com'],
      ['Heroku', 'ns1.p19.dynect.net,ns2.p19.dynect.net,ns3.p19.dynect.net,ns4.p19.dynect.net'],
      ['sedoparking.com', '1.ns1.sedoparking.com,2.ns2.sedoparking.com,dns1.sedoparking.com,dns2.sedoparking.com,n2.sedoparking.com,n34.sedoparking.com,nd2.sedoparking.com,nns2.sedoparking.com,ns.1.sedoparking.com,ns.2.sedoparking.com,ns.sedoparking.com,ns0.sedoparking.com,ns1.binero.sens1.sedoparking.com,ns1.sedoparking.com,ns1.sedoparking.comns1.sedoparking.com,ns10.sedoparking.com,ns11.sedoparking.com,ns12.sedoparking.com,ns13.sedoparking.com,ns2.sedoparking.com,ns21.sedoparking.com,ns3.sedoparking.com,ns4.sedoparking.com,ns5.sedoparking.com,ns6.sedoparking.com,ns7.sedoparking.com,ns8.sedoparking.com,ns9.sedoparking.com,nsa1.sedoparking.com,nsa2.sedoparking.com,nsi.sedoparking.com,s2.sedoparking.com,sedoparking.com,sn2.sedoparking.com,www.ns1.sedoparking.com,www.ns2.sedoparking.com'],
      ['fastpark.net', 'dns1.fastpark.net,dns2.fastpark.net,fastpark.net,n1.fastpark.net,n2.fastpark.net,ns.fastpark.net,ns1.fastpark.net,ns2.fastpark.net,ns3.fastpark.net,ns4.fastpark.net,nsi.fastpark.net,sn1.fastpark.net,sn2.fastpark.net'],
      ['dsreirection.com', ' '],
      ['whypark.com', 'ns1.whypark.com,ns2.whypark.com,ns3.whypark.com,ns4.whypark.com'],
      ['fabulous.com', 'myns1.fabulous.com,myns2.fabulous.com,ns1.fabulous.com,ns2.fabulous.com,ns3.fabulous.com,ns4.fabulous.com'],
      ['parked.com', 'cname.parked.com,dns1.parked.com,dns2.parked.com,ns1.parked.com,ns2.parked.com,ns3.parked.com,ns4.parked.com,s2.parked.com,ss2.parked.com'],
      ['trafficz.com', 'dns1.trafficz.com,dns2.trafficz.com,ns1.trafficz.com,ns2.trafficz.com,ns3.trafficz.com'],
      ['bodis.com', 'dns1.bodis.com,nd2.bodis.com,ns1.bodis.com,ns2.bodis.com,ns3.bodis.com,ns4.bodis.com,nss.bodis.com'],
      ['parkingspa.com', 'na1.parkingspa.com,na2.parkingspa.com,ns1.parkingspa.com,ns2.parkingspa.com,ns3.parkingspa.com,ns4.parkingspa.com,nstest.parkingspa.com,nstest2.parkingspa.com'],
      ['1plus.net', 'ns97.worldnic.com,ns98.worldnic.com'],
      ['hitfarm.com', 'ns1.hitfarm.com,ns2.hitfarm.com,ns3.hitfarm.com'],
      ['parkingpanel.com', 'ns1.parkingpanel.com,ns2.parkingpanel.com,ns3.parkingpanel.com,ns4.parkingpanel.com'],
      ['smartname.com', 'ms2.smartname.com,ns1.smartname.com,ns2.smartname.com,ns3.smartname.com,ns4.smartname.com'],
      ['dreamhost.com', 'algol.dreamhost.com,bishop.dreamhost.com,bob.dreamhost.com,dns1.dreamhost.com,dns2.dreamhost.com,dns3.dreamhost.com,dreamhost.com,n1.dreamhost.com,ns.3.dreamhost.com,ns.dreamhost.com,ns0.dreamhost.com,ns1.dreamhost.com,ns2.dreamhost.com,ns3.dreamhost.com,ns31.dreamhost.com,ns4.dreamhost.com,ns5.dreamhost.com,ns6.dreamhost.com,nx1.dreamhost.com'],
      ['slicehost.net', 'ns1.slicehost.com,ns2.slicehost.com,ns3.slicehost.com,ns4.slicehost.com'],
      ['softlayer.com', 'ns.softlayer.com,ns1.softlayer.com,ns2.softlayer.com'],
      ['hostgator.com', 'ns1.hostgator.com,ns2.hostgator.com,dns1.hostgator.com,dns2.hostgator.com']
    ].sort(function(x,y){
      var a = x.toString().toUpperCase();
      var b = y.toString().toUpperCase();
      if (a > b)
         return 1
      if (a < b)
         return -1
      return 0;
    }));
    
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