Feature: Bulk Register
  In order to transfer many of my current domains to Badger.com
  As a logged-in user
  I want to bulk-register my domain

  Scenario: I should be able to bulk-register domains when I have at least one contact and enough credits
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I click on "form-search-input"
    Then I should see "If you would like to register many domains at once, try our Bulk Register Tool."
    And I follow "Bulk Register Tool"
    Then I should see "REGISTER DOMAINS WITH BADGER.COM"
    And I should see "Enter the domain(s) that you'd like to register, one per line:"
    And I fill multiple lines in "domains" with:
      """
      abc.com
      abc123.com
      """
    And I mock getDomain
    And I mock registerDomain api
    And I press "Next"
    Then I should see "REGISTER DOMAINS"
    Then I press "Continue with 2 domains"
    Then I should see "CONFIRMATION: 2 DOMAINS"
    And I should see "Free Options"
    And I should see "Registrant:"
    Then I press "Register for 2 Credits"
    And I should see "REGISTRATION STATUS"
    And I should see "abc.com" within "#transfer-domains-table"
    And I should see "abc123.com" within "#transfer-domains-table"
    And I should see "Success" within "#transfer-domains-table"
    And I follow "Close"

  Scenario: I should be able to bulk-register my domains when I have at least one contact but not enough credits
    Given I logged in with mock data for domains and user info with 1 domain credits and 5 invites available
    And I click on "form-search-input"
    Then I should see "If you would like to register many domains at once, try our Bulk Register Tool."
    And I follow "Bulk Register Tool"
    Then I should see "REGISTER DOMAINS WITH BADGER.COM"
    And I should see "Enter the domain(s) that you'd like to register, one per line:"
    And I fill multiple lines in "domains" with:
      """
      abc.com
      abc123.com
      """
    And I mock getDomain
    And I mock registerDomain api
    And I mock getPaymentMethods
    And I press "Next"
    Then I should see "REGISTER DOMAINS"
    Then I press "Continue with 2 domains"
    Then I should see "CONFIRMATION: 2 DOMAINS"
    And I should see "Free Options"
    And I should see "Registrant:"
    Then I press "Register for 2 Credits"
    Then I should see "Purchase Credits"
    And I mock accountInfo with name "East Agile Company" and 11 domain credits and 5 invites available
    And I mock purchaseCredits
    And I press "purchase-button"
    And I should see "REGISTRATION STATUS"
    And I should see "abc.com" within "#transfer-domains-table"
    And I should see "abc123.com" within "#transfer-domains-table"
    And I should see "Success" within "#transfer-domains-table"
    And I follow "Close"

  Scenario: I should be able to bulk-register my domains when I have no contact but enough credits
    Given I logged in with mock data for domains and user info with 10 domain credits and 5 invites available
    And I mock getContacts returns 0 contacts
    And I click on "form-search-input"
    Then I should see "If you would like to register many domains at once, try our Bulk Register Tool."
    And I follow "Bulk Register Tool"
    Then I should see "Create Profile"
    And I should see "You must have at least one contact profile to register domain."
    And I fill in "first_name" with "East Agile"
    And I fill in "last_name" with "Company"
    And I fill in "email" with "eastagile@example.com"
    And I fill in "phone" with "123456789"
    And I fill in "address" with "Adress 123, ABC street"
    And I fill in "city" with "HCM"
    And I fill in "state" with "1"
    And I fill in "zip" with "84"
    And I select "Vietnam" from "country"
    And I mock getContacts returns 1 contacts
    And I mock createContact
    And I press "Create Profile"
    Then I should see "REGISTER DOMAINS WITH BADGER.COM"
    And I should see "Enter the domain(s) that you'd like to register, one per line:"
    And I fill multiple lines in "domains" with:
      """
      abc.com
      abc123.com
      """
    And I mock getDomain
    And I mock registerDomain api
    And I press "Next"
    Then I should see "REGISTER DOMAINS"
    Then I press "Continue with 2 domains"
    Then I should see "CONFIRMATION: 2 DOMAINS"
    Then I press "Register for 2 Credits"
    And I should see "REGISTRATION STATUS"
    And I should see "abc.com" within "#transfer-domains-table"
    And I should see "abc123.com" within "#transfer-domains-table"
    And I should see "Success" within "#transfer-domains-table"
    And I follow "Close"

  Scenario: I should be able to bulk-register my domains when I have no contact and not enough credits
    Given I logged in with mock data for domains and user info with 1 domain credits and 5 invites available
    And I mock getContacts returns 0 contacts
    And I click on "form-search-input"
    Then I should see "If you would like to register many domains at once, try our Bulk Register Tool."
    And I follow "Bulk Register Tool"
    Then I should see "Create Profile"
    And I should see "You must have at least one contact profile to register domain."
    And I fill in "first_name" with "East Agile"
    And I fill in "last_name" with "Company"
    And I fill in "email" with "eastagile@example.com"
    And I fill in "phone" with "123456789"
    And I fill in "address" with "Adress 123, ABC street"
    And I fill in "city" with "HCM"
    And I fill in "state" with "1"
    And I fill in "zip" with "84"
    And I select "Vietnam" from "country"
    And I mock getContacts returns 1 contacts
    And I mock createContact
    And I press "Create Profile"
    Then I should see "REGISTER DOMAINS WITH BADGER.COM"
    And I should see "Enter the domain(s) that you'd like to register, one per line:"
    And I fill multiple lines in "domains" with:
      """
      abc.com
      abc123.com
      """
    And I mock getDomain
    And I mock registerDomain api
    And I mock getPaymentMethods
    And I press "Next"
    Then I should see "REGISTER DOMAINS"
    Then I press "Continue with 2 domains"
    Then I should see "CONFIRMATION: 2 DOMAINS"
    And I should see "Free Options"
    And I should see "Registrant:"
    Then I press "Register for 2 Credits"
    Then I should see "Purchase Credits"
    And I mock accountInfo with name "East Agile Company" and 11 domain credits and 5 invites available
    And I mock purchaseCredits
    And I press "purchase-button"
    And I should see "REGISTRATION STATUS"
    And I should see "abc.com" within "#transfer-domains-table"
    And I should see "abc123.com" within "#transfer-domains-table"
    And I should see "Success" within "#transfer-domains-table"
    And I follow "Close"
