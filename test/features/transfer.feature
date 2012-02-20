Feature: Transfer
  In order to move my current domain registered with other registrar to badger.com
  As a logged-in user
  I want to transfer my domain

  Scenario: I should be able to transfer domains
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    When I follow "Transfer in a Domain"
    Then I should see "TRANSFER DOMAINS INTO BADGER.COM"
    And I should see "Enter the domain(s) that you'd like to transfer, one per line:"
    And I fill multiple lines in "domains" with:
      """
      abc.com
      abc123.com
      """
    And I mock getDomain
    And I mock registerDomain api
    And I mock getPaymentMethods
    And I press "Next"
    Then I should see "TRANSFER IN DOMAINS"
    Then I press "Continue with 2 domains"
    Then I should see "CONFIRMATION: 2 DOMAINS"
    And I should see "Free Options"
    And I should see "Registrant:"
    Then I press "Register for 2 Credits"
    And I should see "REGISTRATION STATUS"
    And I should see "abc.com" within "#transfer-domains-table"
    And I should see "abc123.com" within "#transfer-domains-table"
    And I should see "Success" within "#transfer-domains-table"
    And I follow "Close"
