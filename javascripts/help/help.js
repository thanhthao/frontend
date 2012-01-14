with (Hasher('Help','Application')) {
  route({
    '#knowledge-base': 'knowledge_base',
    '#tickets': 'tickets'
  });
  
  layout('dashboard');
}

with (Hasher('Help', 'Application')) { (function() {

  define('knowledge_base', function() {
    return div(
      h1('Knowledge Base'),
      'Welcome!'
    );
  });

  define('tickets', function() {
    return div(
      h1('Support Tickets'),
      'Welcome!'
    );
  });

})(); }
