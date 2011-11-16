Feature: Register Domain

  Background:
    Given I logged in
    Given I mock domain search result for key "mydomain"
    Then I fill in "form-search-input" with "mydomain"
    When I wait until xpath "//table[@id='search-results']/td" is visible
    Then I should see "mydomain" within "#search-results"
    And I follow "com"
    Then I should see "Contact Information"
    Then I should see "Advanced"
    Then I should see "Registrant:"
    Then I should see "Keep contact information private"
    Given I mock registerDomain api
    Then I press "register-button"

  Scenario: I successfully register a domain
    Then I should see "Congratulations!"
    Then I should see "This domain will be ready to use in 15-30 seconds. Here are some things you can do:"
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
