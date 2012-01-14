Feature: Home page
  In order to use the site
  As a logged-in user
  I want to view homepage

  Scenario: view homepage
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    Then I should see "Twitter / Facebook"
    And I should see a link with href "https://twitter.com/badger" with new window
    And I should see a link with href "https://www.facebook.com/BadgerDotCom" with new window
