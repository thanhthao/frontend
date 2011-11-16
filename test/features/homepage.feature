Feature: Home page

  Scenario: As a non-logged in user I want to see homepage
    Given I am on the home page
    Then I should see "Badger.com... a domain registrar that doesn't suck."
    Then I should see "Thanks for visiting! We're not quite ready yet but if you'd like an invite when we are, please enter your email address:"

  Scenario: As a logged in user I want to see homepage
    Given I logged in
    Then I should see "Twitter / Facebook"
    Then I should see a link with href "https://twitter.com/BadgerDotCom" with new window
    Then I should see a link with href "https://www.facebook.com/BadgerDotCom" with new window
