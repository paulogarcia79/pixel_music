Feature: UI Layout and Device Panel Toggle
  As a user
  I want to toggle the Eurorack Device Panel
  So I can expand my workspace or control parameters

  Scenario: Toggling Device Panel visibility
    Given a mounted application
    Then the Device Panel should be open by default
    When I click the Device Panel header
    Then the Device Panel should indicate it is collapsed
    When I click the Device Panel header again
    Then the Device Panel should indicate it is expanded
