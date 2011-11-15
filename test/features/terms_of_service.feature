Feature: Terms of Service

  @javascript
  Scenario: As a logged in user I want to see tems of service
    Given I logged in
    Then I follow "Terms of Service"
    Then I should see "Domain Name Registration Agreement"
    Then I should see "1. Introduction"
    Then I should see "2. Domain Name Registration, Administration, and Renewal Services"
    Then I should see "3. Registration, Renewal, Recovery and Transfer of Domain Names"
    Then I should see "4. Domain Name Dispute Resolution Policy"
    Then I should see "5. Warranties and Obligations"