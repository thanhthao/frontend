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
    And I mock remoteDNS for domain "abc.com"
    And I mock registerDomain api
    And I press "Next"
    And I press "Next"
    And I press "Transfer abc.com for 1 Credit"
    Then I should see "Transfer Request Submitted"
    And I should see "We have submitted your transfer request and will email you when it is complete."

  Scenario: Transfer in a domain from GoDaddy
    And I mock getDomainInfo api for domain with registrar name "GoDaddy"
    And I press "Next"
    And I fill in "auth_code" with "123456"
    And I mock remoteDNS for domain "abc.com"
    And I mock registerDomain api
    And I press "Next"
    And I press "Next"
    And I press "Transfer abc.com for 1 Credit"
    Then I should see "Transfer Request Submitted"
    And I should see "If you'd like to manually approve this domain transfer, visit GoDaddy's Pending Transfers"
    And I should see a link with href "https://dcc.godaddy.com/default.aspx?activeview=transfer&filtertype=3&sa=#" with new window

  Scenario: Transfer in a domain with importing DNS settings steps
    And I mock getDomainInfo api for domain with registrar name "Registrar Name"
    And I press "Next"
    And I fill in "auth_code" with "123456"
    And I mock remoteDNS for domain "abc.com"
    And I press "Next"
    Then I should see "Reading your current DNS settings, please wait"
    And I should see "Import these records into Badger DNS"
    And I should see "Type" within "#dns-settings tr"
    And I should see "Destination" within "#dns-settings tr"
    And I should see "Host" within "#dns-settings tr"
    And I should see "A" within "#dns-settings"
    And I should see "74.125.71.99" within "#dns-settings"
    And I should see "abc.com." within "#dns-settings"
    And I should see "CNAME" within "#dns-settings"
    And I should see "www.l.abc.com." within "#dns-settings"
    And I should see "www.abc.com." within "#dns-settings"
    And I should see "TXT" within "#dns-settings"
    And I should see "v=spf1 include:_netblocks.abc.com ip4:216.73.93.70/31 ip4:216.73.93.72/31 ~all " within "#dns-settings"
    And I should see "abc.com." within "#dns-settings"
    And I should see "MX" within "#dns-settings"
    And I should see "aspmx.l.abc.com." within "#dns-settings"
    And I should see "abc.com." within "#dns-settings"
    And I mock registerDomain api
    And I press "Next"
    And I press "Transfer abc.com for 1 Credit"
    Then I should see "Transfer Request Submitted"
    And I should see "We have submitted your transfer request and will email you when it is complete."
