with (Hasher.Controller('KnowledgeCenter', 'Application')) {
  route({
    '#knowledge_center': 'knowledge_center',
    '#knowledge_center/:id': 'view_article'
  });

  create_action('knowledge_center', function() {
    Badger.getKnowledgeCenterArticles(function(response) {
      render('knowledge_center', response.data);
    });
  });

  create_action('view_article', function(id) {
    Badger.getKnowledgeCenterArticle(id, function(response) {
      if (response.meta.status == 'ok')
        render('view_article', response.data);
      else {
        alert(response.data.message);
        redirect_to('#knowledge_center');
      }
    });
  });

  layout('dashboard');
}

with (Hasher.View('KnowledgeCenter', 'Application')) {
  create_view('knowledge_center', function(articles) {
    articles = (articles || {})
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

    return div(
      h1('KNOWLEDGE CENTER'),
      results
    )
  });

  create_view('view_article', function(article) {
    article = (article || {})
    return div(
      h1("Knowledge Center: " + article.category),
      h2(article.title),
      p(article.body)
    )
  });
}