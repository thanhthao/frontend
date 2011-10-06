with (Hasher.Controller('Modal')) {
  create_action('show', function() {
    document.body.appendChild(helper('modal', helper.apply(null, Array.prototype.slice.call(arguments))));
  });
  
  create_action('hide', function() {
    $('#modal-dialog').remove();
  });
}

with (Hasher.View('Modal')) {
  create_helper('modal', function() {
    return div({ id: 'modal-dialog', events: { click: function(e) { if (e.target.id == 'modal-dialog') action('hide').call(); } } },
      div({ id: 'modal-content' }, 
        a({ href: action('hide'), 'class': 'close-button' }, 'X'),
        Array.prototype.slice.call(arguments)
      )
    );
  });
}