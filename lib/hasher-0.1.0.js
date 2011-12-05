/**********************************************************************************
 *                                                                                *
 *  Hasher.js - 0.1.0 - A client-side view-controller framework for JavaScript.   *
 *                                                                                *
 *  Copyright (C) 2011 by Warren Konkel                                           *
 *                                                                                *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy  *
 *  of this software and associated documentation files (the "Software"), to deal *
 *  in the Software without restriction, including without limitation the rights  *
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell     *
 *  copies of the Software, and to permit persons to whom the Software is         *
 *  furnished to do so, subject to the following conditions:                      *
 *                                                                                *
 *  The above copyright notice and this permission notice shall be included in    *
 *  all copies or substantial portions of the Software.                           *
 *                                                                                *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR    *
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,      *
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE   *
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER        *
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, *
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN     *
 *  THE SOFTWARE.                                                                 *
 *                                                                                *
 **********************************************************************************/

var Hasher = function(namespace, base) {
  var create_context = function(proto) {
    function Context() {};
    Context.prototype = proto;
    var obj = new Context();
    if (!obj.__proto__) obj.__proto__ = proto;
    return obj;
  }

  if (!Hasher.instance) Hasher.instance = create_context({ 
    define: function(key, value) { 
      this[key] = value;
    }
  });

  if (namespace) {
    if (base && !Hasher.instance[base]) {
      alert('Invalid Hasher parent: ' + base);
    } else {
      if (!Hasher.instance[namespace]) Hasher.instance[namespace] = create_context(base ? Hasher.instance[base] : Hasher.instance);
      return Hasher.instance[namespace];
    }
  } else {
    return Hasher.instance;
  }
};with (Hasher()) {
  define('redefine', function(name, callback) {
    var real_callback = this[name];
    define(name, function() {
      return callback.apply(this, [real_callback].concat(Array.prototype.slice.call(arguments)));
    });
  });

  define('stop_event', function(e) {
    if (!e) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
  });
  
  define('flatten_to_array', function() {
    var stack = Array.prototype.slice.call(arguments);
    var arguments = [];
    while (stack.length > 0) {
      var obj = stack.shift();
      if (obj) {
        if ((typeof(obj) == 'object') && obj.concat) {
          // array? just concat
          stack = obj.concat(stack);
        } else if ((typeof(obj) == 'object') && obj.callee) {
          // explicitly passed arguments object? to another function
          stack = Array.prototype.slice.call(obj).concat(stack);
        } else {
          arguments.push(obj);
        }
      }
    }
    return arguments;
  });

  define('shift_options_from_args', function(args) {
    if ((typeof(args[0]) == 'object') && (typeof(args[0].nodeType) == 'undefined')) {
      return args.shift();
    } else if ((typeof(args[args.length-1]) == 'object') && (typeof(args[args.length-1].nodeType) == 'undefined')) {
      return args.pop();
    } else {
      return {};
    }
  });
  
  define('for_each', function() {
    var objs = flatten_to_array(arguments);
    var callback = objs.pop();
    for (var i=0; i < objs.length; i++) callback(objs[i]);
  });
  
  define('curry', function(callback) {
    var curried_args = Array.prototype.slice.call(arguments,1);
    return (function() {
      callback.apply(null, Array.prototype.concat.apply(curried_args, arguments));
    });
  });  
}
with (Hasher()) {
  Hasher.__initializers = [];

  define('initializer', function(callback) {
    Hasher.__initializers.push(callback);
  });
  
  // setup browser hook
  window.onload = function() {
    for (var i=0; i < Hasher.__initializers.length; i++) Hasher.__initializers[i]();
    delete Hasher.__initializers;
  }
}with (Hasher()) {
  define('element', function() {
    // first argument is element type (div, span, etc)
    var arguments = flatten_to_array(arguments);
    var tag = arguments.shift();
    var element = document.createElement(tag);
    var options = shift_options_from_args(arguments);

    // process attributes
    for (var k in options) {
      if (k.indexOf('on') == 0) {
        var callback = (function(cb) { return function() { cb.apply(element, Array.prototype.slice.call(arguments)); } })(options[k]);
        if (element.addEventListener) {
          element.addEventListener(k.substring(2).toLowerCase(), callback, false);
        } else {
          element.attachEvent(k.toLowerCase(), callback);
        }
      } else if (k == 'class') {
        element.className = options['class'];
      } else if (k == 'style') {
        element.style.cssText = options.style;
      } else {
        element.setAttribute(k, options[k]);
      }
    }
    
    // append child elements
    for (var i=0; i <= arguments.length; i++) {
      if (typeof(arguments[i]) == 'object') {
        element.appendChild(arguments[i]);
      } else if (arguments[i]) {
        element.appendChild(document.createTextNode(arguments[i]));
      }
    }

    return element;
  });

  // simple elements
  for_each(
    'script', 'meta', 'title', 'link', 'script', 'iframe', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'p', 'span', 'img', 'br', 'hr', 'i', 'b', 'strong',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
    'select', 'option', 'textarea', 'button', 'label',
    function(tag) { 
      define(tag, function() { return element(tag, arguments) }); 
    }
  );
  
  define('a', function() { 
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    
    if (options.href && options.href.call) {
      var real_callback = options.href;
      options.href = '';
      options.onClick = function(e) {
        stop_event(e);
        real_callback();
      }
    } else if (options.href && options.href.indexOf('#') != -1) {
      // creating a new function for each link is expensive, so create once and save
      if (!this.a.click_handler) this.a.click_handler = function(e) {
        stop_event(e);
        set_route('#' + this.href.split('#')[1]);
      };
      options.onClick = this.a.click_handler;
    }

    return element('a', options, arguments);
  });
  
  define('form', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    
    if (options.action && options.action.call) {
      var real_callback = options.action;
      options.onSubmit = function(e) {
        stop_event(e);

        var serialized_form = {};
        var elems = this.getElementsByTagName('*');
        for (var i=0; i < elems.length; i++) {
          if (elems[i].name) {
            if (elems[i].tagName == 'SELECT') {
              // TODO: support multiple select
              serialized_form[elems[i].name] = elems[i].options[elems[i].selectedIndex].value;
            } else if ((['radio', 'checkbox'].indexOf(elems[i].getAttribute('type')) == -1) || elems[i].checked) {
              serialized_form[elems[i].name] = elems[i].value;
            } 
          }
        }

        real_callback(serialized_form);
      }
      options.action = '';
    }
    
    return element('form', options, arguments);
  });

  // input types
  for_each(
    'text', 'hidden', 'password', 'checkbox', 'radio', 'submit',
    function(input_type) {
      define(input_type, function() { 
        var arguments = flatten_to_array(arguments);
        var options = shift_options_from_args(arguments);
        options.type = input_type;
        return element('input', options, arguments);
      });
    }
  );

}Hasher.routes = [];

with (Hasher()) {
  // check for new routes on the browser bar every 100ms
  initializer(function() {
    var callback = function() {
      setTimeout(callback, 100);
      var hash = get_route();
      if (hash != Hasher.current_route) set_route(hash, true);
    }
    callback();
  });
 
  // define a route
  //   route('#', function() {})  or  route({ '#': function(){}, '#a': function(){} })
  define('route', function(path, callback) {
    if (typeof(path) == 'string') {
      Hasher.routes.push({
        regex: (new RegExp("^" + path.replace(/:[a-z_]+/g, '([^/]+)') + '$')),
        callback: callback,
				context: this
      });
    } else {
      for (var key in path) {
        this.route(key, path[key]);
      }
    }
  });

  // return the current route as a string from browser bar
  define('get_route', function() {
    var path_bits = window.location.href.split('#');
    var r = '#' + (path_bits[1] || '');
    return r;
  });

  define('set_route', function(path, skip_updating_browser_bar) {
    if (!skip_updating_browser_bar) window.location.href = window.location.href.split('#')[0] + path;
    Hasher.current_route = path;

    for (var i=0; i < Hasher.routes.length; i++) {
      var route = Hasher.routes[i];
      var matches = path.match(route.regex);
      if (matches) {
        if (!route.context.run_filters('before')) return;
        route.callback.apply(null, matches.slice(1));
        if (!route.context.run_filters('after')) return;
        return;
      }
    }

    alert('404 not found: ' + path);
  });

}with (Hasher()) {
  define('render', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);

    options.layout = typeof(options.layout) == 'undefined' ? (options.target ? false : this.default_layout) : options.layout;
    options.target = options.target || document.body;
    if (options.layout) {
      var layout_element = options.layout(arguments);
      if (layout_element.parentNode != options.target) {
        options.target.innerHTML = '';
        options.target.appendChild(layout_element);
      }
    } else {
      options.target.innerHTML = '';
      for (var i=0; i < arguments.length; i++) {
        options.target.appendChild(typeof(arguments[i]) == 'string' ? document.createTextNode(arguments[i]) : arguments[i]);
      }
    }
  });

  define('layout', function(name, callback) {
    define(name, function callback_wrapper(yield) {
      // NOTE: this approach might be sketchy... we're storing state in the function object itself
      if (!callback_wrapper.layout_elem) {
        var tmp_div = div();
        callback_wrapper.layout_elem = callback(tmp_div);
        callback_wrapper.yield_parent = tmp_div.parentNode;
      }
      
      // replace contents and add content
      callback_wrapper.yield_parent.innerHTML='';
      yield = flatten_to_array(yield);
      for (var i=0; i < yield.length; i++) callback_wrapper.yield_parent.appendChild((typeof(yield[i]) == 'string') ? document.createTextNode(yield[i]) : yield[i]);
      
      return callback_wrapper.layout_elem;
    });
  });

}
with (Hasher()) {

  define('before_filter', function(name, callback) {
  	if (!this.hasOwnProperty('before_filters')) this.before_filters = [];
    this.before_filters.push({ name: name, callback: callback, context: this });
  });

  define('after_filter', function(name, callback) {
  	if (!this.hasOwnProperty('after_filters')) this.after_filters = [];
    this.after_filters.push({ name: name, callback: callback, context: this });
  });

  define('run_filters', function(name) {
  	var filters = [];
  	var obj = this;
  	var that = this;
  	while (obj) {
  		if (obj.hasOwnProperty(name + '_filters')) filters = obj[name + '_filters'].concat(filters);
  		obj = obj.__proto__;
  	}
	
	  for (var i=0; i < filters.length; i++) {
      Hasher.running_filters = true;
  		filters[i].callback.call(that);
      delete Hasher.running_filters;

  		if (Hasher.filter_performed_action) {
        var tmp_action = Hasher.filter_performed_action;
        delete Hasher.filter_performed_action;
  		  tmp_action.call(filters[i].context);
  		  return;
  		}
	  }

    return true;
  });

  define('capture_action_if_called_when_filtering', function(method_name) {
    var that = this;
    var real_method = this[method_name];
    define(method_name, function() {
      var this_args = Array.prototype.slice.call(arguments);
      if (Hasher.running_filters) {
        if (Hasher.filter_performed_action) {
          alert('ERROR: double action in filters');
          return;
        }
        Hasher.filter_performed_action = function() { real_method.apply(that, this_args); };
      } else {
        real_method.apply(this, this_args);
      }
    });
  });
  
  capture_action_if_called_when_filtering('set_route');
  capture_action_if_called_when_filtering('render');
}