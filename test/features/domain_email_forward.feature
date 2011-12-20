Feature: Email Forward
  In order to edit and view all my email forward setting
  As a logged-in user
  I want to view and edit settings of email forward for my domain

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getDomain with domain "mydomain0.com"
    And I mock getEmailForwards for domain "mydomain0.com"
    When I visit Email Forwarding for domain "mydomain0.com"

  Scenario: When I have wildcard email, I should be able to see it display with the "*" character
    Then I should see "mydomain0.com EMAIL FORWARD"
    And I should see "*@mydomain0.com" within "#id-"
    And I should see "*@abc.com" within "#id-"
    And I should see "abc@mydomain0.com" within "#id-abc"
    And I should see "abc@abc.com" within "#id-abc"

  Scenario: When I delete an email forwarding, it should be removed from the page
    And I mock deleteEmailForwards for domain "mydomain0.com"
    When I click on item with xpath "//tr[@id='id-abc']/td/a"
    And I click "Ok" on the confirmation
    Then I should not see "abc@abc.com"
    And I should not see "abc@mydomain0.com"
