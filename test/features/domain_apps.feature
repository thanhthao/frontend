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
      |84 |A          |             |184.106.20.102                       |1800|        |
      |85 |A          |             |66.6.44.4                            |1800|        |
      |86 |CNAME      |www          |ea.tumblr.com                        |1800|        |
      |87 |A          |             |216.239.32.21                        |1800|        |
      |88 |A          |             |216.239.34.21                        |1800|        |
      |89 |A          |             |216.239.36.21                        |1800|        |
      |90 |A          |             |216.239.38.21                        |1800|        |
      |91 |CNAME      |www          |ghs.google.com                       |1800|        |
      |92 |A          |             |184.73.237.244                       |1800|        |
      |93 |A          |www          |184.73.237.244                       |1800|        |
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
    When I follow "POSTEROUS"
    Then I should see "POSTEROUS FOR mydomain0.com" within "#content h1"
    And I should see "Posterous DNS settings have been installed into Badger DNS."
    And I should see "Also check out Posterous Custom Domains."
    When I follow "TUMBLR"
    Then I should see "TUMBLR FOR mydomain0.com" within "#content h1"
    And I should see "Tumblr DNS settings have been installed into Badger DNS."
    And I should see "Also check out Tumblr Custom Domains."
    When I follow "BLOGGER"
    Then I should see "BLOGGER FOR mydomain0.com" within "#content h1"
    And I should see "Blogger DNS settings have been installed into Badger DNS."
    And I should see "Also check out Blogger Custom Domains."
    When I follow "FLAVORS ME"
    Then I should see "FLAVORS ME FOR mydomain0.com" within "#content h1"
    And I should see "Flavors Me DNS settings have been installed into Badger DNS."
    And I should see "Also check out Flavors Me Custom Domains."
    When I follow "GOOGLE APP ENGINE"
    Then I should see "GOOGLE APP ENGINE FOR mydomain0.com" within "#content h1"
    And I should see "Google App Engine DNS settings have been installed into Badger DNS."
    And I should see "Also check out Google App Engine Custom Domains."

  Scenario: Install new app
    And I mock getDomain with domain "mydomain0.com"
    And I mock getRecords for domain "mydomain0.com" with records:
      |id |record_type|subdomain    |content                              |ttl |priority|
    And I follow "mydomain0.com"
    When I click on item with xpath "(//a[@class='app_store_container'])[9]"
    And I fill in "shopify_app_url" with "ea.shopify.com"
    And I mock addRecord
    And I press "Install Shopify"
    Then I should see "SHOPIFY FOR mydomain0.com" within "#content h1"
    And I should see "Shopify is now installed! If you haven't already, you'll need to add [mydomain0.com] and [www.mydomain0.com] in your Shopify Preferences"

  Scenario: Install new app unsuccessfully because of conflicts
    And I mock getDomain with domain "mydomain0.com"
    And I mock getRecords for domain "mydomain0.com" with records:
      |id |record_type|subdomain    |content                              |ttl |priority|
      |80 |A          |             |75.101.163.44                        |1800|        |
      |81 |A          |             |75.101.145.87                        |1800|        |
      |82 |A          |             |174.129.212.2                        |1800|        |
      |83 |CNAME      |www          |ea.heroku.com                        |1800|        |
    And I follow "mydomain0.com"
    When I click on item with xpath "(//a[@class='app_store_container'])[9]"
    And I fill in "shopify_app_url" with "ea.shopify.com"
    And I mock addRecord
    When I press "Install Shopify"
    Then I should see "Install Shopify Failed"
    And I should see "Installation failed due to conflict with the following app:"
    And I should see "Heroku" within "table:first tr"
    And I should see "Uninstall" within "table:first tr"