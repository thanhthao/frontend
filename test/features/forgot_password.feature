Feature: Forgot Password
  In order to reset my password when I forgot it
  As a not logged-in user
  I want to receive an email with reset code

  Background:
    Given I am on the home page

  Scenario: I will see an error message when email empty
    And I mock sendPasswordResetEmail
    When I follow "Login"
    And I follow "Forgot your password?"
    Then I should see "Forgot Password"
    When I press "Send Reset Code"
    Then I should see "Email missing" within ".error-message"

  Scenario: I will see an error message if have no account with the email
    And I mock sendPasswordResetEmail
    When I follow "Login"
    And I follow "Forgot your password?"
    Then I should see "Forgot Password"
    And I fill in "email" with "non-user@example.com"
    When I press "Send Reset Code"
    Then I should see "No account registered with this email" within ".error-message"

  Scenario: I want to receive an email with reset pasword code when i input correct email
    And I mock sendPasswordResetEmail
    When I follow "Login"
    And I follow "Forgot your password?"
    Then I should see "Forgot Password"
    And I fill in "email" with "eastagile@example.com"
    When I press "Send Reset Code"
    Then I should see "An email has been sent to eastagile@example.com with a password reset code." within ".success-message"

  Scenario: I will see error message when I follow reset password link with wrong reset pasword code
    And I follow the reset password link for email "eastagile@example.com" with code "invalid"
    Then I should see "Enter your new password"
    And I fill in "new_password" with "myNEWpass"
    And I fill in "confirm_password" with "myNEWpass"
    And I mock resetPasswordWithCode
    When I press "Update"
    Then I should see "Invalid Code" within ".error-message"

  Scenario: I will see error message when I follow reset password link and fill in not matched password and password confirmation
    And I follow the reset password link for email "eastagile@example.com" with code "AcX3cd7678"
    Then I should see "Enter your new password"
    And I fill in "new_password" with "myNEWpass"
    And I fill in "confirm_password" with "myNEWpass1"
    When I press "Update"
    Then I should see "Passwords do not match" within ".error-message"

  Scenario: I want to reset my password when I follow reset password link
    And I follow the reset password link for email "eastagile@example.com" with code "invalid_code"
    Then I should see "Enter your new password"
    And I fill in "new_password" with "myNEWpass"
    And I fill in "confirm_password" with "myNEWpass"
    And I mock resetPasswordWithCode
    When I press "Update"
    Then I should see "Password reset" within ".success-message"

