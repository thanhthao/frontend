if (localStorage.getItem('badger_api') == 'dev') {
  Badger.api_host = 'http://api.badger.dev/';
  Badger.access_token_key = 'badger_access_token_dev';
} else if (localStorage.getItem('badger_api') == 'qa') {
  Badger.api_host = 'https://api-qa.badger.com/';
  Badger.access_token_key = 'badger_access_token_qa';
} else {
  Badger.api_host = 'https://api.badger.com/';
  Badger.access_token_key = 'badger_access_token_prod';
}

Badger.getAccessToken = function() { return localStorage.getItem(Badger.access_token_key); }
Badger.setAccessToken = function(token) { token ? localStorage.setItem(Badger.access_token_key, token) : localStorage.removeItem(Badger.access_token_key); }

with (Hasher()) {
  define('set_api_host', function(env) {
    localStorage.setItem('badger_api', env);
    document.location.reload();
  });

  after_filter('add_dev_mode_bar', function() {
    if (!document.getElementById('dev-bar')) { 
      document.body.appendChild(
        div({ id: 'dev-bar', style: "position: absolute; top: 0; right: 0; background: white; color: black; padding: 5px" }, 
          (Badger.api_host == 'http://api.badger.dev/' ? b('dev') : a({ href: curry(set_api_host, 'dev') }, 'dev')), 
          ' | ',
          (Badger.api_host == 'https://api-qa.badger.com/' ? b('qa') : a({ href: curry(set_api_host, 'qa') }, 'qa')), 
          ' | ',
          (Badger.api_host == 'https://api.badger.com/' ? b('prod') : a({ href: curry(set_api_host, 'prod') }, 'prod'))
        )
      );
    }
  });
}
