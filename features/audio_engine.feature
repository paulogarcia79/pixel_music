Feature: Chiptune Audio Engine
  As a user of the application
  I want the audio engine to initialize retro synthesizers
  So I can hear notes on the grid

  Scenario: Tocar una nota con el sintetizador
    Given que el motor de audio está inicializado
    When envío la orden de tocar la nota "C4" con duración "16n"
    Then el motor debe haber registrado la nota para reproducirla

  Scenario: Tocar una nota con un sintetizador específico
    Given que el motor de audio está inicializado
    When envío la orden de tocar la nota "G4" con duración "8n" usando "triangle"
    Then el motor debe haber registrado la nota para reproducirla
