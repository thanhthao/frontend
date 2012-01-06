with (Hasher.Controller('RhinoNames', 'Application')) {
  route('#rhinonames', function() {
    render(
      h1('RhinoNames is now a part of Badger.com!'),
      p("Great News! In order to provide you with the best service possible, RhinoNames is now a part of Badger.com!  If you previously purchased a domain through rhinonames.com, you can ", a({ href: '#login' }, "login with your RhinoNames email/password"), '.  Otherwise, ', a({ href: '#' }, 'check out Badger.com'), ' and tell us what you think.'),
      p("If you have any questions, please feel free to email us at ", a({ href: 'mailto:support@badger.com' }, 'support@badger.com'), '.'),
      p('Sincerely,'),
      p("The Badger Team")
    );
  });

  layout('dashboard');
}
