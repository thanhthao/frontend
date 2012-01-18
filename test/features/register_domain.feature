Feature: Register Domain
  In order to buy new domain
  As a logged-in user
  I want to register new domain

  Scenario: I successfully register a domain
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I should see "MY DOMAINS (2)" within "#sidebar"
    And I mock domain search result for keys:
      | key              | com   | net   | org   |
      | mydomain         | true  | false | true  |
    And I fill in "form-search-input" with "mydomain"
    And I wait until xpath "//table[@id='search-results']/td" is visible
    And I should see "mydomain" within "#search-results"
    And I mock getDomainInfo api for domain with registrar name "REGISTRAR NAME"
    And I follow "com"
    Then I should see "Registrant:"
    And I mock registerDomain api
    And I mock getDomains with 2 normal domains, 1 in transfer domain and 1 expiring soon domains
    And I mock addRecord
    And I mock getRecords with empty records
    And I mock getDomain
    And I press "register-button"
    And I mock getDomain
    Then I should see "MY DOMAINS (3)" within "#sidebar"
    And I should see "Installed Applications"
    And I should see "Available Applications"

  Scenario: I successfully register other extensions of the domain
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I should see "MY DOMAINS (2)" within "#sidebar"
    And I mock domain search result for keys:
      | key              | com   | net   | org   |
      | mydomain         | true  | false | true  |
    And I fill in "form-search-input" with "mydomain"
    And I wait until xpath "//table[@id='search-results']/td" is visible
    And I should see "mydomain" within "#search-results"
    And I mock getDomainInfo api for domain with registrar name "REGISTRAR NAME"
    And I follow "com"
    Then I should see "Registrant:"
    And I mock registerDomain api
    And I mock getDomains with 2 normal domains, 1 in transfer domain and 1 expiring soon domains
    And I mock addRecord
    And I mock getRecords with empty records
    And I mock getDomain
    And I check "extension_org"
    And I press "register-button"
    Then I should see "BULK REGISTER RESULT"
    And I should see "In processing, please wait..."
    And I should see "mydomain.com" within "table#bulk-register-result-table tr:eq(2)"
    And I should see "Succeed" within "table#bulk-register-result-table tr:eq(2)"
    And I should see "mydomain.org" within "table#bulk-register-result-table tr:eq(3)"
    And I should see "Succeed" within "table#bulk-register-result-table tr:eq(3)"

  Scenario: I successfully register domains when I am not yet a user, with no contact, and no credits
    Given I am on the home page
    And I mock domain search result for keys:
      | key              | com   | net   | org   |
      | mydomain         | true  | false | true  |
    And I fill in "form-search-input" with "mydomain"
    And I wait until xpath "//table[@id='search-results']/td" is visible
    And I should see "mydomain" within "#search-results"
    And I mock getDomainInfo api for domain with registrar name "REGISTRAR NAME"
    When I follow "com"
    Then I should see "Create Your Badger.com Account"
    And I fill in "first_name" with "John"
    And I fill in "last_name" with "Doe"
    And I fill in "email" with "john@doe.com"
    And I fill in "password" with "mypassword123"
    And I fill in "confirm_password" with "mypassword123"
    And I check "agree_to_terms"
    And I mock createAccount
    And I mock neccessary data to mock login with 0 domain credits and 0 invites available
    And I mock getContacts returns 0 contacts
    And I mock getAccessToken return with "accessToken123"
    When I press "Create Account"
    Then I should see "Create Profile"
    And I fill in "first_name" with "John"
    And I fill in "last_name" with "Doe"
    And I fill in "email" with "john@doe.com"
    And I fill in "phone" with "123456789"
    And I fill in "address" with "Adress 123, ABC street"
    And I fill in "city" with "HCM"
    And I fill in "state" with "1"
    And I fill in "zip" with "84"
    And I select "Vietnam" from "country"
    And I mock getContacts returns 1 contacts
    And I mock createContact
    When I press "Create Profile"
    Then I should see "Registrant:"
    And I mock registerDomain api
    And I mock getDomains with 2 normal domains, 1 in transfer domain and 1 expiring soon domains
    And I mock addRecord
    And I mock getRecords with empty records
    And I mock getDomain
    And I check "extension_org"
    When I press "register-button"
    Then I should see "Purchase Credits"
    And I mock accountInfo with name "East Agile Company" and 11 domain credits and 5 invites available
    And I mock purchaseCredits
    When I press "purchase-button"
    Then I should see "BULK REGISTER RESULT"
    And I should see "In processing, please wait..."
    And I should see "mydomain.com" within "table#bulk-register-result-table tr:eq(2)"
    And I should see "Succeed" within "table#bulk-register-result-table tr:eq(2)"
    And I should see "mydomain.org" within "table#bulk-register-result-table tr:eq(3)"
    And I should see "Succeed" within "table#bulk-register-result-table tr:eq(3)"
