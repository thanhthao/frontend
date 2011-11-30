Feature: Transfer
  In order to move my current domain registered with other registrar to badger.com
  As a logged-in user
  I want to transfer my domain

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    Then I follow "Transfer in a Domain"
    And I fill in "name" with "abc.com"

  Scenario: Transfer in a domain not from GoDaddy
    And I mock getDomainInfo api for domain with registrar name "Registrar Name"
    And I press "Next"
    And I fill in "auth_code" with "123456"
    And I press "Next"
    And I mock registerDomain api
    And I press "Transfer Domain"
    Then I should see "Transfer Request Submitted"
    And I should see "We have submitted your transfer request and will email you when it is complete."

  Scenario: Transfer in a domain not from GoDaddy
    And I mock getDomainInfo api for domain with registrar name "GoDaddy"
    And I press "Next"
    And I fill in "auth_code" with "123456"
    And I press "Next"
    And I mock registerDomain api
    And I press "Transfer Domain"
    Then I should see "Transfer Request Submitted"
    And I should see "If you'd like to manually approve this domain transfer, visit GoDaddy's Pending Transfers"
    And I should see a link with href "https://dcc.godaddy.com/default.aspx?activeview=transfer&filtertype=3&sa=#" with new window
