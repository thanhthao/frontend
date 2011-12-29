with (Hasher.Controller('Blogs', 'Application')) {
  route({
    '#blogs': 'blogs',
    '#blogs/:id': 'view_blog'
  });

  create_action('blogs', function() {
    Badger.getBlogs(function(response) {
      render('blogs', response.data);
    });
  });

  create_action('view_blog', function(id) {
    Badger.getBlog(id.split('-')[0], function(response) {
      if (response.meta.status == 'ok')
        render('view_blog', response.data);
      else {
        alert(response.data.message);
        redirect_to('#blogs');
      }
    });
  });

  layout('dashboard');
}

with (Hasher.View('Blogs', 'Application')) {
  create_view('blogs', function(blogs) {
    var result = blogs.map(function(blog) {
      return [
        h2({ 'class': 'blog-title' }, a({ href: '#blogs/' + blog.id + '-' + blog.title.replace(/ /g, '-') }, blog.title)),
        div({ 'class': 'blog-info' }, 'by ' + blog.author + ' on ' + new Date(Date.parse(blog.published_at)).toDateString()),
        p(blog.body)
      ]
    })
    return div(
      h1('BLOGS'),
      result
    )
  });

  create_view('view_blog', function(blog) {
    return div(
      h1(blog.title),
      div({ 'class': 'blog-info' }, 'by ' + blog.author + ' on ' + new Date(Date.parse(blog.published_at)).toDateString()),
      p(blog.body)
    )
  });
}