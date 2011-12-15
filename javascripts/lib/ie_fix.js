/**********************************************************************************
 * Fix IE, console is not defined.
 **********************************************************************************/

if (!window.console) console = {log: function() {}};

/**********************************************************************************
 * Fix IE, some function of arrays does not work correctly (map, etc.)
 **********************************************************************************/
'use strict';

// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
    Function.prototype.bind= function(owner) {
        var that= this;
        if (arguments.length<=1) {
            return function() {
                return that.apply(owner, arguments);
            };
        } else {
            var args= Array.prototype.slice.call(arguments, 1);
            return function() {
                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
    String.prototype.trim= function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}

/**********************************************************************************
 * Fix placeholder does not work in IE
 **********************************************************************************/

jQuery(function() {
	jQuery.support.placeholder = false;
	test = document.createElement('input');
	if('placeholder' in test) jQuery.support.placeholder = true;
});
var Placeholder = {
  fix_ie: function() {
    if(!$.support.placeholder) {
      var focuser = function () {
        if ($(this).attr('placeholder') != '' && $(this).attr('placeholder') != null && $(this).val() == $(this).attr('placeholder')) {
          $(this).val('').removeClass('has-placeholder');
        }
      };
      var blurer = function () {
        if ($(this).attr('placeholder') != '' && $(this).attr('placeholder') != null && ($(this).val() == '' || $(this).val() == $(this).attr('placeholder'))) {
          $(this).val($(this).attr('placeholder')).addClass('has-placeholder');
        }
      };

      $.each([':text', ':password', 'textarea'], function() {
        $(this.toString()).focus(focuser).blur(blurer).each(function(index,element) {
          if (document.activeElement != element) blurer.call(element);
        });
      });

      $('form').submit(function () {
        $(this).find('.has-placeholder').each(function() { $(this).val(''); });
      });
    }
}};

/**********************************************************************************
 * Remove css outline on left-menu in Internet Explorer 7
 **********************************************************************************/

var OutlineFix = {
  fix_ie_7: function() {
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) && (new Number(RegExp.$1) == 7)) {
//      With this option, we cannot see the outline around the item in side-nav when we using tab
//      $('#sidebar a').focus(function() {
      $('#sidebar a').click(function() {
        $(this).attr("hideFocus", "true").css("outline", "none");
      })
    }
  }
}
