Feature: Site Tour
  In order to see all functions of the page
  As a new register user
  I want to see site tour

  Scenario: Visit site tour after register
    Given I am on the register page
    Then I should see "Create Your Badger.com Account"
    And I fill in "first_name" with "East Agile"
    And I fill in "last_name" with "Company"
    And I fill in "email" with "tester1@eastagile.com"
    And I fill in "password" with "pwd123"
    And I fill in "confirm_password" with "pwd123"
    And I mock neccessary data to mock login with 35 domain credits and 5 invites available
    And I mock createAccount
    Then I press "Submit"
    And The home page is fully loaded
    Then I should see "Welcome to Badger.com!"
    And I should see "We do things a little bit differently around here, so please take a moment to read the next few screens. It will be quick!"
    Then I follow "Next"
    Then I should see "Credits, not a Shopping Cart."
    And I should see "Instead of sending you through a shopping cart and making you checkout each time, we use Credits."
    And I should see "It costs 1 Credit to register, transfer or renew a domain for one year."
    And I should see "If you don't have enough credits, you will be asked to purchase more:"
    And I should see "Credits cost between $10 and $15 depending on how many you buy at once. If you know you will be registering and renewing lots of domains, buying Credits in bulk can save you a ton!"
    And I should see "It looks like your invite code came with 35 free Credits, congrats!"
    Then I follow "Next"
    Then I should see "To search, just start typing."
    And I should see "If you want to search for a new domain, just start typing in the search box and results will appear as you type:"
    And I should see "Registering or renewing a domain costs 1 Credit per year."
    Then I follow "Next"
    Then I should see "Already have a domain? Transfer it!"
    And I should see "If you have a domain registered at another registrar, you can easily transfer it to Badger.com."
    And I should see "Domain transfers cost 1 Credit and will extend your existing registration by one year."
    Then I follow "Next"
    Then I should see "Please give us feedback!"
    And I should see "Feedback from people like you will make Badger.com a better place, so please don't hold back!"
    And I should see "Feel free to email us: support@badger.com."
    And I should see "We hope you enjoy Badger.com!"
    Then I follow "Finish"
    Then I should not see "Please give us feedback!"
    And I should see "MY DOMAINS"
