Feature: Knowledge center
  In order to view knowledge center article
  As a logged-in user
  I want to view knowledge center articles list and detail of a knowledge center article

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getKnowledgeCenterArticles return with:
      | id | title                       | body                                                                     | category                          |
      | 1  | Setup your Gmail            | Ensure that you have correctly set up e-mail forwarding on your website. | How To Send Email From RhinoNames |
      | 2  | How to Reset your Password  | Forgot your password? Not to worry. Resetting it is very easy.           | General                           |
    When I follow "HELP & SUPPORT"
    And I follow "KNOWLEDGE CENTER"

  Scenario: As a logged in user I want to see knowledge center articles list
    Then I should see "Knowledge Center"
    And I should see "How To Send Email From RhinoNames"
    And I should see "Setup your Gmail"
    And I should see "General"
    And I should see "How to Reset your Password"

  Scenario: As a logged in user I want to see details of a knowledge center article
    And I mock getKnowledgeCenterArticle return with:
      | id | title                       | body                                                                     | category                          |
      | 1  | Setup your Gmail            | Ensure that you have correctly set up e-mail forwarding on your website. | How To Send Email From RhinoNames |
    When I follow "Setup your Gmail"
    Then I should see "Setup your Gmail" within "#content h1"
    And I should see "Ensure that you have correctly set up e-mail forwarding on your website."

  Scenario: As a logged in user I should see an alert if cannot find knowledge center article
    And I mock getKnowledgeCenterArticle return false
    And I click Ok on the next confirmation
    When I am on the view blog page with blog_id "23-invalid-kc-article"
    Then I should see "Knowledge Center"
