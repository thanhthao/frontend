Feature: Blogs
  In order to view blogs
  As a logged-in user
  I want to view all blogs and detail of a blog

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getBlogs return with:
      | id | title         | body                 | author       | published_at         |
      | 1  | My Blog       | This is my blog body | EastAgile    | 2011-10-30T04:21:43Z |
      | 2  | Another Blog  | An interesting new   | Stanyangroup | 2011-10-12T04:21:43Z |
    When I follow "HELP & SUPPORT"
    And I follow "BLOGS"

  Scenario: As a logged in user I want to see all blogs
    Then I should see "My Blog"
    And I should see "This is my blog body"
    And I should see "by EastAgile on Sun Oct 30 2011"
    And I should see "Another Blog"
    And I should see "An interesting new"
    And I should see "by Stanyangroup on Wed Oct 12 2011"

  Scenario: As a logged in user I want to see details of a blog
    And I mock getBlog return with:
      | id | title         | body                 | author       | published_at         |
      | 1  | My Blog       | This is my blog body | EastAgile    | 2011-10-30T04:21:43Z |
    When I follow "My Blog"
    Then I should see "My Blog" within "#content h1"
    And I should see "This is my blog body"
    And I should see "by EastAgile on Sun Oct 30 2011"

  Scenario: As a logged in user I should see an alert if cannot find blog
    And I mock getBlog return false
    And I click Ok on the next confirmation
    When I am on the view blog page with blog_id "23-invalid-blog"
    And I should see "My Blog"
