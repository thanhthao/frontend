with (Hasher.Controller('Application')) {
  initializer(function() {
    // local cache
    Badger.onLogin(BadgerCache.load);
    Badger.onLogout(BadgerCache.flush);
    BadgerCache.load();

    Badger.onLogout(function() {
      var path = document.location.href.split('#')[0];
      if (document.location.href == path) document.location.reload();
      else document.location.href = path;
    });
  });

  before_filter('redirect_to_root_unless_logged_in', function() {
    // if they have an access token (logged in), skip everything
    if (Badger.getAccessToken()) return;

    // hack until skip_before_filters works
    if (Hasher.Routes.getHash().match(/^#(rhinonames|request_invite|login|register_terms_of_service|register\/.*)$/)) return;
    if (Hasher.Routes.getHash().match(/^#confirm_email\/.*$/)) {
      Badger.back_url = Hasher.Routes.getHash();
      redirect_to('#login');
    } else {
      // got this far? send 'em away
      redirect_to('#request_invite');
    }
  });

}

with (Hasher.View('Application')) {

}

String.prototype.capitalize_all = function() {
	var words = [];
	this.split(' ').forEach(function(word) {
		words.push( word.charAt(0).toUpperCase() + word.slice(1) );
	});
	return words.join(" ");
}

String.prototype.capitalize_first = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
