with (Hasher('Application')) {
  define('show_modal', function() {
    if ($('#modal-dialog').length > 0) hide_modal();
    
    var ie_browser = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
    document.body.appendChild(
      div({ 
        'id': 'modal-dialog', 
        'class': (ie_browser? 'ie-modal-dialog ' : '') + 'modal-dialog', 
        onclick: function(e) { if (e.target && e.target.id == 'modal-dialog') hide_modal(); } 
      },
        div({ id: 'modal-content' },
          a({ href: hide_modal, 'class': 'close-button' }, 'X'),
          div({ id: 'modal-wrapper'},
            Array.prototype.slice.call(arguments)
          )
        )
      )
    );
    
    // Fix placeholder does not work in IE
    Placeholder.fix_ie();
  });
  
  define('start_modal_spin', function() {
    $('#modal-content').addClass('spinner');
  });

  define('stop_modal_spin', function() {
    $('#modal-content').removeClass('spinner');
  });
  
  define('spin_modal_until', function(callback) {
    start_modal_spin();
    return function() {
      stop_modal_spin();
      callback.apply(this, Array.prototype.slice.call(arguments));
    }
  });
  
  define('hide_modal', function() {
    $('#modal-dialog').remove();
  });
}
