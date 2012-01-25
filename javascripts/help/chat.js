with (Hasher('Chat', 'Application')) {

  define('show_chat', function(callback) {
    $('#chatbar div.content').html(iframe({ 'src': '/chat/qui.html' }));
    $('#chatbar').addClass('active');
    $('#footer').addClass('chatbar');
  });

  define('hide_chat', function(callback) {
    $('#chatbar').removeClass('active');
    $('#footer').removeClass('chatbar');
    $('#chatbar div.content').html('');
  });
}
