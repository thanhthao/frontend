with (Hasher.Controller('Faqs', 'Application')) {
  route({
    '#faqs': 'faqs'
  });

  create_action('faqs', function() {
    Badger.getFaqs(function(response) {
      render('faqs', response.data);
    });
  });

  layout('dashboard');
}

with (Hasher.View('Faqs', 'Application')) {
  create_view('faqs', function(faqs) {
    faqs = (faqs || [])
    var result = faqs.map(function(faq) {
      return [
        h2({ 'class': 'faq-title' }, faq.question),
        p(faq.answer)
      ]
    })
    return div(
      h1('FREQUENTLY ASKED QUESTIONS'),
      result
    )
  });
}
