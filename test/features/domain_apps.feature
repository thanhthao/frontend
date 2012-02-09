Feature: Domain apps
  In order to manage apps
  As a logged-in user
  I want to view apps installed on domain and install new apps

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available

  Scenario: View apps installed on domain
    And I mock getDomain with domain "mydomain0.com"
    And I mock getRecords for domain "mydomain0.com" with records:
      |id |record_type|subdomain    |content                              |ttl |priority|
      |78 |A          |             |204.93.213.45                        |1800|        |
      |79 |CNAME      |www          |ea.myshopify.com                     |1800|        |
      |80 |A          |             |75.101.163.44                        |1800|        |
      |81 |A          |             |75.101.145.87                        |1800|        |
      |82 |A          |             |174.129.212.2                        |1800|        |
      |83 |CNAME      |www          |ea.heroku.com                        |1800|        |
    When I follow "mydomain0.com"
    Then I should see "mydomain0.com" within "#content h1"
    And I should see "Installed Applications"
    And I should see "Available Applications"
    When I follow "SHOPIFY"
    Then I should see "SHOPIFY FOR mydomain0.com" within "#content h1"
    And I should see "Shopify is now installed! If you haven't already, you'll need to add [mydomain0.com] and [www.mydomain0.com] in your Shopify Preferences"
    When I follow "HEROKU"
    Then I should see "HEROKU FOR mydomain0.com" within "#content h1"
    And I should see "Heroku DNS settings have been installed into Badger DNS."
    And I should see "Also check out Heroku Custom Domains."

  Scenario: Install new app
    And I mock getDomain with domain "mydomain0.com"
    And I mock getRecords for domain "mydomain0.com" with records:
      |id |record_type|subdomain    |content                              |ttl |priority|
      |80 |A          |             |75.101.163.44                        |1800|        |
      |81 |A          |             |75.101.145.87                        |1800|        |
      |82 |A          |             |174.129.212.2                        |1800|        |
      |83 |CNAME      |www          |ea.heroku.com                        |1800|        |
    And I follow "mydomain0.com"
    When I click on item with xpath "(//a[@class='app_store_container'])[11]"
    And I fill in "shopify_app_url" with "ea.shopify.com"
    And I mock addRecord
    And I press "Install Shopify"
    Then I should see "SHOPIFY FOR mydomain0.com" within "#content h1"
    And I should see "Shopify is now installed! If you haven't already, you'll need to add [mydomain0.com] and [www.mydomain0.com] in your Shopify Preferences"
