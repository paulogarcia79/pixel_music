# Requirements - Instruments Expansion

## R1
El sistema DEBE añadir los instrumentos `'fat_square'`, `'retro_laser'` y `'retro_explosion'` a la unión de tipos `InstrumentType` en `src/stores/sequencer.ts`.

## R2
El sistema DEBE registrar `'fat_square'`, `'retro_laser'` y `'retro_explosion'` en la constante `INSTRUMENTS` en `src/components/sequencer/DevicePanel.vue` con sus respectivos metadatos (nombre, icono, categoría).

## R3
MIENTRAS el instrumento activo sea `'retro_laser'` o `'retro_explosion'`, el computed `isPercussion` en `DevicePanel.vue` DEBE evaluar a `true` para ocultar los controles ADSR.

## R4
El sistema DEBE implementar la clase `ExplosionSynth` en `src/audio/AudioEngine.ts` que encapsule un generador de ruido (`Tone.NoiseSynth`), un filtro (`Tone.Filter`) y un nodo de volumen (`Tone.Volume`) con barrido de frecuencia exponencial en `triggerAttackRelease`.

## R5
El sistema DEBE considerar `'retro_laser'` y `'retro_explosion'` como instrumentos de percusión en `setupLoop`, `playNote` y `exportAudioOffline` en `src/audio/AudioEngine.ts`.

## R6
El sistema DEBE incluir `'retro_laser'` en la lista de percusión melódica/tonal en `src/audio/AudioEngine.ts` para que use la nota de la cuadrícula de secuenciación.

## R7
El sistema DEBE instanciar `PolySynth(Synth, ... oscillator: fatsquare)` para `'fat_square'`, `MembraneSynth(... oscillator: sawtooth)` para `'retro_laser'` y `ExplosionSynth` para `'retro_explosion'` en `createSynthByType`.
