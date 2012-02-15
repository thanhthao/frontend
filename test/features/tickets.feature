Feature: Tickets
  In order to use ticket system
  As a new register user
  I want to use ticket system

  Background:
    Given I logged in with mock data for domains and user info with 35 domain credits and 5 invites available
    And I follow "MY ACCOUNT"
    And I mock getTickets
    When I follow "SUPPORT TICKETS"

  Scenario: View all pending and closed tickets
    Then I should see "Support Tickets"
    And I should see "Your Pending Tickets"
    And I should see "Subject" within "#content table:first"
    And I should see "Category" within "#content table:first"
    And I should see "Created on" within "#content table:first"
    And I should see "Updated on" within "#content table:first"
    And I should see "Status" within "#content table:first"
    And I should see "Website Bug 0" within "#content table:first tr:eq(2)"
    And I should see "Website Bug" within "#content table:first tr:eq(2)"
    And I should see "1/28/2012" within "#content table:first tr:eq(2)"
    And I should see "1/31/2012" within "#content table:first tr:eq(2)"
    And I should see "open" within "#content table:first tr:eq(2)"
    And I should see "Your Closed Tickets"
    And I should see "Subject" within "#content div:eq(2) table:last"
    And I should see "Category" within "#content div:eq(2) table:last"
    And I should see "Created on" within "#content div:eq(2) table:last"
    And I should see "Updated on" within "#content div:eq(2) table:last"
    And I should see "Status" within "#content div:eq(2) table:last"
    And I should see "Request Feature 0" within "#content div:eq(2) table:last tr:eq(2)"
    And I should see "Request Feature" within "#content div:eq(2) table:last tr:eq(2)"
    And I should see "1/28/2012" within "#content div:eq(2) table:last tr:eq(2)"
    And I should see "1/31/2012" within "#content div:eq(2) table:last tr:eq(2)"
    And I should see "closed" within "#content div:eq(2) table:last tr:eq(2)"

  Scenario: I should view and see all the attachments of the ticket and response, and also be able to response to a ticket
    And I mock getTicket
    When I follow "Website Bug 0"
    Then I should see "Ticket Information"
    And I should see "Status"
    And I should see "open"
    And I should see "Created on"
    And I should see "1/28/2012"
    And I should see "Updated on"
    And I should see "1/31/2012"
    And I should see "Category"
    And I should see "Website Bug"
    And I should see "Subject: Website Bug 0"
    And I should see "Attachments: attachment1.pdf attachment2.pdf"
    And I should see "Some bug found on website"
    And I should see "Admin: Website Bug response"
    And I should see "Attachments: response_attachment.jpg"
    And I fill in "response" with "you're welcome"
    And I mock addResponseTicket
    And I press "Reply"

  Scenario: Create a new ticket
    When I follow "Create a New Ticket"
    Then I should see "Create A New Ticket"
    And I should see "Category:"
    And I should see "Subject:"
    And I should see "Content:"
    And I select "Feature Request" from "category"
    And I fill in "subject" with "Request for new feature"
    And I fill in "content" with "I want to request for new feature"
    And I mock createTicket
    When I press "Submit"
    Then I should see "Support Ticket Created"
    And I should see /You have created a support ticket: "Request for new feature". We will review your ticket and respond to you as quickly as we can. Thank you!/
