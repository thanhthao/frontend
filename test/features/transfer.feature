Feature: Transfer

  Background:
    Given I logged in
    Then I follow "Transfer in a Domain"
    Then I fill in "name" with "abc.com"

  Scenario: Transfer in a domain not from GoDaddy
    Given I mock getDomainInfo api for domain with registrar name "Registrar Name"
    Then I press "Next"
    Then I fill in "auth_code" with "123456"
    Then I press "Next"
    Given I mock registerDomain api
    Then I press "Transfer Domain"
    Then I should see "This transfer will be completed automatically in 5 days. We'll email you when it is done."

  Scenario: Transfer in a domain not from GoDaddy
    Given I mock getDomainInfo api for domain with registrar name "GoDaddy"
    Then I press "Next"
    Then I fill in "auth_code" with "123456"
    Then I press "Next"
    Given I mock registerDomain api
    Then I press "Transfer Domain"
    Then I should see "To complete this transfer immediately, go to godaddy and follow the instructions there."
    Then I should see a link with href "https://dcc.godaddy.com/default.aspx?activeview=transfer&filtertype=3&sa=#" with new window
