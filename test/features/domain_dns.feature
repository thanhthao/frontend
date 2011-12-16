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
    And I should see "Email Forwarding" within "#content table tr:eq(4)"
    And I should see "MX" within "#content table tr:eq(5)"
    And I should see "10 smtp.badger.com" within "#content table tr:eq(5)"
    And I should see "TXT" within "#content table tr:eq(6)"
    And I should see "v=spf1 mx mx:rhinonamesmail.com ~all" within "#content table tr:eq(6)"
    And I should see "Google Calendar" within "#content table tr:eq(7)"
    And I should see "CNAME" within "#content table tr:eq(8)"
    And I should see "calendar.mydomain0.com" within "#content table tr:eq(8)"
    And I should see "ghs.google.com" within "#content table tr:eq(8)"
    And I should see "Settings"

  Scenario: When I visit Badger DNS page for my domain, I can uninstall app
    And I follow "Settings" within "#content table tr:eq(4)"
    And I should see "SETTINGS FOR Email Forwarding"
    And I should see "If you'd like to uninstall this application, click the uninstall button below."
    And I should see "Uninstall Email Forwarding"
