with (Hasher('Invite','Application')) {
  route('#invites', function() {
    var target_h1 = h1('SENT INVITES');
    var target_div = div('Loading...');
    var target_button_area = div({ style: 'float: right; margin-top: -44px' });
    
    render(
      target_h1,
      target_button_area,
      target_div
    );
    
    BadgerCache.getAccountInfo(function(response) {
      BadgerCache.getInviteStatus(function(invite_status) {
        var invites_available = response.data.invites_available;
        var domain_credits = response.data.domain_credits;
        var sent_invites_count = invite_status.data.length;
        
        if (sent_invites_count > 0) render({ target: target_h1 }, 'SENT INVITES (' + sent_invites_count + ')');

        if (invites_available) {
          render({ target: target_button_area }, 
            a({ 'class': 'myButton small', href: curry(Invite.send_invite_modal, domain_credits) }, 'Send Invite')
          );
        }

        render({ target: target_div }, 
          (sent_invites_count > 0) ? table({ 'class': 'fancy-table invite-status-table' },
            tbody(
              tr(
                th("Date"),
                th("Name"),
                th("Email"),
                th({'class': 'center' }, "Credits"),
                th({'class': 'center' }, "Accepted")
              ),

              invite_status.data.map(function(invite) {
                return tr(
                  td(new Date(Date.parse(invite.date_sent)).toDateString()),
                  td(invite.name),
                  td(invite.email),
                  td({'class': 'center' }, invite.domain_credits),
                  invite.accepted ? td({ 'class': 'center' }, 'Yes')
                  : invite.revoked_at ? td({ 'class': 'center' }, 'Revoked')
                  : td({ 'class': 'center' }, 'No - ', a({ href: curry(Invite.revoke_invite, invite.id) }, "Revoke?"))
                )
              })
            )
          ) : "You haven't sent any invites yet!"
          
        );
        
      });
    });
	});

	define('send_invite', function(data) {
		if(data.first_name == "" || data.last_name == "" || data.invitation_email == "") {
			return $('#send-invite-messages').empty().append( error_message({ data: { message: "First Name, Last Name and Email can not be blank" } }) );
    }
		Badger.sendInvite(data, function(response) {
      BadgerCache.flush('account_info');
      BadgerCache.flush('invite_status');
			send_invite_result(response.data, response.meta.status);
      update_credits();
      update_invites_available();
      set_route("#invites");
		});
	});

  define('revoke_invite', function(invite_id) {
    Badger.revokeInvite(invite_id, function(response) {
      BadgerCache.flush('account_info');
      BadgerCache.flush('invite_status');
      set_route('#invites');
      update_credits();
      update_invites_available();
      revoke_message(response.data, response.meta.status);
    });
  });

  define('send_invite_modal', function(domain_credits) {
    options = [];
    var credits_to_gift = domain_credits > 3 ? 3 : domain_credits
    for(var i = 0; i <= credits_to_gift; i++) {
      options.push(option(i.toString()))
    }

		show_modal(
  		form({ action: send_invite },
        h1('SEND INVITE'),
  			div({ id: 'send-invite-messages' }),
          table({ id: 'invitee-information' },
            tbody(
              tr(
                td(label({ 'for': 'first_name' }, 'First Name:')),
                td(input({ name: 'first_name', 'class': 'fancy' }))
              ),
              tr(
                td(label({ 'for': 'last_name' }, 'Last Name:')),
                td(input({ name: 'last_name', 'class': 'fancy' }))
              ),
              tr(
                td(label({ 'for': 'invitation_email' }, 'Email Address:')),
                td(input({ name: 'invitation_email', 'class': 'fancy' }))
              ),
              tr(
                td({ style: 'vertical-align: top' }, label({ 'for': 'custom_message' }, 'Custom Message:')),
                td(textarea({ name: 'custom_message' }))
              ),
              domain_credits > 0 ? tr(
                td(label({ 'for': 'credits_to_gift' }, "Credits to Gift: ")),
                td(select({ name: 'credits_to_gift' }, options), ' of my Credits')
              ) : ''
            )
          ),
        
          div({ style: 'text-align: center; margin-top: 20px' }, input({ 'class': 'myButton', type: 'submit', value: 'Send Invitation' })
        )
      )
		);
	});

  define('send_invite_result', function(data, status) {
    show_modal(
      div(
        h1("Invitation Message"),
        p( { 'class': status == 'ok' ? '': 'error-message'}, data.message),
        a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
      )
		);
	});

  define('revoke_message', function(data, status) {
    show_modal(
      div (
        h1("Revoke Result Message"),
        p( {'class': status == 'ok' ? '' : 'error-message'}, data.message),
        a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
      )
    );
  });

}
