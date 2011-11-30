Feature: Register
  In order to use the website
  As an guest
  I want to register new user

  Scenario: register new user successfully
    Given I am on the register page
    Then I should see "Create Your Badger.com Account"
    And I fill in "first_name" with "East Agile"
    And I fill in "last_name" with "Company"
    And I fill in "email" with "tester1@eastagile.com"
    And I fill in "password" with "pwd123"
    And I fill in "confirm_password" with "pwd123"
    And I mock neccessary data to mock login with 35 domain credits and 5 invites available
    And I mock createAccount
    Then I press "Submit"
    And The home page is fully loaded
    Then I should see "Welcome to Badger.com!"
    