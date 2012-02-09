Feature: Badger DNS
  In order to view all my Badger DNS for my domain
  As a logged-in user
  I want to view and edit settings of Badger DNS for my domain

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I mock getDomain with domain "mydomain0.com"
    And I mock getRecords for domain "mydomain0.com" with records:
      |id |record_type|subdomain    |content                              |ttl |priority|
      |78 |A          |subdomain    |244.245.123.19                       |1800|        |
      |79 |MX         |             |smtp.badger.com                      |1800|10      |
      |80 |TXT        |             |v=spf1 mx mx:rhinonamesmail.com ~all |1800|        |
      |81 |CNAME      |calendar     |ghs.google.com                       |1800|        |
      |82 |A          |abc          |123.123.123.123                      |1800|        |
      |83 |A          |abc          |124.123.123.123                      |1800|        |
      |84 |TXT        |             |v=spf2 mx mx:rhinonamesmail.com ~all |1800|        |
      |85 |MX         |             |smtp.eastagile.com                   |1800|10      |
      |86 |MX         |             |smtp.aloha.com                       |1800|20      |
      |87 |CNAME      |blog         |ghs.google.com                       |1800|        |
      |88 |MX         |             |smtp.google.com                      |1800|20      |
    When I visit Badger DNS for domain "mydomain0.com"

  Scenario: When I visit Badger DNS page for my domain, I should see all DNS application I have installed (Email Forwarding ad Google Calendar) in sorted order
    Then I should see "BADGER DNS FOR mydomain0.com"
    And I should see "A" within "#content table tr:eq(3)"
    And I should see "abc.mydomain0.com" within "#content table:first tr:eq(3)"
    And I should see "123.123.123.123" within "#content table tr:eq(3)"
    And I should see "30 mins" within "#content table tr:eq(3)"
    And I should see "A" within "#content table tr:eq(4)"
    And I should see "abc.mydomain0.com" within "#content table:first tr:eq(4)"
    And I should see "124.123.123.123" within "#content table tr:eq(4)"
    And I should see "30 mins" within "#content table tr:eq(4)"
    And I should see "A" within "#content table tr:eq(5)"
    And I should see "subdomain.mydomain0.com" within "#content table:first tr:eq(5)"
    And I should see "244.245.123.19" within "#content table tr:eq(5)"
    And I should see "30 mins" within "#content table tr:eq(5)"
    And I should see "CNAME" within "#content table tr:eq(6)"
    And I should see "blog.mydomain0.com" within "#content table:first tr:eq(6)"
    And I should see "ghs.google.com" within "#content table tr:eq(6)"
    And I should see "30 mins" within "#content table tr:eq(6)"
    And I should see "MX" within "#content table tr:eq(7)"
    And I should see "10 smtp.eastagile.com" within "#content table:first tr:eq(7)"
    And I should see "30 mins" within "#content table tr:eq(7)"
    And I should see "MX" within "#content table tr:eq(8)"
    And I should see "20 smtp.aloha.com" within "#content table:first tr:eq(8)"
    And I should see "30 mins" within "#content table tr:eq(8)"
    And I should see "MX" within "#content table tr:eq(9)"
    And I should see "20 smtp.google.com" within "#content table:first tr:eq(9)"
    And I should see "30 mins" within "#content table tr:eq(9)"
    And I should see "TXT" within "#content table tr:eq(10)"
    And I should see "v=spf2 mx mx:rhinonames" within "#content table:first tr:eq(10)"
    And I should see "30 mins" within "#content table tr:eq(10)"
    And I should see "Email Forwarding" within "#content table tr:eq(11)"
    And I should see "MX" within "#content table tr:eq(12)"
    And I should see "10 smtp.badger.com" within "#content table tr:eq(12)"
    And I should see "30 mins" within "#content table tr:eq(12)"
    And I should see "TXT" within "#content table tr:eq(13)"
    And I should see "v=spf1 mx mx:rhinonames" within "#content table tr:eq(13)"
    And I should see "30 mins" within "#content table tr:eq(13)"
    And I should see "Google Calendar" within "#content table tr:eq(14)"
    And I should see "CNAME" within "#content table tr:eq(15)"
    And I should see "calendar.mydomain0.com" within "#content table tr:eq(15)"
    And I should see "ghs.google.com" within "#content table tr:eq(15)"
    And I should see "30 mins" within "#content table tr:eq(15)"
    And I should see "Settings"

  Scenario: When I visit Badger DNS page for my domain, I can uninstall app
    And I follow "Settings" within "#content table tr:eq(11)"
    And I should see "SETTINGS FOR Email Forwarding"
    And I should see "If you'd like to uninstall this application, click the uninstall button below."
    And I should see "Uninstall Email Forwarding"

  Scenario: When I want to edit a dns and click on save, the edit will be saved
    When I click on item with xpath "//tr[@id='dns-row-78']"
    When I click on item with xpath "(//tr[@id='dns-row-78']/td/div/a)[1]"
    And I fill in "dns-78-edit-subdomain" with "123agile"
    And I fill in "dns-78-edit-content-ipv4" with "1.2.3.4"
    And I select "1 hour" from "dns-78-edit-ttl"
    And I mock updateRecord with status "ok"
    And I mock getRecords for domain "mydomain0.com" with records:
      |id |record_type|subdomain    |content                              |ttl |priority|
      |78 |A          |123agile     |1.2.3.4                              |3600|        |
      |79 |MX         |             |smtp.badger.com                      |1800|10      |
      |80 |TXT        |             |v=spf1 mx mx:rhinonamesmail.com ~all |1800|        |
      |81 |CNAME      |calendar     |ghs.google.com                       |1800|        |
      |82 |A          |abc          |123.123.123.123                      |1800|        |
      |83 |A          |abc          |124.123.123.123                      |1800|        |
      |84 |TXT        |             |v=spf2 mx mx:rhinonamesmail.com ~all |1800|        |
      |85 |MX         |             |smtp.eastagile.com                   |1800|10      |
      |86 |MX         |             |smtp.aloha.com                       |1800|20      |
      |87 |CNAME      |blog         |ghs.google.com                       |1800|        |
      |88 |MX         |             |smtp.google.com                      |1800|20      |
    When I click on item with xpath "(//tr[@id='edit-dns-78']/td/a)[1]"
    Then I should see "123agile.mydomain0.com" within "#content table:first tr:eq(3)"
    And I should see "1.2.3.4" within "#content table tr:eq(3)"
    And I should see "1 hour" within "#content table tr:eq(3)"

  Scenario: When I want to edit a dns and click on cancel, the edit will not be saved
    When I click on item with xpath "//tr[@id='dns-row-78']"
    When I click on item with xpath "(//tr[@id='dns-row-78']/td/div/a)[1]"
    And I fill in "dns-78-edit-subdomain" with "eastagile"
    And I fill in "dns-78-edit-content-ipv4" with "1.2.3.4"
    And I select "1 hour" from "dns-78-edit-ttl"
    When I click on item with xpath "(//tr[@id='edit-dns-78']/td/a)[1]"
    Then I should not see "eastagile.mydomain0.com" within "#content table:first tr:eq(5)"
    And I should not see "1.2.3.4" within "#content table tr:eq(5)"
    And I should not see "1 hour" within "#content table tr:eq(5)"
    And I should see "subdomain.mydomain0.com" within "#content table:first tr:eq(5)"
    And I should see "244.245.123.19" within "#content table tr:eq(5)"
    And I should see "30 mins" within "#content table tr:eq(5)"

  Scenario: When I want to edit a dns but the dns is failed to update, there will be an error message
    When I click on item with xpath "//tr[@id='dns-row-78']"
    When I click on item with xpath "(//tr[@id='dns-row-78']/td/div/a)[1]"
    And I fill in "dns-78-edit-subdomain" with "eastagile"
    And I fill in "dns-78-edit-content-ipv4" with "1.2.3.4"
    And I select "1 hour" from "dns-78-edit-ttl"
    And I mock updateRecord with status "unprocessable_entity"
    When I click on item with xpath "(//tr[@id='edit-dns-78']/td/a)[1]"
    Then I should not see "eastagile.mydomain0.com" within "#content table:first tr:eq(5)"
    And I should not see "1.2.3.4" within "#content table tr:eq(5)"
    And I should not see "1 hour" within "#content table tr:eq(5)"
    And I should see "subdomain.mydomain0.com" within "#content table:first tr:eq(5)"
    And I should see "244.245.123.19" within "#content table tr:eq(5)"
    And I should see "30 mins" within "#content table tr:eq(5)"
    And I should see "Unable to update record"
