with (Hasher('Faqs', 'Application')) {

  route('#faqs', function() {
    var target_div = div('Loading...');

    render(
      h1('FREQUENTLY ASKED QUESTIONS'),
      target_div
    );
    
    Badger.getFaqs(function(response) {
      render({ target: target_div }, 
        (response.data||[]).map(function(faq) {
          return [
            h2({ 'class': 'faq-title' }, faq.question),
            p(faq.answer)
          ]
        })
      );
    });
  });

}
