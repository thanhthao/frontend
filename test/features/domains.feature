Feature: Domains

  Background:
    Given I logged in with mock data for domains and user info

  Scenario: I should see all pending transfer domains when clicking on Transfers tab
    Then I follow "TRANSFERS"
    Then I should see "MY DOMAINS IN PENDING TRANSFER"
    And I should see "transfer0.com"
    And I should see "pending_transfer_in"
    And I should see "Fri Nov 16 2012"

  Scenario: I should see all pending transfer domains when clicking on Expiring Soon tab
    Then I follow "EXPIRING SOON"
    Then I should see "MY DOMAINS EXPIRING SOON"
    And I should see "expiresoon0.com"
    And I should see "active"
    And I should see "Wed Nov 30 2011"

  Scenario: I should see all domains when clicking on All Domain tab
    Then I follow "TRANSFERS"
    Then I follow "ALL DOMAINS"
    Then I should see "mydomain0.com"
    And I should see "transfer0.com"
    And I should see "expiresoon0.com"

  Scenario: I should see notification message if there is no domains when I view all domains
    Given I mock getDomains with 0 normal domains, 0 in transfer domain and 0 expiring soon domains
    Then I follow "TRANSFERS"
    Then I follow "ALL DOMAINS"
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