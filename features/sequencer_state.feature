Feature: Sequencer State Management
  As a composer
  I want to manage notes and tracks in a grid
  So I can build my chiptune composition

  Scenario: Adding a note to a track
    Given a new sequencer state
    When I add a note "C4" at step 1 in "Track 1"
    Then "Track 1" should have a note "C4" at step 1

  Scenario: Polyphonic support in a track
    Given a new sequencer state
    And there is a note "C4" at step 1 in "Track 1"
    When I add a note "E4" at step 1 in "Track 1"
    Then "Track 1" should have a note "E4" at step 1
    And "Track 1" should have a note "C4" at step 1

  Scenario: Removing a specific note in a step
    Given a new sequencer state
    And there is a note "C4" at step 1 in "Track 1"
    And there is a note "E4" at step 1 in "Track 1"
    When I remove note "C4" at step 1 from "Track 1"
    Then "Track 1" should have a note "E4" at step 1
    And "Track 1" should not have a note "C4" at step 1

  Scenario: Normalizing monophonic projects for backwards compatibility
    Given a project with monophonic note "G4" at step 5 in "Track 1"
    When I load the project
    Then "Track 1" should have a note "G4" at step 5

  Scenario: Updating current step
    Given a new sequencer state
    When the current step is set to 5
    Then the sequencer should indicate step 5 is active

  Scenario: Changing track instrument type
    Given a new sequencer state
    When I set the instrument of "Track 1" to "triangle"
    Then "Track 1" should have "triangle" as instrument type
