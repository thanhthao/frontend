Feature: Badger DNS
  In order to view all my Badger DNS for my domain
  As a logged-in user
  I want to view and edit settings of Badger DNS for my domain

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getDomain with domain "mydomain0.com"
    And I mock getRecords for domain "mydomain0.com"
    When I visit Badger DNS for domain "mydomain0.com"

  Scenario: When I visit Badger DNS page for my domain, I should see all DNS application I have installed (Email Forwarding ad Google Calendar)
    Then I should see "BADGER DNS FOR mydomain0.com"
    And I should see "A" within "#content table tr:eq(3)"
    And I should see "subdomain.mydomain0.com" within "#content table:first tr:eq(3)"
    And I should see "244.245.123.19" within "#content table tr:eq(3)"
    And I should see "30 mins" within "#content table tr:eq(3)"
    And I should see "Email Forwarding" within "#content table tr:eq(4)"
    And I should see "MX" within "#content table tr:eq(5)"
    And I should see "10 smtp.badger.com" within "#content table tr:eq(5)"
    And I should see "30 mins" within "#content table tr:eq(5)"
    And I should see "TXT" within "#content table tr:eq(6)"
    And I should see "v=spf1 mx mx:rhinonamesmail.com ~all" within "#content table tr:eq(6)"
    And I should see "30 mins" within "#content table tr:eq(6)"
    And I should see "Google Calendar" within "#content table tr:eq(7)"
    And I should see "CNAME" within "#content table tr:eq(8)"
    And I should see "calendar.mydomain0.com" within "#content table tr:eq(8)"
    And I should see "ghs.google.com" within "#content table tr:eq(8)"
    And I should see "30 mins" within "#content table tr:eq(8)"
    And I should see "Settings"

  Scenario: When I visit Badger DNS page for my domain, I can uninstall app
    And I follow "Settings" within "#content table tr:eq(4)"
    And I should see "SETTINGS FOR Email Forwarding"
    And I should see "If you'd like to uninstall this application, click the uninstall button below."
    And I should see "Uninstall Email Forwarding"

  Scenario: When I want to edit a dns and click on save, the edit will be saved
    When I click on item with xpath "//tr[@id='dns-row-78']"
    When I click on item with xpath "(//tr[@id='dns-row-78']/td/div/a)[2]"
    And I fill in "dns-78-edit-name" with "eastagile"
    And I fill in "dns-78-edit-content-ipv4" with "1.2.3.4"
    And I select "1 hour" from "dns-78-edit-ttl"
    And I mock updateRecord with status "ok" for keys:
      | name                    | content   | ttl   |
      | eastagile.mydomain0.com | 1.2.3.4   | 3600  |
    When I click on item with xpath "(//tr[@id='edit-dns-78']/td/a)[1]"
    Then I should see "eastagile.mydomain0.com" within "#content table:first tr:eq(3)"
    And I should see "1.2.3.4" within "#content table tr:eq(3)"
    And I should see "1 hour" within "#content table tr:eq(3)"

  Scenario: When I want to edit a dns and click on cancel, the edit will not be saved
    When I click on item with xpath "//tr[@id='dns-row-78']"
    When I click on item with xpath "(//tr[@id='dns-row-78']/td/div/a)[2]"
    And I fill in "dns-78-edit-name" with "eastagile"
    And I fill in "dns-78-edit-content-ipv4" with "1.2.3.4"
    And I select "1 hour" from "dns-78-edit-ttl"
    When I click on item with xpath "(//tr[@id='edit-dns-78']/td/a)[2]"
    Then I should not see "eastagile.mydomain0.com" within "#content table:first tr:eq(3)"
    And I should not see "1.2.3.4" within "#content table tr:eq(3)"
    And I should not see "1 hour" within "#content table tr:eq(3)"
    And I should see "subdomain.mydomain0.com" within "#content table:first tr:eq(3)"
    And I should see "244.245.123.19" within "#content table tr:eq(3)"
    And I should see "30 mins" within "#content table tr:eq(3)"
