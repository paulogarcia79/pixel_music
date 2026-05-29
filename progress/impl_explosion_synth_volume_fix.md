# Implementation Map - ExplosionSynth Volume Fix

## Traceability

- **R1** (volume of type Tone.Param<"decibels">) → `should expose a volume Param of type Tone.Param and support setValueAtTime for ExplosionSynth` in `tests/audioEngine.spec.ts`
- **R2** (internal private volumeNode: Tone.Volume) → `should expose a volume Param of type Tone.Param and support setValueAtTime for ExplosionSynth` in `tests/audioEngine.spec.ts`
- **R3** (constructor volume signal assignment) → `should expose a volume Param of type Tone.Param and support setValueAtTime for ExplosionSynth` in `tests/audioEngine.spec.ts`
- **R4** (connect method routes volumeNode) → `should expose a volume Param of type Tone.Param and support setValueAtTime for ExplosionSynth` in `tests/audioEngine.spec.ts`
- **R5** (dispose method frees volumeNode) → `should expose a volume Param of type Tone.Param and support setValueAtTime for ExplosionSynth` in `tests/audioEngine.spec.ts`
