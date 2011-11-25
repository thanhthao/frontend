with (Hasher.Controller('Invite','Application')) {
  route({
    '#invites': 'invites'
  });

	create_action('invites', function() {
    BadgerCache.getAccountInfo(function(response) {
  		render('invites', response.data.invites_available);
    });
	});

	create_action('send_invite', function(data) {
		if(data.first_name == "" || data.last_name == "" || data.invitation_email == "") {
			return $('#send-invite-messages').empty().append( helper('Application.error_message', { data: { message: "First Name, Last Name and Email can not be blank" } }) );
    }
		Badger.sendInvite(data, function(response) {
      BadgerCache.cached_account_info = null
			call_action('Modal.show', 'Invite.send_invite_result', response.data, response.meta.status);
      redirect_to("#invites")
		});
	});

  layout('dashboard');
}

with (Hasher.View('Invite', 'Application')) { (function() {
  create_view('invites', function(invites_available) {
		return form({ action: action('send_invite') },
			h1("INVITES"),
      (invites_available <= 0 ? span('Sorry, you don\'t have any invites available right now... check back soon!')
      :[
        p('You have ' + invites_available + ' invites available'),
        div({ id: 'send-invite-messages' }),
        input({ name: 'first_name', 'class': 'fancy', placeholder: 'First Name' }),
        input({ name: 'last_name', 'class': 'fancy', placeholder: 'Last Name' }),
        input({ name: 'invitation_email', 'class': 'fancy', placeholder: 'Email' }),
        input({ 'class': 'myButton', type: 'submit', value: 'Send' })
      ]
      )
		);
  });

  create_helper('send_invite_result', function(data, status) {
    return div(
      h1("Invitation Message"),
      p( { 'class': status == 'ok' ? '': 'error-message'}, data.message),
      a({ href: action('Modal.hide'), 'class': 'myButton', value: "submit" }, "Close")
		);
	});
})(); }
