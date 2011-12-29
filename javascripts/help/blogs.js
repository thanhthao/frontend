with (Hasher('Blogs', 'Application')) {
  layout('dashboard');

  route('#blogs', function() {
    render(
      h1('BADGER BLOG'),
      div({ id: 'blog-loader' }, 'Loading...')
    );

    Badger.getBlogs(function(response) {
      render({ target: 'blog-loader' }, response.data.map(function(blog) {
        var blog_body = p();
        blog_body.innerHTML = blog.body;
        return [
          h2({ 'class': 'blog-title' }, a({ href: '#blogs/' + blog.id + '-' + blog.title.replace(/ /g, '-') }, blog.title)),
          div({ 'class': 'blog-info' }, 'by ' + blog.author + ' on ' + new Date(Date.parse(blog.published_at)).toDateString()),
          blog_body
        ]
      }));
    });
  });
  
  route('#blogs/:id', function(id) {
    render('');

    Badger.getBlog(id.split('-')[0], function(response) {
      if (response.meta.status == 'ok') {
        var blog = response.data;
        var blog_body = p();
        blog_body.innerHTML = blog.body;
        render(
          h1(blog.title),
          div({ 'class': 'blog-info' }, 'by ' + blog.author + ' on ' + new Date(Date.parse(blog.published_at)).toDateString()),
          blog_body
        );
      } else {
        set_route('#blogs');
      }
    });
  });
  
}
