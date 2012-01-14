with (Hasher('Help','Application')) {
  route({
    '#knowledge-base': 'knowledge_base',
    '#tickets': 'tickets'
  });
  
  layout('dashboard');
}

with (Hasher('Help', 'Application')) { (function() {

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
