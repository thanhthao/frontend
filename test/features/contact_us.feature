Feature: Contact Us
  In order to contact badger.com
  As a logged-in user
  I want to send a message to badger.com

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I follow "Contact Us"

  @javascript
  Scenario: As a logged in user I want to see Contact Us page
    Then I should see "Contact Us"
    And I should see "You can also email us directly at support@badger.com or call us at 415-787-5050."
    And I should see "Send Us an Email"

  @javascript
  Scenario: I can send message through Contact Us page
    And I fill in "subject" with "Testing Subject"
    And I fill in "body" with "Test body"
    And I mock sendEmail
    And I press "Send"
    Then I should see "Your email has been sent!"