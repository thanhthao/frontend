with (Hasher('Chat', 'Application')) {

  define('show_chat', function(callback) {
    if ($('#chatbar div.content iframe').length == 0) {
      $('#chatbar div.content').html(iframe({ 'src': '/chat/qui.html' }));
      $('#chatbar').removeClass('closed');
      $('#chatbar').addClass('active');
    } else if ($('#chatbar').hasClass('minimized')) {
      maximize_chat();
    }
    $('#footer').addClass('chatbar');
  });

  define('hide_chat', function(callback) {
    $('#chatbar').addClass('closed');
    $('#chatbar').removeClass('active');
    $('#footer').removeClass('chatbar');
    $('#chatbar div.content').html('');
  });

  define('minimize_chat', function(callback) {
    $('#chatbar').addClass('minimized');
    $('#footer').removeClass('chatbar');
  });

  define('maximize_chat', function(callback) {
    $('#chatbar').removeClass('minimized');
    $('#footer').addClass('chatbar');
  });

}
