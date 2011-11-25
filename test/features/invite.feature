Feature: Invite

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I am on the invites page

  Scenario: As I have invites available, I should be able to send out invitation when I input correct information
    Then I should see "You have 5 invites available"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "test@example.com"
    And I mock sendInvite with status "ok"
    And I press "Send"
    Then I should see "Invitation Message"
    Then I should see "Notification message"

  Scenario: As I have invites available, I should not be able to send out invitation when I input incorrect information
    Then I should see "You have 5 invites available"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "testexample.com"
    And I mock sendInvite with status "bad_request"
    And I press "Send"
    Then I should see "Invitation Message"
    Then I should see "Notification message"

  Scenario: As I have invites available, I should not be able to send out invitation when I leave the fields empty
    Then I should see "You have 5 invites available"
    And I press "Send"
    Then I should see "First Name, Last Name and Email can not be blank"

  Scenario: As I have no invites available, I should not be able to send out invitation
    Given I logged in with mock data for domains and user info with 35 domain credits and 0 invites available
    And I am on the invites page
    Then I should see "Sorry, you don't have any invites available right now... check back soon!"
    And I should not see "Send"