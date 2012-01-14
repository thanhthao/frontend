// this file should be avoided if possible... this is a backwards compatibilty layer with 0.0.5
with (Hasher()) {
  
  define('input', function() { 
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    return this[options.type || 'text'](options, arguments);
  });
  
  
  
  // performed_action is used for the legacy "render default view if no render/set_route"
  redefine('render', function(callback) {
    Hasher.performed_action = true;
    callback.apply(this, Array.prototype.slice.call(arguments,1));
  });

  redefine('set_route', function(callback) {
    Hasher.performed_action = true;
    callback.apply(this, Array.prototype.slice.call(arguments,1));
  });
  
  redefine('route', function(real_route, hash) {
    if (typeof(hash) == 'string') return real_route.apply(this, Array.prototype.slice.call(arguments, 1));

    var that = this;
    for (var key in hash) {
      (function(key,hash) {
        real_route.call(that, key, function() {
          // run callback
          Hasher.performed_action = false;
          var callback = that['action_' + hash[key]] || function(){};
          callback.apply(that, Array.prototype.slice.call(arguments));

          // render default action
          if (!Hasher.performed_action && that['view_' + hash[key]]) {
            that.render(that['view_' + hash[key]].call(this));
          }
          
          delete Hasher.performed_action;
        });
      })(key, hash);
    }
  });
  
  redefine('render', function(real_render, view_name) {
    if ((typeof(view_name) == 'string') && this['view_' + view_name]) { 
      real_render.call(this, this['view_' + view_name].apply(this, Array.prototype.slice.call(arguments,2)));
    } else {
      real_render.apply(this, Array.prototype.slice.call(arguments,1));
    }
  });

  // add in legacy events hash
  redefine('element', function(callback) {
    var arguments = flatten_to_array(arguments).slice(1);
    var tag = arguments.shift();
    var options = shift_options_from_args(arguments);
    if (options.events) {
      var events = options.events;
      delete options.events;
      for (var k in events) {
        options['on' + k] = events[k];
      }
    }
    return callback.call(this, tag, options, arguments);
  });

  redefine('layout', function(real_layout, name, callback) {
    if (!callback) {
      this.default_layout = this[name];
    } else {
      real_layout.apply(this, Array.prototype.slice.call(arguments,1));
    }
  });

}