Feature: Nameserver setting
  In order to edit nameserver setting for my domain
  As a logged-in user
  I want to view and edit settings of nameserver for my domain

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getDomain with domain "mydomain0.com"
    And I mock getRecords for domain "mydomain0.com"
    When I visit Badger DNS for domain "mydomain0.com"

  Scenario: When I choose to edit nameserver settings, I should be able to have many options of nameserver to choose from
    Then I should see "BADGER DNS FOR mydomain0.com"
    When I follow "Settings"
    Then I should see "mydomain0.com NAMESERVERS"
    And I should see "BADGER DNS"
    And I should see "EXTERNAL"
    When I choose "radio-nameservers-remote"
    Then I should see "DNS Provider"
    And I should see "Name Servers"
    When I select "smartname.com" from "name_server_select"
    Then I should see "ms2.smartname.com"
    And I should see "ns1.smartname.com"
    And I should see "ns2.smartname.com"
    And I should see "ns3.smartname.com"
    And I should see "ns4.smartname.com"
