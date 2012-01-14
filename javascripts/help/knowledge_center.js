with (Hasher('KnowledgeCenter', 'Application')) {
 
  route('#knowledge_center', function() {
    render(
      h1('KNOWLEDGE CENTER'),
      div({ id: 'knowledge-center-loader' }, 'Loading...')
    );
    Badger.getKnowledgeCenterArticles(function(response) {
      articles = (response.data || {})
      results = []
      for (var category in articles) {
        results.push([
          h2(category),
          ul (
            articles[category].map(function(article) {
              return li({ 'class': 'article-title' }, a({ href: '#knowledge_center/' + article.id + '-' + article.title.replace(/ /g, '-') }, article.title))
            })
          )
        ])
      }
      render({ target: 'knowledge-center-loader' }, results);
    });
  });

  route('#knowledge_center/:id', function(id) {
    render('');

    Badger.getKnowledgeCenterArticle(id, function(response) {
      if (response.meta.status == 'ok') {
        var article = response.data;
        render(
          h1("Knowledge Center: " + article.category),
          h2(article.title),
          p(article.body)
        );
      } else {
        set_route('#knowledge_center');
      }
    });
  });
}
