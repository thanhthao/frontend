Feature: Terms of Service
  In order to know terms of service
  As a logged-in user
  I want to view terms of service page

  Scenario: As a logged in user I want to see terms of service
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    Then I follow "Terms of Service"
    And I should see "Domain Name Registration Agreement"
    And I should see "1. Introduction"
    And I should see "2. Domain Name Registration, Administration, and Renewal Services"
    And I should see "3. Registration, Renewal, Recovery and Transfer of Domain Names"
    And I should see "4. Domain Name Dispute Resolution Policy"
    And I should see "5. Warranties and Obligations"