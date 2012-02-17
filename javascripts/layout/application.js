with (Hasher('Application')) {
  initializer(function() {
    BadgerCache.load();

    Badger.onLogin(function() {
      BadgerCache.load();

      // this is a bit ghetto but it works... we save the existing content in the frame, reload the layout, then render the content back in
      var old_yield_parent = Hasher.instance.default_layout.yield_parent;
      window.foobar = Hasher.instance.default_layout.yield_parent
      reset_layout('default_layout');
      render({ layout: default_layout }, old_yield_parent.childNodes);
      update_sidebar();
    });

    Badger.onLogout(function() {
      BadgerCache.flush();
      reset_layout('default_layout');
      set_route('#welcome');
    });
  });
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
