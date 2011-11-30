Feature: Request Invite
  In order to receive a invitation
  As a guest
  I want to request invite

  Scenario: view the invite request page
    Given I am on the home page
    Then I should see "Badger.com... a different kind of domain registrar."
    And I should see "Thanks for visiting! We're not quite ready yet but if you'd like an invite when we are, please enter your email address:"

  Scenario: request invite successfully
    Given I am on the home page
    And I fill in "email-address" with "myemail@example.com"
    And I mock requestInvite with status "ok"
    And I press "Request Invite"
    Then I should see "Processing... please wait."
    And I should see "Extra Infomation"
    And I should see "What's your name?"
    And I should see "How many domains do you currently registered?"
    And I should see "Have any suggestion for us? (optional)"
    And I fill in "full_name" with "My Full Name"
    And I choose "1-10"
    And I fill in "suggestions" with "My suggestion 1"
    And I mock requestInviteExtraInfo with status "ok"
    And I press "Submit"
    Then I should see "Processing... please wait."
    And I should see "Thanks! We'll get back to you shortly!"

  Scenario: request invite successfully and not fill enough data in extra information
    Given I am on the home page
    And I fill in "email-address" with "myemail@example.com"
    And I mock requestInvite with status "ok"
    And I press "Request Invite"
    Then I should see "Processing... please wait."
    And I should see "Extra Infomation"
    And I should see "What's your name?"
    And I should see "How many domains do you currently registered?"
    And I should see "Have any suggestion for us? (optional)"
    And I press "Submit"
    Then I should see "Full name or number of domains registered can not be empty"

  Scenario: request invite with invalid email
    Given I am on the home page
    And I fill in "email-address" with "myemail.com"
    And I mock requestInvite with status "unprocessable_entity"
    And I press "Request Invite"
    Then I should see "Processing... please wait."
    And I should see "Invalid email address"
