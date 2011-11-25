Feature: Transfer

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    Then I follow "Transfer in a Domain"
    Then I fill in "name" with "abc.com"

  Scenario: Transfer in a domain not from GoDaddy
    Given I mock getDomainInfo api for domain with registrar name "Registrar Name"
    Then I press "Next"
    Then I fill in "auth_code" with "123456"
    Then I press "Next"
    Given I mock registerDomain api
    Then I press "Transfer Domain"
    Then I should see "Transfer Request Submitted"
    Then I should see "We have submitted your transfer request and will email you when it is complete."

  Scenario: Transfer in a domain not from GoDaddy
    Given I mock getDomainInfo api for domain with registrar name "GoDaddy"
    Then I press "Next"
    Then I fill in "auth_code" with "123456"
    Then I press "Next"
    Given I mock registerDomain api
    Then I press "Transfer Domain"
    Then I should see "Transfer Request Submitted"
    Then I should see "If you'd like to manually approve this domain transfer, visit GoDaddy's Pending Transfers"
    Then I should see a link with href "https://dcc.godaddy.com/default.aspx?activeview=transfer&filtertype=3&sa=#" with new window
