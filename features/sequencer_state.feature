Feature: Sequencer State Management
  As a composer
  I want to manage notes and tracks in a grid
  So I can build my chiptune composition

  Scenario: Adding a note to a track
    Given a new sequencer state
    When I add a note "C4" at step 1 in "Track 1"
    Then "Track 1" should have a note "C4" at step 1

  Scenario: Monophonic restriction in a track
    Given a new sequencer state
    And there is a note "C4" at step 1 in "Track 1"
    When I add a note "E4" at step 1 in "Track 1"
    Then "Track 1" should only have the note "E4" at step 1
    And "Track 1" should not have the note "C4" at step 1

  Scenario: Updating current step
    Given a new sequencer state
    When the current step is set to 5
    Then the sequencer should indicate step 5 is active

  Scenario: Changing track instrument type
    Given a new sequencer state
    When I set the instrument of "Track 1" to "triangle"
    Then "Track 1" should have "triangle" as instrument type
