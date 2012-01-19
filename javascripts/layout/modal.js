with (Hasher('Application')) {
  define('show_modal', function() {
    var args = flatten_to_array(arguments);
    var options = shift_options_from_args(args);
    
    if ($('#modal-dialog').length > 0) hide_modal();
    
    var ie_browser = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
    document.body.appendChild(
      div({ 
        'id': 'modal-dialog', 
        'class': (ie_browser? 'ie-modal-dialog ' : '') + 'modal-dialog'

        // disabling "click on background to hide modal" functionality for now... it's too easy
        // to accidently lose your progress. need a "are you sure you want to close the modal"
        // dialog if you're in the middle of filling out a form.
        //onclick: function(e) { if (e.target && e.target.id == 'modal-dialog') hide_modal(); }
      },
        div({ id: 'modal-content', style: options.style },
          a({ href: hide_modal, 'class': 'close-button' }, 'X'),
          div({ id: 'modal-message' }),
          div({ id: 'modal-wrapper'}, args)
        )
      )
    );
    
    // Fix placeholder does not work in IE
    Placeholder.fix_ie();
  });
  
  define('start_modal_spin', function(message) {
    $('#modal-message').html(message || '');
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
