Feature: Register Domain
  In order to buy new domain
  As a logged-in user
  I want to register new domain

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I should see "MY DOMAINS (2)" within "#sidebar"
    And I mock domain search result for keys:
      | key              | com   | net   |
      | mydomain         | true  | false |
    And I fill in "form-search-input" with "mydomain"
    And I wait until xpath "//table[@id='search-results']/td" is visible
    And I should see "mydomain" within "#search-results"
    And I mock getDomainInfo api for domain with registrar name "REGISTRAR NAME"
    And I follow "com"
    Then I should see "Registrant:"
    And I should see "Administrator:"
    And I should see "Billing:"
    And I should see "Technical:"
    And I should see "Keep contact information private"
    And I mock registerDomain api
    And I mock getDomains with 2 normal domains, 1 in transfer domain and 1 expiring soon domains
    And I should not see "MY DOMAINS (3)"
    And I press "register-button"
    And I mock getDomain

  Scenario: I successfully register a domain
    Then I should see "MY DOMAINS (3)" within "#sidebar"
    And I should see "Congratulations!"
    And I should see "You've just registered mydomain.com. Here are some things you can do:"
    And I should see "View domain details"
    And I should see "Modify DNS Settings"
    And I should see "View all Domains"

  Scenario: I successfully register a domain and follow the link to show its detail
    And I follow "View domain details"
    #Then I should see "mydomain.com"

  # Scenario: I successfully register a domain and follow the link to show its dns
  #   And I mock getRecords with empty records
  #   And I follow "Modify DNS Settings"
  #   Then I should see "mydomain.com DNS"
  # 
  # Scenario: I successfully register a domain and follow the link to show its whois
  #   And I follow "Modify WHOIS Settings"
  #   Then I should see "mydomain.com WHOIS"

  Scenario: I successfully register a domain and follow the link to show all domains
    And I follow "View all Domains"
    Then I should see "Transfer in a Domain"
