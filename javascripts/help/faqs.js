with (Hasher('Faqs', 'Application')) {
  route({
    '#faqs': 'faqs'
  });

  define('faqs', function() {
    Badger.getFaqs(function(response) {
      render('faqs', response.data);
    });
  });

 }

with (Hasher('Faqs', 'Application')) {
  define('faqs', function(faqs) {
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
