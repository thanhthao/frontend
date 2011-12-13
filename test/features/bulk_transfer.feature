Feature: Bulk Transfer
  In order to transfer many of my current domains to Badger.com
  As a logged-in user
  I want to bulk-transfer my domain

  Scenario: I should be able to bulk-transfer my domains when I have at least one contact and enough credits
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I follow "Transfer in a Domain"
    Then I should see "Bulk Transfer"
    And I follow "Bulk Transfer"
    Then I should see "BULK TRANSFER"
    And I should see "Domains and their corresponding authentication codes, each pair per line:"
    And I should see "Registrant:"
    And I should see "Use Badger DNS"
    And I fill in "transfer_domains_list" with multiple lines "abc.com authen_1\nabc123.com,authen,2"
    And I mock getDomainInfo api for domain with registrar name "Registrar Name"
    And I mock registerDomain api
    And I press "Next"
    Then I should see "CONFIRM TRANSFER"
    And I should see "You are about to transfer 2 domains."
    Then I follow "Complete Transfer"
    And I should see "BULK TRANSFER RESULT"
    And I should see "In processing, please wait..."
    And I should see "abc.com" within "#bulk-transfer-result-table"
    And I should see "abc123.com" within "#bulk-transfer-result-table"
    And I should see "Succeed" within "#bulk-transfer-result-table"

  Scenario: I should be able to bulk-transfer my domains when I have at least one contact but not enough credits
    Given I logged in with mock data for domains and user info with 1 domain credits and 5 invites available
    And I follow "Transfer in a Domain"
    Then I should see "Bulk Transfer"
    And I follow "Bulk Transfer"
    Then I should see "BULK TRANSFER"
    And I should see "Domains and their corresponding authentication codes, each pair per line:"
    And I should see "Registrant:"
    And I should see "Use Badger DNS"
    And I fill in "transfer_domains_list" with multiple lines "abc.com authen_1\nabc123.com,authen,2"
    And I mock getDomainInfo api for domain with registrar name "Registrar Name"
    And I mock getPaymentMethods
    And I press "Next"
    Then I should see "Purchase Credits"
    And I mock accountInfo with 11 domain credits and 5 invites available
    And I mock purchaseCredits
    And I press "purchase-button"
    Then I should see "CONFIRM TRANSFER"
    And I should see "You are about to transfer 2 domains."
    And I mock registerDomain api
    Then I follow "Complete Transfer"
    And I should see "BULK TRANSFER RESULT"
    And I should see "In processing, please wait..."
    And I should see "abc.com" within "#bulk-transfer-result-table"
    And I should see "abc123.com" within "#bulk-transfer-result-table"
    And I should see "Succeed" within "#bulk-transfer-result-table"

  Scenario: I should be able to bulk-transfer my domains when I have no contact but enough credits
    Given I logged in with mock data for domains and user info with 10 domain credits and 5 invites available
    And I mock getContacts returns 0 contacts
    And I follow "Transfer in a Domain"
    Then I should see "Bulk Transfer"
    And I follow "Bulk Transfer"
    Then I should see "Create Profile"
    And I should see "You must have at least one contact profile to bulk-transfer domain."
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
    Then I should see "BULK TRANSFER"
    And I should see "Domains and their corresponding authentication codes, each pair per line:"
    And I should see "Registrant:"
    And I should see "Use Badger DNS"
    And I fill in "transfer_domains_list" with multiple lines "abc.com authen_1\nabc123.com,authen,2"
    And I mock getDomainInfo api for domain with registrar name "Registrar Name"
    And I mock registerDomain api
    And I press "Next"
    Then I should see "CONFIRM TRANSFER"
    And I should see "You are about to transfer 2 domains."
    Then I follow "Complete Transfer"
    And I should see "BULK TRANSFER RESULT"
    And I should see "In processing, please wait..."
    And I should see "abc.com" within "#bulk-transfer-result-table"
    And I should see "abc123.com" within "#bulk-transfer-result-table"
    And I should see "Succeed" within "#bulk-transfer-result-table"

  Scenario: I should be able to bulk-transfer my domains when I have no contact and not enough credits
    Given I logged in with mock data for domains and user info with 1 domain credits and 5 invites available
    And I mock getContacts returns 0 contacts
    And I follow "Transfer in a Domain"
    Then I should see "Bulk Transfer"
    And I follow "Bulk Transfer"
    Then I should see "Create Profile"
    And I should see "You must have at least one contact profile to bulk-transfer domain."
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
    Then I should see "BULK TRANSFER"
    And I should see "Domains and their corresponding authentication codes, each pair per line:"
    And I should see "Registrant:"
    And I should see "Use Badger DNS"
    And I fill in "transfer_domains_list" with multiple lines "abc.com authen_1\nabc123.com,authen,2"
    And I mock getDomainInfo api for domain with registrar name "Registrar Name"
    And I mock registerDomain api
    And I mock getPaymentMethods
    And I press "Next"
    Then I should see "Purchase Credits"
    And I mock accountInfo with 11 domain credits and 5 invites available
    And I mock purchaseCredits
    And I press "purchase-button"
    Then I should see "CONFIRM TRANSFER"
    And I should see "You are about to transfer 2 domains."
    Then I follow "Complete Transfer"
    And I should see "BULK TRANSFER RESULT"
    And I should see "In processing, please wait..."
    And I should see "abc.com" within "#bulk-transfer-result-table"
    And I should see "abc123.com" within "#bulk-transfer-result-table"
    And I should see "Succeed" within "#bulk-transfer-result-table"