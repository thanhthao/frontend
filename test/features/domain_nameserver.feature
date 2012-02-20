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
    Then I should see "mydomain0.com DNS"
    When I follow "Nameservers"
    Then I should see "Change Your Nameservers"
    And I should see "Please log into Badger.com and manually change your nameservers to:"
    Then I should see "ns1.badger.com"
    Then I should see "ns2.badger.com"
