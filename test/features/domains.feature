Feature: Domains

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available

  Scenario: I should see all pending transfer domains when clicking on Transfers tab with list view
    Then I follow "TRANSFERS"
    Then I should see "DOMAIN TRANSFERS"
    Then I should not see "mydomain0.com"
    And I should see "transfer0.com"
    And I should not see "expiresoon0.com"
    And I should see "pending_transfer_in"
    And I should see "Fri Nov 16 2012"

  Scenario: I should see all expiring soon domains when clicking on Expiring Soon tab
    Then I follow "EXPIRING SOON"
    Then I should see "DOMAINS EXPIRING SOON"
    Then I should not see "mydomain0.com"
    And I should not see "transfer0.com"
    And I should see "expiresoon0.com"
    And I should see "active"
    And I should see "Wed Nov 30 2011"

  Scenario: I should see all domains when clicking on All Domain tab
    Then I should see "mydomain0.com"
    And I should see "transfer0.com"
    And I should see "expiresoon0.com"

  Scenario: View should switch correctly between list view and grid view in Transfers tab
    Given I mock domain search result for keys:
      | key                 | com   | net   |
      | transfer0           | true  | false |
      | East                | true  | false |
      | EastAgileCompany    | true  | false |
      | East-Agile-Company  | true  | false |
      | AgileCompany        | true  | false |
    When I visit grid view "transfers" of domains
    Then I should see "DOMAIN TRANSFERS"
    And I wait until "#grid td" is visible
    And I wait until "#suggest-grid td" is visible
    And I should see "transfer0" within "#grid tbody"
    And I should see "east" within "#suggest-grid tbody"
    And I should see "eastagilecompany" within "#suggest-grid tbody"
    And I should see "agilecompany" within "#suggest-grid tbody"
    And I should see "east-agile-company" within "#suggest-grid tbody"

  Scenario: I should see all expiring soon domains when clicking on Expiring Soon tab with grid view
    Given I mock domain search result for keys:
      | key                 | com   | net   |
      | expiresoon0         | true  | false |
      | East                | true  | false |
      | EastAgileCompany    | true  | false |
      | East-Agile-Company  | true  | false |
      | AgileCompany        | true  | false |
    When I visit grid view "expiringsoon" of domains
    Then I should see "DOMAINS EXPIRING SOON"
    And I wait until "#grid td" is visible
    And I wait until "#suggest-grid td" is visible
    And I should see "expiresoon0" within "#grid tbody"
    And I should see "east" within "#suggest-grid tbody"
    And I should see "eastagilecompany" within "#suggest-grid tbody"
    And I should see "agilecompany" within "#suggest-grid tbody"
    And I should see "east-agile-company" within "#suggest-grid tbody"

  Scenario: I should see all domains when clicking on All Domains tab with grid view
    Given I mock domain search result for keys:
      | key                 | com   | net   |
      | mydomain0           | true  | false |
      | transfer0           | true  | false |
      | expiresoon0         | true  | false |
      | East                | true  | false |
      | EastAgileCompany    | true  | false |
      | East-Agile-Company  | true  | false |
      | AgileCompany        | true  | false |
    When I visit grid view "all" of domains
    And I wait until "#grid td" is visible
    And I wait until "#suggest-grid td" is visible
    And I should see "transfer0" within "#grid tbody"
    And I should see "expiresoon0" within "#grid tbody"
    And I should see "mydomain0" within "#grid tbody"
    And I should see "east" within "#suggest-grid tbody"
    And I should see "eastagilecompany" within "#suggest-grid tbody"
    And I should see "agilecompany" within "#suggest-grid tbody"
    And I should see "east-agile-company" within "#suggest-grid tbody"

  Scenario: I should see notification message if there is no domains when I view all domains
    Given I mock getDomains with 0 normal domains, 0 in transfer domain and 0 expiring soon domains
    Then I follow "TRANSFERS"
    Then I follow "MY DOMAINS"
    Then I should see "It looks like you don't have any domains registered with us yet. You should probably:"
    Then I should see "Search for a new domain"
    Then I should see "Transfer a domain from another registrar"
    Then I should see "Then this page will be a lot more fun."

  Scenario: I should see notification message if there is no domains in transfer when I view Transfers tab
    Given I mock getDomains with 1 normal domains, 0 in transfer domain and 2 expiring soon domains
    Then I follow "TRANSFERS"
    Then I should see "It looks like you don't have any domains in pending transfer."

  Scenario: I should see notification message if there is no domains expiring soon when I view Expiring Soon tab
    Given I mock getDomains with 2 normal domains, 1 in transfer domain and 0 expiring soon domains
    Then I follow "EXPIRING SOON"
    Then I should see "It looks like you don't have any domains expiring soon."