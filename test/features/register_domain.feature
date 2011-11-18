Feature: Register Domain

  Background:
    Given I logged in with mock data for domains and user info
    Given I mock domain search result for keys:
      | key              | com   | net   |
      | mydomain         | true  | false |
    Then I fill in "form-search-input" with "mydomain"
    When I wait until xpath "//table[@id='search-results']/td" is visible
    Then I should see "mydomain" within "#search-results"
    And I mock getDomainInfo api for domain with registrar name "REGISTRAR NAME"
    Then I follow "com"
    Then I should see "Registrant:"
    Then I should see "Administrator:"
    Then I should see "Billing:"
    Then I should see "Technical:"
    Then I should see "Keep contact information private"
    Given I mock registerDomain api
    Then I press "register-button"

  Scenario: I successfully register a domain
    Then I should see "Congratulations!"
    Then I should see "You've just registered mydomain.com. Here are some things you can do:"
    Then I should see "View domain details"
    Then I should see "Modify DNS Settings"
    Then I should see "View all Domains"

  Scenario: I successfully register a domain and follow the link to show its detail
    And I follow "View domain details"
    Then I should see "mydomain.com"

  Scenario: I successfully register a domain and follow the link to show its dns
    And I follow "Modify DNS Settings"
    Then I should see "mydomain.com DNS"

  Scenario: I successfully register a domain and follow the link to show its whois
    And I follow "Modify WHOIS Settings"
    Then I should see "mydomain.com WHOIS"

  Scenario: I successfully register a domain and follow the link to show all domains
    And I follow "View all Domains"
    Then I should see "Transfer in a Domain"
