with (Hasher.Controller('Application')) {
  initializer(function() {
    BadgerCache.load();

    Badger.onLogin(reload_layout);

    Badger.onLogout(function() {
      BadgerCache.flush();
      reset_layout('dashboard');
      set_route('#');
    });
  });

  define('reload_layout', function() {
    BadgerCache.load();

    // this is a bit ghetto but it works... we save the existing content in the frame, reload the layout, then render the content back in
    var old_yield_parent = Hasher.instance.dashboard.yield_parent;
    window.foobar = Hasher.instance.dashboard.yield_parent
    reset_layout('dashboard');
    render({ layout: dashboard }, old_yield_parent.childNodes);
    update_sidebar();
  })
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
