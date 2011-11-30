Feature: Confirm Email
  In order to finish register process
  As a new register user
  I want to confirm my email address

  Scenario: Confirm email with valid confirmation code when I do not log in
    Given I am on the home page
    And I mock neccessary data to mock login with 35 domain credits and 5 invites available
    And I mock confirmEmail with status "ok"
    And I visit the confirm email path
    Then I should see "Forgot your password?"
    And I fill in "email" with "tester@example.com"
    And I fill in "password" with "12345678"
    And I press "Login"
    And The home page is fully loaded
    Then I should see "Confirmation Email Notification message. You can close this window now."
    And I follow "Close"

  Scenario: Confirm email with invalid confirmation code when I do not log in
    Given I am on the home page
    And I mock neccessary data to mock login with 35 domain credits and 5 invites available
    And I mock confirmEmail with status "bad_request"
    And I visit the confirm email path
    Then I should see "Forgot your password?"
    And I fill in "email" with "tester@example.com"
    And I fill in "password" with "12345678"
    And I press "Login"
    And The home page is fully loaded
    And I should see "Confirmation Email Notification message"
    And I follow "Close"

  Scenario: Confirm email with valid confirmation code when I logged in
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock confirmEmail with status "ok"
    And I visit the confirm email path
    Then I should see "Confirmation Email Notification message. You can close this window now."
    And I follow "Close"

  Scenario: Confirm email with invalid confirmation code when I logged in
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock confirmEmail with status "bad_request"
    And I visit the confirm email path
    And I should see "Confirmation Email Notification message"
    And I follow "Close"
    