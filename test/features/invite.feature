Feature: Invite
  In order to invite my friends to join the site
  As a logged-in user
  I want to send my friends invitations

  Scenario: As I have invites available and history of sent invites I should see my history of sent invites
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 1 revoked
    And I am on the invites page
    Then I should see item with xpath "//span[@id='user_nav_invites_available']"
    And I should see "5 invites"
    And I should see "SEND INVITES (5)"
    And I should see "Email" within ".invite-status-table"
    And I should see "Date Sent" within ".invite-status-table"
    And I should see "Domain Credits" within ".invite-status-table"
    And I should see "Accepted" within ".invite-status-table"
    And I should see "Accepted Full Name 0" within ".invite-status-table"
    And I should see "Pending Full Name 0" within ".invite-status-table"
    And I should see "accepted_invite0@example.com" within ".invite-status-table"
    And I should see "pending_invite0@example.com" within ".invite-status-table"
    And I should see "revoked_invite0@example.com" within ".invite-status-table"
    And I should see "Sat Nov 12 2011" within ".invite-status-table"
    And I should see "Wed Oct 12 2011" within ".invite-status-table"
    And I should see "Yes" within ".invite-status-table"
    And I should see "No" within ".invite-status-table"
    And I should see "Revoked on Mon Dec 12 2011" within ".invite-status-table"
    And I should see a link with href "#invites"

  Scenario: As I have no invites available yet I have history of sent invites I should see my history of sent invites
    Given I logged in with mock data for domains and user info with 35 domain credits and 0 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 1 revoked
    And I am on the invites page
    Then I should see item with xpath "//span[@id='user_nav_invites_available' and @class='hidden']"
    And I should see "Email" within ".invite-status-table"
    And I should see "Date Sent" within ".invite-status-table"
    And I should see "Domain Credits" within ".invite-status-table"
    And I should see "Accepted" within ".invite-status-table"
    And I should see "Accepted Full Name 0" within ".invite-status-table"
    And I should see "Pending Full Name 0" within ".invite-status-table"
    And I should see "accepted_invite0@example.com" within ".invite-status-table"
    And I should see "pending_invite0@example.com" within ".invite-status-table"
    And I should see "revoked_invite0@example.com" within ".invite-status-table"
    And I should see "Sat Nov 12 2011" within ".invite-status-table"
    And I should see "Wed Oct 12 2011" within ".invite-status-table"
    And I should see "Yes" within ".invite-status-table"
    And I should see "No" within ".invite-status-table"
    And I should see "Revoked on Mon Dec 12 2011" within ".invite-status-table"
    And I should see a link with href "#invites"

  Scenario: As I have no invites available and no history of sent invites, I should not be able to send out invitation
    Given I logged in with mock data for domains and user info with 35 domain credits and 0 invites available
    And I mock getInviteStatus with 0 accepted and 0 pending and 0 revoked
    And I am on the invites page
    Then I should see item with xpath "//span[@id='user_nav_invites_available' and @class='hidden']"
    And I should see "Sorry, you don't have any invites available right now... check back soon!"

  Scenario: As I have invites available and domain credits, I should be able to send out invitation with credits to gift when I input correct information
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 0 pending revoked
    And I am on the invites page
    Then I should see "You have 5 invites available."
    Then I follow "Send Invite"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "test@example.com"
    And I fill in "custom_message" with "hi, check this out!"
    And the "credits_to_gift" drop-down should contain the option "0"
    And the "credits_to_gift" drop-down should contain the option "1"
    And the "credits_to_gift" drop-down should contain the option "2"
    And the "credits_to_gift" drop-down should contain the option "3"
    And I select "3" from "credits_to_gift"
    And I mock sendInvite with status "ok"
    And I press "Send"
    Then I should see "Invitation Message"
    And I should see "Notification message"

  Scenario: As I have invites available and no domain credits, I should not be able to see credits_to_gift drop box
    Given I logged in with mock data for domains and user info with 0 domain credits and 5 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 0 pending revoked
    And I am on the invites page
    Then I should see "You have 5 invites available"
    Then I follow "Send Invite"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "test@example.com"
    And I fill in "custom_message" with "hi, check this out!"
    And I should not see item with xpath "//select[@name='credits_to_gift']"

  Scenario: As I have invites available and 2 domain credits, I should be able to see credits_to_gift drop box with options 0, 1, 2 only
    Given I logged in with mock data for domains and user info with 2 domain credits and 5 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 0 revoked
    And I am on the invites page
    Then I should see "You have 5 invites available"
    Then I follow "Send Invite"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "test@example.com"
    And I fill in "custom_message" with "hi, check this out!"
    And I should see item with xpath "//select[@name='credits_to_gift']"
    And the "credits_to_gift" drop-down should contain the option "0"
    And the "credits_to_gift" drop-down should contain the option "1"
    And the "credits_to_gift" drop-down should contain the option "2"
    And the "credits_to_gift" drop-down should not contain the option "3"

  Scenario: As I have invites available, I should not be able to send out invitation when I input incorrect information
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 0 revoked
    And I am on the invites page
    Then I should see "You have 5 invites available"
    Then I follow "Send Invite"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "testexample.com"
    And I mock sendInvite with status "bad_request"
    And I press "Send"
    Then I should see "Invitation Message"
    And I should see "Notification message"

  Scenario: As I have invites available, I should not be able to send out invitation when I leave the fields empty
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 0 revoked
    And I am on the invites page
    Then I should see "You have 5 invites available"
    Then I follow "Send Invite"
    And I press "Send"
    Then I should see "First Name, Last Name and Email can not be blank"

  Scenario: As I revoke a sent invite, I want to see it updated on the page
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getInviteStatus with 1 accepted and 1 pending and 0 revoked
    And I am on the invites page
    And I mock revokeInvite with status "ok" and message "Revoke invite successfully"
    And I follow "Revoke"
    Then I should see "Revoke Result Message"
    And I should see "Revoke invite successfully"
