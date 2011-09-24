with (Hasher.Controller('Help','Application')) {
  route({
    '#help-and-support': 'help_and_support',
    '#knowledge-base': 'knowledge_base',
    '#tickets': 'tickets'
  });
  
  layout('dashboard');
}

with (Hasher.View('Help', 'Application')) { (function() {

  create_view('help_and_support', function() {
    return div(
      h1('Help and Support'),
      'Welcome!'
    );
  });

  create_view('knowledge_base', function() {
    return div(
      h1('Knowledge Base'),
      'Welcome!'
    );
  });

  create_view('tickets', function() {
    return div(
      h1('Support Tickets'),
      'Welcome!'
    );
  });

})(); }
