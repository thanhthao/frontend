Feature: Faqs
  In order to view faqs
  As a logged-in user
  I want to see question and answer in faqs section

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getFaqs return with:
      | id | question                       | answer                                                    |
      | 1  | Step to buy a domain?          | Following 3 step below                                    |
      | 2  | How to transfer a domain       | Go to the domain section and click Transfer in a domain   |
    When I follow "HELP & SUPPORT"
    And I follow "FAQS"

  Scenario: As a logged in user I want to see all faqs
    Then I should see "Step to buy a domain?"
    Then I should see "Following 3 step below"
    And I should see "How to transfer a domain"
    And I should see "Go to the domain section and click Transfer in a domain"
