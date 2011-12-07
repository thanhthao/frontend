Feature: Invite
  In order to invite my friends to join the site
  As a logged-in user
  I want to send my friends invitations

  Scenario: As I have invites available and domain credits, I should be able to send out invitation with credits to gift when I input correct information
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I am on the invites page
    Then I should see "You have 5 invites available"
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
    Then I should see "Notification message"

  Scenario: As I have invites available and no domain credits, I should not be able to see credits_to_gift drop box
    Given I logged in with mock data for domains and user info with 0 domain credits and 5 invites available
    And I am on the invites page
    Then I should see "You have 5 invites available"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "test@example.com"
    And I fill in "custom_message" with "hi, check this out!"
    And I should not see item with xpath "//select[@name='credits_to_gift']"

  Scenario: As I have invites available and 2 domain credits, I should be able to see credits_to_gift drop box with options 0, 1, 2 only
    Given I logged in with mock data for domains and user info with 2 domain credits and 5 invites available
    And I am on the invites page
    Then I should see "You have 5 invites available"
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
    And I am on the invites page
    Then I should see "You have 5 invites available"
    And I fill in "first_name" with "East"
    And I fill in "last_name" with "Agile"
    And I fill in "invitation_email" with "testexample.com"
    And I mock sendInvite with status "bad_request"
    And I press "Send"
    Then I should see "Invitation Message"
    Then I should see "Notification message"

  Scenario: As I have invites available, I should not be able to send out invitation when I leave the fields empty
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I am on the invites page
    Then I should see "You have 5 invites available"
    And I press "Send"
    Then I should see "First Name, Last Name and Email can not be blank"

  Scenario: As I have no invites available, I should not be able to send out invitation
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I am on the invites page
    Given I logged in with mock data for domains and user info with 35 domain credits and 0 invites available
    And I am on the invites page
    Then I should see "Sorry, you don't have any invites available right now... check back soon!"
    And I should not see "Send"