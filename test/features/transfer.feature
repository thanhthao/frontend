Feature: Transfer
  In order to move my current domain registered with other registrar to badger.com
  As a logged-in user
  I want to transfer my domain

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    When I follow "Transfer in a Domain"
    Then I should see "TRANSFER DOMAINS INTO BADGER.COM"
    And I should see "Enter the domain(s) you'd like to transfer in bellow, one per line. If you already have auth codes, include them next to each domain (i.e."
    And I should see "badger.com abc123def"
    And I fill multiple lines in "transfer_domains_list" with:
      """
      abc.com
      abc123.com authen,2
      xyz.com validAuhthenCode
      xyzdomain.com validAuhthenCode
      """

    And I mock getDomainInfo api for domains:
      | name            | registrar_name | locked  | auth_code_response | auth_code_status     | expires              |
      | abc.com         | Talk.com       | true    | 1000               | failed               | 2012-10-30T04:21:43Z |
      | abc123.com      | Talk.com       | false   | 1000               | failed               | 2012-10-30T04:21:43Z |
      | xyz.com         | GoDaddy Inc.   | false   | 1000               | ok                   | 2011-08-12T04:21:43Z |
      | xyzdomain.com   | eNom Inc       | false   | 1000               | ok                   | 2011-02-16T04:21:43Z |
    And I mock remoteWhois with privacy enabled with registrar name "GoDaddy Inc."
    Then I press "Next"

  Scenario: Transfer in domains
    Then I should see "TRANSFER IN DOMAINS"
    And I should see "Name"
    And I should see "Registrar"
    And I should see "Expires"
    And I should see "Auth Code"
    And I should see "Locked"
    And I should see "Privacy"
    And I should see "abc.com" within "table#transfer-domains-table tr:eq(2) td:eq(1)"
    And I should see "Talk.com" within "table#transfer-domains-table tr:eq(2) td:eq(2)"
    And I should see "2012-10-30" within "table#transfer-domains-table tr:eq(2) td:eq(3)"
    And I should see "Yes" within "table#transfer-domains-table tr:eq(2) td:eq(5)"
    And I should see "No" within "table#transfer-domains-table tr:eq(2) td:eq(6)"
    And I should see "abc123.com" within "table#transfer-domains-table tr:eq(3) td:eq(1)"
    And I should see "Talk.com" within "table#transfer-domains-table tr:eq(3) td:eq(2)"
    And I should see "2012-10-30" within "table#transfer-domains-table tr:eq(3) td:eq(3)"
    And I should see "No" within "table#transfer-domains-table tr:eq(3) td:eq(5)"
    And I should see "No" within "table#transfer-domains-table tr:eq(3) td:eq(6)"
    And I should see "xyz.com" within "table#transfer-domains-table tr:eq(4) td:eq(1)"
    And I should see "GoDaddy Inc." within "table#transfer-domains-table tr:eq(4) td:eq(2)"
    And I should see "2011-08-12" within "table#transfer-domains-table tr:eq(4) td:eq(3)"
    And I should see "Ok" within "table#transfer-domains-table tr:eq(4) td:eq(4)"
    And I should see "No" within "table#transfer-domains-table tr:eq(4) td:eq(5)"
    And I should see "Yes" within "table#transfer-domains-table tr:eq(4) td:eq(6)"
    And I should see "xyzdomain.com" within "table#transfer-domains-table tr:eq(5) td:eq(1)"
    And I should see "eNom Inc" within "table#transfer-domains-table tr:eq(5) td:eq(2)"
    And I should see "2011-02-16" within "table#transfer-domains-table tr:eq(5) td:eq(3)"
    And I should see "Ok" within "table#transfer-domains-table tr:eq(5) td:eq(4)"
    And I should see "No" within "table#transfer-domains-table tr:eq(5) td:eq(5)"
    And I should see "No" within "table#transfer-domains-table tr:eq(5) td:eq(6)"
    And I should see "Registrant:"
    And I should see "Import existing DNS into Badger DNS"
    And I check "use_badger_dns"
    When I follow "Continue with 1 Domain"
    And I should see "CONFIRM TRANSFER"
    And I should see "You are about to transfer 1 domain."
    And I mock registerDomain api
    When I follow "Complete Transfer"
    And I should see "TRANSFER RESULT"
    And I should see "xyzdomain.com" within "#transfer-result-table"
    And I should see "Succeed" within "#transfer-result-table"

  Scenario: Transfer in domains: automatically update auth code status after user input
    And I mock getDomainInfo api for domains:
      | name            | registrar_name | locked  | auth_code_response | auth_code_status     | expires              |
      | abc123.com      | Talk.com       | false   | 1000               | ok               | 2012-10-30T04:21:43Z |
    And I fill in item "#abc123-com-domain .auth-code-input" with "ValidAuthcode"
    When I press key "enter" on "#abc123-com-domain .auth-code-input"
    Then I should see "Ok" within "table#transfer-domains-table  tr:eq(3) td:eq(4)"
    And I should see "Continue with 2 Domains"

  Scenario: Transfer in domains: refesh to update domains info
    And I mock getDomainInfo api for domains:
      | name            | registrar_name | locked  | auth_code_response | auth_code_status     | expires              |
      | abc.com         | Talk.com       | false   | 1000               | failed               | 2012-10-30T04:21:43Z |
      | abc123.com      | Talk.com       | false   | 1000               | failed               | 2012-10-30T04:21:43Z |
      | xyz.com         | GoDaddy Inc.   | false   | 1000               | ok                   | 2011-08-12T04:21:43Z |
      | xyzdomain.com   | eNom Inc       | false   | 1000               | ok                   | 2011-02-16T04:21:43Z |
    And I mock remoteWhois with registrar name "GoDaddy Inc."
    When I follow "Retry All"
    And I should see "abc.com" within "table#transfer-domains-table tr:eq(2) td:eq(1)"
    And I should see "Talk.com" within "table#transfer-domains-table tr:eq(2) td:eq(2)"
    And I should see "2012-10-30" within "table#transfer-domains-table tr:eq(2) td:eq(3)"
    And I should see "No" within "table#transfer-domains-table tr:eq(2) td:eq(5)"
    And I should see "No" within "table#transfer-domains-table tr:eq(2) td:eq(6)"
    And I should see "abc123.com" within "table#transfer-domains-table tr:eq(3) td:eq(1)"
    And I should see "Talk.com" within "table#transfer-domains-table tr:eq(3) td:eq(2)"
    And I should see "2012-10-30" within "table#transfer-domains-table tr:eq(3) td:eq(3)"
    And I should see "No" within "table#transfer-domains-table tr:eq(3) td:eq(5)"
    And I should see "No" within "table#transfer-domains-table tr:eq(3) td:eq(6)"
    And I should see "xyz.com" within "table#transfer-domains-table tr:eq(4) td:eq(1)"
    And I should see "GoDaddy Inc." within "table#transfer-domains-table tr:eq(4) td:eq(2)"
    And I should see "2011-08-12" within "table#transfer-domains-table tr:eq(4) td:eq(3)"
    And I should see "Ok" within "table#transfer-domains-table tr:eq(4) td:eq(4)"
    And I should see "No" within "table#transfer-domains-table tr:eq(4) td:eq(5)"
    And I should see "No" within "table#transfer-domains-table tr:eq(4) td:eq(6)"
    And I should see "xyzdomain.com" within "table#transfer-domains-table tr:eq(5) td:eq(1)"
    And I should see "eNom Inc" within "table#transfer-domains-table tr:eq(5) td:eq(2)"
    And I should see "2011-02-16" within "table#transfer-domains-table tr:eq(5) td:eq(3)"
    And I should see "Ok" within "table#transfer-domains-table tr:eq(5) td:eq(4)"
    And I should see "No" within "table#transfer-domains-table tr:eq(5) td:eq(5)"
    And I should see "No" within "table#transfer-domains-table tr:eq(5) td:eq(6)"
    And I should see "Continue with 2 Domain"
