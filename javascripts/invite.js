with (Hasher.Controller('Invite','Application')) {
  route({
    '#invites': 'invites'
  });

	create_action('invites', function() {
    BadgerCache.getAccountInfo(function(response) {
  		render('invites', response.data.invites_available, response.data.domain_credits);
      Badger.getInviteStatus(function(response) {
        $("#invite-status-holder").html(helper("invite_status", response.data))
      });
    });
	});

	create_action('send_invite', function(data) {
		if(data.first_name == "" || data.last_name == "" || data.invitation_email == "") {
			return $('#send-invite-messages').empty().append( helper('Application.error_message', { data: { message: "First Name, Last Name and Email can not be blank" } }) );
    }
		Badger.sendInvite(data, function(response) {
      BadgerCache.cached_account_info = null
			call_action('Modal.show', 'Invite.send_invite_result', response.data, response.meta.status);
      helper('Application.update_credits');
      redirect_to("#invites");
		});
	});

  create_action('revoke_invite', function(invite_id) {
    Badger.revokeInvite(invite_id, function(response) {
      BadgerCache.cached_account_info = null
      redirect_to('#invites');
      helper('Application.update_credits');
      call_action('Modal.show', 'Invite.revoke_message', response.data, response.meta.status);
    });
  });

  layout('dashboard');
}

with (Hasher.View('Invite', 'Application')) { (function() {
  create_view('invites', function(invites_available, domain_credits) {
    options = [];
    var credits_to_gift = domain_credits > 3 ? 3 : domain_credits
    for(i = 0; i <= credits_to_gift; i++) {
      options.push(option(i.toString()))
    }
		return form({ action: action('send_invite') },
			h1("INVITES"),
      (invites_available <= 0 ? span('Sorry, you don\'t have any invites available right now... check back soon!')
      :[
        p('You have ' + invites_available + ' invites available'),
        div({ id: 'send-invite-messages' }),
        table({ id: 'invitee-information' },
          tr(
            td(label({ 'for': 'first_name' }, 'First Name')),
            td(input({ name: 'first_name', 'class': 'fancy' }))
          ),
          tr(
            td(label({ 'for': 'last_name' }, 'Last Name')),
            td(input({ name: 'last_name', 'class': 'fancy' }))
          ),
          tr(
            td(label({ 'for': 'invitation_email' }, 'Email')),
            td(input({ name: 'invitation_email', 'class': 'fancy' }))
          ),
          domain_credits > 0 ? tr(
            td(label({ 'for': 'credits_to_gift' }, "Credits to Gift: ")),
            td(select({ name: 'credits_to_gift' }, options))
          ) : '',
          tr(
            td(label({ 'for': 'custom_message' }, 'Custom Message')),
            td(textarea({ name: 'custom_message' }))
          ),
          tr(
            td(),
            td(input({ 'class': 'myButton', type: 'submit', value: 'Send' }))
          )
        )
      ]
      ),
      div({ id: "invite-status-holder" })
		);
  });

  create_helper('invite_status', function(invites) {
    return table({ 'class': 'fancy-table invite-status-table' },
      tr(
        th("Name"),
        th("Email"),
        th("Date Sent"),
        th({'class': 'center' }, "Domain Credits"),
        th({'class': 'center' }, "Accepted"),
        th({'class': 'center' }, "Revoke")
      ),

      invites.map(function(invite) {
        return tr(
          td(invite.name),
          td(invite.email),
          td({'class': 'center' }, new Date(Date.parse(invite.date_sent)).toDateString()),
          td({'class': 'center' }, invite.domain_credits),
          td({'class': 'center' }, invite.accepted ? "Yes" : "No"),
          invite.accepted ? td()
          : invite.revoked_at ? td({ 'class': 'center' }, 'Revoked on ' + new Date(Date.parse(invite.revoked_at)).toDateString())
          : td({ 'class': 'center' }, a({ href: action('Invite.revoke_invite', invite.id), 'class': 'myButton revoke-button', value: "submit" }, "Revoke"))
        )
      })
    )
	});

  create_helper('send_invite_result', function(data, status) {
    return div(
      h1("Invitation Message"),
      p( { 'class': status == 'ok' ? '': 'error-message'}, data.message),
      a({ href: action('Modal.hide'), 'class': 'myButton', value: "submit" }, "Close")
		);
	});

  create_helper('revoke_message', function(data, status) {
    return div (
      h1("Revoke Result Message"),
      p( {'class': status == 'ok' ? '' : 'error-message'}, data.message),
      a({ href: action('Modal.hide'), 'class': 'myButton', value: "submit" }, "Close")
    );
  });
})(); }
