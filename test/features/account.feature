Feature: Account
  In order to manage my account
  As a logged-in user
  I want to view and edit profile and setting

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I follow "MY ACCOUNT"

  Scenario: As a logged in user I want to see My Account page
    Then I should see "WHOIS PROFILES"
    And I should see "CREDITS & BILLING"
    And I should see "SETTINGS"
    Then I should see "There's not much to do here yet... maybe give these links a try:"
    And I should see "Whois Profiles"
    And I should see "Credits & Billing"
    And I should see a link with href "#account/profiles"
    And I should see a link with href "#account/billing"

  Scenario: As a logged in user I want to see Whois profiles page
    Then I follow "WHOIS PROFILES"
    And I should see "Create New Profile"
    And I should see "East Agile Company"
    And I should see "tester@eastagile.com"
    And I should see "123456789"
    And I should see "My address"
    And I should see "HCM"
    And I should see "VN"

  Scenario: As a logged in user I want to see Settings page
    Then I follow "SETTINGS"
    And I should see "ACCOUNT SETTINGS"
    And I should see "Change Password"
    And I should see "Change First/Last Name"
    And I should see "Change Email Address"

  Scenario: As a logged in user I want to change my First/Last name
    And I follow "SETTINGS"
    When I follow "Change First/Last Name"
    Then I should see "CHANGE FIRST/LAST NAME"
    And I fill in "first_name" with "John"
    And I fill in "last_name" with "Doe"
    And I mock changeName
    And I mock accountInfo with name "John Doe" and 11 domain credits and 5 invites available
    When I press "Update"
    Then I should see "John Doe" within "#user-nav"

  Scenario: As a logged in user I update my email address successfully
    And I follow "SETTINGS"
    When I follow "Change Email Address"
    Then I should see "CHANGE EMAIL ADDRESS"
    And I fill in "email" with "john@doe.com"
    And I mock changeEmail successfully
    When I press "Update"
    Then I should see "Login"

  Scenario: As a logged in user I fail to update my email address
    And I follow "SETTINGS"
    When I follow "Change Email Address"
    Then I should see "CHANGE EMAIL ADDRESS"
    And I fill in "email" with "john@doe.com"
    And I mock changeEmail unsuccessfully
    When I press "Update"
    Then I should see "Unable to change email"
