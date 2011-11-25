Feature: Help and Support

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    Then I follow "HELP & SUPPORT"

  Scenario: As a logged in user I want to see Help and Support page
    Then I should see "HELP AND SUPPORT"
    And I should see "If you've come here looking for help and support, then we've failed somewhere along the way."
    And I should see "Please let us know what went wrong by emailing us at support@badger.com and we'll try to make things better. Sorry!"
